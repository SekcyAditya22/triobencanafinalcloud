<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\ChatMessage;
use App\Events\MessageSent;
use App\Events\ChatMessageReceived;
use App\Events\ChatNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function index()
    {
        try {
            $query = Chat::with(['content', 'admin', 'customer', 'messages']);

            // Jika user adalah admin, tampilkan chat yang terkait dengan admin tersebut
            if (auth()->user()->hasRole('admin')) {
                $query->where('admin_id', auth()->id());
            } else {
                // Jika user adalah customer, tampilkan chat milik customer tersebut
                $query->where('customer_id', auth()->id());
            }

            $isAdmin = auth()->user()->hasRole('admin');
            
            $chats = $query->get()->map(function ($chat) use ($isAdmin) {
                $lastMessage = $chat->messages()->latest()->first();
                
                return [
                    'id' => $chat->id,
                    'content_name' => $chat->content ? $chat->content->title : 'Tidak ada judul',
                    'admin_name' => $chat->admin ? $chat->admin->name : 'Admin',
                    'customer_name' => $chat->customer->name,
                    'chat_with' => $isAdmin ? $chat->customer->name : $chat->admin->name,
                    'last_message' => $lastMessage ? $lastMessage->message : null,
                    'unread_count' => $chat->messages()
                        ->where('is_admin', !$isAdmin)
                        ->where('read', false)
                        ->count()
                ];
            });

            return response()->json($chats);
        } catch (\Exception $e) {
            Log::error('Chat index error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Creating new chat', $request->all());
            
            // Validasi request
            $request->validate([
                'content_id' => 'required|exists:contents,id'
            ]);

            // Ambil content untuk mendapatkan user_id (admin)
            $content = \App\Models\Content::findOrFail($request->content_id);

            // Cek apakah chat sudah ada
            $existingChat = Chat::where('content_id', $request->content_id)
                ->where('customer_id', auth()->id())
                ->first();

            if ($existingChat) {
                return response()->json([
                    'id' => $existingChat->id,
                    'content_name' => $existingChat->content->title,
                    'admin_name' => $existingChat->admin ? $existingChat->admin->name : 'Admin',
                    'customer_name' => $existingChat->customer->name,
                    'chat_with' => $existingChat->admin->name,
                    'last_message' => $existingChat->messages()->latest()->first()?->message
                ]);
            }

            // Buat chat baru dengan admin_id dari content
            $chat = Chat::create([
                'content_id' => $request->content_id,
                'customer_id' => auth()->id(),
                'admin_id' => $content->user_id
            ]);

            // Buat pesan awal
            ChatMessage::create([
                'chat_id' => $chat->id,
                'user_id' => auth()->id(),
                'message' => 'Halo, saya tertarik dengan rental kendaraan Anda.',
                'is_admin' => false,
                'read' => false
            ]);

            // Load relasi yang diperlukan
            $chat->load('content', 'admin', 'customer', 'messages');

            return response()->json([
                'id' => $chat->id,
                'content_name' => $chat->content->title,
                'admin_name' => $chat->admin->name,
                'customer_name' => $chat->customer->name,
                'chat_with' => $chat->admin->name,
                'last_message' => 'Halo, saya tertarik dengan rental kendaraan Anda.'
            ]);
        } catch (\Exception $e) {
            Log::error('Chat store error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function messages($chatId)
    {
        try {
            $chat = Chat::findOrFail($chatId);
            
            // Validasi akses
            if (!auth()->user()->hasRole('admin') && $chat->customer_id !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            if (auth()->user()->hasRole('admin') && $chat->admin_id !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $messages = ChatMessage::where('chat_id', $chatId)
                ->orderBy('created_at')
                ->with('user')
                ->get()
                ->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'message' => $message->message,
                        'is_admin' => $message->is_admin,
                        'created_at' => $message->created_at->toIso8601String(),
                        'user' => $message->user
                    ];
                });

            // Update read status
            ChatMessage::where('chat_id', $chatId)
                ->where('is_admin', auth()->user()->hasRole('admin'))
                ->where('read', false)
                ->update(['read' => true]);

            return response()->json($messages);
        } catch (\Exception $e) {
            \Log::error('Chat messages error: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal memuat pesan'], 500);
        }
    }

    public function sendMessage(Request $request, $chatId)
    {
        try {
            Log::info('Sending message request:', [
                'chat_id' => $chatId,
                'user' => auth()->user()->id,
                'request' => $request->all()
            ]);

            $request->validate([
                'message' => 'required|string',
                'is_admin' => 'required|boolean'
            ]);

            $chat = Chat::findOrFail($chatId);
            $isAdmin = auth()->user()->hasRole('admin');

            // Validasi akses
            if ($isAdmin && $chat->admin_id !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized - Invalid admin'], 403);
            }
            if (!$isAdmin && $chat->customer_id !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized - Invalid customer'], 403);
            }

            // Pastikan is_admin sesuai dengan role
            if ($request->is_admin !== $isAdmin) {
                return response()->json(['error' => 'Invalid sender type'], 400);
            }

            try {
                $message = ChatMessage::create([
                    'chat_id' => $chatId,
                    'user_id' => auth()->id(),
                    'message' => $request->message,
                    'is_admin' => $isAdmin,
                    'read' => false
                ]);

                $message->load('user');

                // Format pesan untuk broadcast
                $messageData = [
                    'id' => $message->id,
                    'message' => $message->message,
                    'is_admin' => $message->is_admin,
                    'created_at' => $message->created_at,
                    'user' => $message->user
                ];

                try {
                    // Broadcast ke channel chat spesifik
                    $event = new MessageSent($message);
                    broadcast($event)->toOthers();
                    Log::info('Message broadcast sent', ['event' => get_class($event)]);

                    // Broadcast ke channel notifikasi penerima
                    $recipientId = $isAdmin ? $chat->customer_id : $chat->admin_id;
                    broadcast(new ChatNotification('new_message', [
                        'user_id' => $recipientId,
                        'chat_id' => $chatId,
                        'message' => $messageData
                    ]))->toOthers();
                    \Log::info('Notification broadcast sent successfully');

                } catch (\Exception $e) {
                    Log::error('Broadcasting error:', [
                        'message' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }

                return response()->json($messageData);

            } catch (\Exception $e) {
                \Log::error('Database error: ' . $e->getMessage());
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Send message error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Gagal mengirim pesan',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    // Method untuk mendapatkan jumlah pesan yang belum dibaca
    public function getUnreadCount()
    {
        try {
            $isAdmin = auth()->user()->hasRole('admin');
            $query = Chat::query();

            if ($isAdmin) {
                $query->where('admin_id', auth()->id());
            } else {
                $query->where('customer_id', auth()->id());
            }

            $count = $query->whereHas('messages', function ($q) use ($isAdmin) {
                $q->where('is_admin', !$isAdmin)
                    ->where('read', false);
            })->count();

            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            Log::error('Get unread count error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
} 
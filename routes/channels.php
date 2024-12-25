<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Chat;

// Channel untuk notifikasi user
Broadcast::channel('notifications.user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Channel untuk notifikasi admin
Broadcast::channel('notifications.admin.{id}', function ($user, $id) {
    return $user->hasRole('admin') && (int) $user->id === (int) $id;
});

// Channel untuk chat
Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    $chat = Chat::find($chatId);
    if (!$chat) return false;

    $isAdmin = $user->hasRole('admin');
    return ($isAdmin && $chat->admin_id === $user->id) || 
           (!$isAdmin && $chat->customer_id === $user->id);
});

// Channel untuk notifikasi chat
Broadcast::channel('notifications.chat.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
}); 
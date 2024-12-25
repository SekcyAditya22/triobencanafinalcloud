<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $recipientId;
    public $isAdmin;

    public function __construct($message, $recipientId, $isAdmin)
    {
        $this->message = $message;
        $this->recipientId = $recipientId;
        $this->isAdmin = $isAdmin;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('notifications.' . ($this->isAdmin ? 'admin' : 'user') . '.' . $this->recipientId);
    }

    public function broadcastAs()
    {
        return 'chat.message';
    }
} 
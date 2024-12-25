<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $fillable = ['content_id', 'customer_id', 'admin_id'];
    
    protected $with = ['content', 'customer', 'admin', 'messages'];

    public function content()
    {
        return $this->belongsTo(Content::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class);
    }
} 
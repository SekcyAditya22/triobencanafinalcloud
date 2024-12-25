<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentImage extends Model
{
    protected $fillable = ['content_id', 'url', 'path'];

    public function content()
    {
        return $this->belongsTo(Content::class);
    }
} 
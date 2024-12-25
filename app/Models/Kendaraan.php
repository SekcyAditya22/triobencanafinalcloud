<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kendaraan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content_id',
        'vehicle_category_id',
        'title',
        'description',
        'unit',
        'price_per_day',
        'photos',
        'selected_attributes',
        'status'
    ];

    protected $casts = [
        'selected_attributes' => 'array',
        'photos' => 'array',
        'price_per_day' => 'decimal:2',
        'unit' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function content()
    {
        return $this->belongsTo(Content::class);
    }
} 
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminTransaction extends Model
{
    protected $fillable = [
        'admin_id',
        'title',
        'description',
        'status',
        'payment_status',
        'amount',
        'snap_token',
        'payment_time',
        'approved_at',
        'rejected_at',
        'rejection_reason'
    ];

    protected $attributes = [
        'payment_status' => 'unpaid',
        'amount' => 500000,
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
} 
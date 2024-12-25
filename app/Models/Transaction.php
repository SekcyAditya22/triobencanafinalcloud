<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'total_amount',
        'payment_status',
        'approval_status',
        'snap_token',
        'payment_url',
        'payment_type'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function details()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function kendaraans()
    {
        return $this->hasManyThrough(Kendaraan::class, TransactionDetail::class);
    }
} 
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    protected $fillable = [
        'transaction_id',
        'kendaraan_id',
        'quantity',
        'price_per_day'
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function kendaraan()
    {
        return $this->belongsTo(Kendaraan::class);
    }
} 
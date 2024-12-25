<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleAttribute extends Model
{
    protected $fillable = ['name', 'type', 'options', 'required', 'vehicle_category_id'];

    protected $casts = [
        'options' => 'array',
        'required' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(VehicleCategory::class, 'vehicle_category_id');
    }
} 
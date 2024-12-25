<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleCategory extends Model
{
    protected $fillable = ['name', 'slug', 'description'];

    public function attributes()
    {
        return $this->belongsToMany(VehicleAttribute::class, 'category_attribute')
            ->withPivot('order')
            ->orderBy('order');
    }

    public function vehicles()
    {
        return $this->hasMany(Kendaraan::class);
    }
} 
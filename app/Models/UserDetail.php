<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class UserDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'profile_picture',
        'ktp_number',
        'ktp_picture',
        'phone',
        'address',
        'province_id',
        'regency_id',
        'district_id',
        'village_id',
        'province_name',
        'regency_name',
        'district_name',
        'village_name',
    ];

    protected function profilePicture(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? str_replace('public/', '', $value) : null,
        );
    }

    protected function ktpPicture(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? str_replace('public/', '', $value) : null,
        );
    }

    protected function ktpNumber(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value,
            set: fn ($value) => $value ? $value : null,
        );
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('vehicle_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('type');
            $table->json('options')->nullable();
            $table->boolean('required')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('vehicle_attributes');
    }
}; 
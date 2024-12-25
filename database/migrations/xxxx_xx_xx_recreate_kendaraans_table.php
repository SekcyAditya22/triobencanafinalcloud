<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Backup data yang ada
        $kendaraans = DB::table('kendaraans')->get();
        
        // Drop tabel lama
        Schema::dropIfExists('kendaraans');

        // Buat tabel baru
        Schema::create('kendaraans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('content_id')->constrained()->onDelete('cascade');
            $table->string('vehicle_category_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('selected_attributes')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        // Restore data jika ada
        if ($kendaraans->count() > 0) {
            foreach ($kendaraans as $kendaraan) {
                DB::table('kendaraans')->insert([
                    'id' => $kendaraan->id,
                    'user_id' => $kendaraan->user_id,
                    'content_id' => $kendaraan->content_id ?? null,
                    'vehicle_category_id' => (string) $kendaraan->vehicle_category_id,
                    'title' => $kendaraan->title,
                    'description' => $kendaraan->description,
                    'selected_attributes' => $kendaraan->selected_attributes,
                    'status' => $kendaraan->status,
                    'created_at' => $kendaraan->created_at,
                    'updated_at' => $kendaraan->updated_at,
                ]);
            }
        }
    }

    public function down()
    {
        Schema::dropIfExists('kendaraans');
    }
}; 
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('kendaraans', function (Blueprint $table) {
            // Hapus foreign key dan kolom lama
            $table->dropForeign(['vehicle_category_id']);
            $table->dropColumn('vehicle_category_id');
        });

        Schema::table('kendaraans', function (Blueprint $table) {
            // Buat kolom baru dengan tipe string
            $table->string('vehicle_category_id')->after('user_id');
        });
    }

    public function down()
    {
        Schema::table('kendaraans', function (Blueprint $table) {
            // Hapus kolom string
            $table->dropColumn('vehicle_category_id');
        });

        Schema::table('kendaraans', function (Blueprint $table) {
            // Kembalikan ke foreign key
            $table->foreignId('vehicle_category_id')->after('user_id')->constrained()->onDelete('cascade');
        });
    }
}; 
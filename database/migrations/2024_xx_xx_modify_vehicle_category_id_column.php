<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('kendaraans', function (Blueprint $table) {
            // Hapus foreign key constraint
            $table->dropForeign(['vehicle_category_id']);
            // Ubah tipe kolom
            $table->string('vehicle_category_id')->change();
        });
    }

    public function down()
    {
        Schema::table('kendaraans', function (Blueprint $table) {
            $table->foreignId('vehicle_category_id')->change();
            $table->foreign('vehicle_category_id')->references('id')->on('vehicle_categories')->onDelete('cascade');
        });
    }
}; 
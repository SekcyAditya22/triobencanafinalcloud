<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            // Tambahkan kolom setelah kolom status
            $table->after('status', function (Blueprint $table) {
                $table->string('province')->nullable();
                $table->string('regency_id')->nullable();
                $table->string('district_id')->nullable();
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            $table->dropColumn(['province', 'regency_id', 'district_id']);
        });
    }
}; 
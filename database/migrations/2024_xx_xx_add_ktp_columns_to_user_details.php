<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('user_details', function (Blueprint $table) {
            $table->string('ktp_number')->nullable()->after('profile_picture');
            $table->string('ktp_picture')->nullable()->after('ktp_number');
        });
    }

    public function down()
    {
        Schema::table('user_details', function (Blueprint $table) {
            $table->dropColumn(['ktp_number', 'ktp_picture']);
        });
    }
}; 
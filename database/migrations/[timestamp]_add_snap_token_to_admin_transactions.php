<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('admin_transactions', function (Blueprint $table) {
            $table->string('snap_token')->nullable()->after('payment_status');
        });
    }

    public function down()
    {
        Schema::table('admin_transactions', function (Blueprint $table) {
            $table->dropColumn('snap_token');
        });
    }
}; 
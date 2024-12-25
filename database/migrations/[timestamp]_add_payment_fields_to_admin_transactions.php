<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('admin_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('admin_transactions', 'payment_status')) {
                $table->string('payment_status')->default('unpaid');
            }
            if (!Schema::hasColumn('admin_transactions', 'amount')) {
                $table->decimal('amount', 10, 2)->default(500000);
            }
            if (!Schema::hasColumn('admin_transactions', 'snap_token')) {
                $table->string('snap_token')->nullable();
            }
            if (!Schema::hasColumn('admin_transactions', 'payment_time')) {
                $table->timestamp('payment_time')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('admin_transactions', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'amount', 'snap_token']);
        });
    }
}; 
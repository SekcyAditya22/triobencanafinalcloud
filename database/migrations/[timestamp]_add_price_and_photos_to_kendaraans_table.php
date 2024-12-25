<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('kendaraans', function (Blueprint $table) {
            $table->decimal('price_per_day', 12, 2)->after('unit');
            $table->json('photos')->nullable()->after('price_per_day');
        });
    }

    public function down()
    {
        Schema::table('kendaraans', function (Blueprint $table) {
            $table->dropColumn(['price_per_day', 'photos']);
        });
    }
}; 
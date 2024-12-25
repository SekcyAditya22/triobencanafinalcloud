use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPaymentColumnsToTransactions extends Migration
{
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('payment_url')->nullable();
            $table->string('payment_status')->default('pending');
            $table->string('payment_type')->nullable();
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('payment_url');
            $table->dropColumn('payment_status');
            $table->dropColumn('payment_type');
        });
    }
} 
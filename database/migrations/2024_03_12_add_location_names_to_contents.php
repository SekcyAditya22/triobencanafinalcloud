use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLocationNamesToContents extends Migration
{
    public function up()
    {
        Schema::table('contents', function (Blueprint $table) {
            $table->string('regency_name')->nullable()->after('regency_id');
            $table->string('district_name')->nullable()->after('district_id');
        });
    }

    public function down()
    {
        Schema::table('contents', function (Blueprint $table) {
            $table->dropColumn('regency_name');
            $table->dropColumn('district_name');
        });
    }
} 
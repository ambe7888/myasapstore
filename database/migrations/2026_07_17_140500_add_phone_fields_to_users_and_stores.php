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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'country_code')) {
                $table->string('country_code', 10)->nullable()->after('phone');
            }
        });

        Schema::table('stores', function (Blueprint $table) {
            if (!Schema::hasColumn('stores', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'phone')) {
                $table->dropColumn('phone');
            }
            if (Schema::hasColumn('users', 'country_code')) {
                $table->dropColumn('country_code');
            }
        });

        Schema::table('stores', function (Blueprint $table) {
            if (Schema::hasColumn('stores', 'phone')) {
                $table->dropColumn('phone');
            }
        });
    }
};

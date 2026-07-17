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
        if (Schema::hasTable('users') && Schema::hasTable('plans')) {
            if (!Schema::hasColumn('users', 'plan_id')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->unsignedBigInteger('plan_id')->nullable()->after('type');
                });
            }

            Schema::table('users', function (Blueprint $table) {
                $table->foreign('plan_id')->references('id')->on('plans')->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['plan_id']);
            });
        }
    }
};
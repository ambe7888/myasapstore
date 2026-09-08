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
        // The table has always had a *correct* composite unique constraint
        // on (slug, store_id) — a leftover column-level unique() on slug
        // alone also snuck in, wrongly forcing category slugs to be unique
        // across every store instead of just within one.
        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique('categories_slug_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->unique('slug');
        });
    }
};

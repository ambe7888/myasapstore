<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Currency;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Re-populate currencies table with only XOF, EUR, USD
        DB::table('currencies')->delete();

        $currencies = [
            ['name' => 'Franc CFA (XOF)', 'code' => 'XOF', 'symbol' => 'FCFA', 'description' => 'Franc CFA (XOF)', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Euro', 'code' => 'EUR', 'symbol' => '€', 'description' => 'Euro', 'is_default' => false, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'US Dollar', 'code' => 'USD', 'symbol' => '$', 'description' => 'United States Dollar', 'is_default' => false, 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('currencies')->insert($currencies);

        // 2. Update defaultCurrency in settings table if it exists
        DB::table('settings')->where('name', 'defaultCurrency')->update(['value' => 'XOF']);
        DB::table('settings')->where('name', 'currencySymbolPosition')->update(['value' => 'after']);
        DB::table('settings')->where('name', 'decimalFormat')->update(['value' => '0']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

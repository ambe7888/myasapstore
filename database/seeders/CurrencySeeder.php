<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if currency data already exists, if yes then skip
        if (Currency::count() > 0) {
            $this->command->info('Currency data already exists. Skipping seeder to preserve existing data.');
            return;
        }


        $currencies = [
            ['name' => 'Franc CFA (XOF)', 'code' => 'XOF', 'symbol' => 'FCFA', 'description' => 'Franc CFA (XOF)', 'is_default' => true],
            ['name' => 'Euro', 'code' => 'EUR', 'symbol' => '€', 'description' => 'Euro', 'is_default' => false],
            ['name' => 'US Dollar', 'code' => 'USD', 'symbol' => '$', 'description' => 'United States Dollar', 'is_default' => false],
        ];

        foreach ($currencies as $currency) {
            Currency::firstOrCreate(
                ['code' => $currency['code'], 'name' => $currency['name']],
                $currency
            );
        }
    }
}

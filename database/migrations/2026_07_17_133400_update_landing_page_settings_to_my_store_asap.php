<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\LandingPageSetting;

return new class extends Migration
{
    /**
     * Run the migrations to update existing Landing Page settings in database.
     */
    public function up(): void
    {
        $setting = LandingPageSetting::first();
        if ($setting) {
            $setting->delete();
        }
        LandingPageSetting::getSettings();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

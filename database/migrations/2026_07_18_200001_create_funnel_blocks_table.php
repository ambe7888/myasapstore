<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funnel_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('funnel_id')->constrained('product_funnels')->onDelete('cascade');
            $table->string('type'); // hero, benefits, testimonials, countdown, video, faq, cta_button, etc.
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->json('settings')->nullable(); // block-specific config
            $table->timestamps();

            $table->index(['funnel_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funnel_blocks');
    }
};

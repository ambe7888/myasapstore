<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('category_product')) {
            Schema::create('category_product', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->foreignId('category_id')->constrained()->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['product_id', 'category_id']);
            });
        }

        // Every existing product keeps its current (primary) category.
        DB::table('products')
            ->whereNotNull('category_id')
            ->orderBy('id')
            ->select('id', 'category_id')
            ->chunk(500, function ($products) {
                $rows = $products->map(fn ($product) => [
                    'product_id' => $product->id,
                    'category_id' => $product->category_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])->all();

                DB::table('category_product')->insertOrIgnore($rows);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_product');
    }
};

<?php

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class ProductObserver
{
    /**
     * Bumps the store's product listing cache version so previously cached
     * listing pages (see ThemeController::products) are treated as stale.
     * Used instead of Cache::tags() since the default file cache driver
     * doesn't support tag-based invalidation.
     */
    public function saved(Product $product): void
    {
        $this->bumpVersion($product->store_id);
    }

    public function deleted(Product $product): void
    {
        $this->bumpVersion($product->store_id);
    }

    private function bumpVersion(?int $storeId): void
    {
        if (!$storeId) {
            return;
        }

        Cache::increment("products_listing_cache_version:{$storeId}");
    }
}

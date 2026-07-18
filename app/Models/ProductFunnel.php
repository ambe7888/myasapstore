<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductFunnel extends Model
{
    protected $fillable = [
        'store_id',
        'product_id',
        'name',
        'slug',
        'status',
        'seo_title',
        'seo_description',
        'favicon',
        'custom_css',
        'settings',
        'views_count',
        'clicks_count',
        'orders_count',
    ];

    protected $casts = [
        'settings'     => 'array',
        'views_count'  => 'integer',
        'clicks_count' => 'integer',
        'orders_count' => 'integer',
    ];

    // ─── Relationships ────────────────────────────────────────────────────

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(FunnelBlock::class, 'funnel_id')->orderBy('sort_order');
    }

    // ─── Scopes ──────────────────────────────────────────────────────────

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    // ─── Computed ────────────────────────────────────────────────────────

    public function getConversionRateAttribute(): float
    {
        if ($this->views_count === 0) return 0;
        return round(($this->orders_count / $this->views_count) * 100, 2);
    }

    public function getPublicUrlAttribute(): string
    {
        $store = $this->store;
        if (!$store) return '#';

        // Custom domain
        if ($store->enable_custom_domain && $store->custom_domain) {
            return 'https://' . $store->custom_domain . '/funnel/' . $this->slug;
        }

        // Subdomain
        if ($store->enable_custom_subdomain && $store->subdomain) {
            return route('store.funnel.custom', ['slug' => $this->slug]);
        }

        // Standard route
        return route('store.funnel', ['storeSlug' => $store->slug, 'slug' => $this->slug]);
    }

    // ─── Static Helpers ──────────────────────────────────────────────────

    /**
     * Check if a store can create more funnels given their plan.
     */
    public static function canCreateForStore(Store $store): bool
    {
        $user = $store->user;
        if (!$user || $user->type !== 'company') return true;

        $plan = $user->plan;
        if (!$plan) return false;

        $maxFunnels = $plan->max_funnels ?? 1;
        if ($maxFunnels === -1) return true; // unlimited

        $currentCount = self::where('store_id', $store->id)
            ->whereIn('status', ['draft', 'published'])
            ->count();

        return $currentCount < $maxFunnels;
    }
}

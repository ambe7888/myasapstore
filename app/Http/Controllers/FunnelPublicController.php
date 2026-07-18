<?php

namespace App\Http\Controllers;

use App\Models\FunnelBlock;
use App\Models\ProductFunnel;
use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FunnelPublicController extends Controller
{
    /**
     * Display a published funnel page (via store slug route).
     */
    public function show(Request $request, string $storeSlug, string $slug)
    {
        $store = Store::where('slug', $storeSlug)->firstOrFail();
        return $this->renderFunnel($request, $store, $slug);
    }

    /**
     * Display a published funnel page (via custom domain/subdomain).
     */
    public function showCustomDomain(Request $request, string $slug)
    {
        $store = $request->attributes->get('resolved_store');
        if (!$store) abort(404, 'Store not found');

        return $this->renderFunnel($request, $store, $slug);
    }

    /**
     * Track a view (called from client-side on page load).
     */
    public function trackView(Request $request, int $funnelId)
    {
        $funnel = ProductFunnel::where('status', 'published')->find($funnelId);
        if ($funnel) {
            $funnel->increment('views_count');
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Track a CTA click.
     */
    public function trackClick(Request $request, int $funnelId)
    {
        $funnel = ProductFunnel::where('status', 'published')->find($funnelId);
        if ($funnel) {
            $funnel->increment('clicks_count');
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Track an order conversion (called after successful order).
     */
    public function trackOrder(Request $request, int $funnelId)
    {
        $funnel = ProductFunnel::where('status', 'published')->find($funnelId);
        if ($funnel) {
            $funnel->increment('orders_count');
        }

        return response()->json(['ok' => true]);
    }

    // ─── Private ──────────────────────────────────────────────────────────

    private function renderFunnel(Request $request, $store, string $slug)
    {
        $funnel = ProductFunnel::where('store_id', $store->id)
            ->where('slug', $slug)
            ->where('status', 'published')
            ->with(['product', 'blocks' => fn($q) => $q->where('is_visible', true)->orderBy('sort_order')])
            ->firstOrFail();

        $product = $funnel->product;

        if (!$product || !$product->is_active) {
            abort(404, 'Product not found');
        }

        // Get store configuration for payment settings
        $configuration = \App\Models\StoreConfiguration::getConfiguration($store->id);
        $storeSettings = [];
        $currencies    = [];

        if ($store->user) {
            $storeSettings = \App\Models\Setting::getUserSettings($store->user->id, $store->id);
            $currencies    = \App\Models\Currency::all()->map(fn($c) => [
                'code'   => $c->code,
                'symbol' => $c->symbol,
                'name'   => $c->name,
            ])->toArray();
        }

        $shippingMethods = \App\Models\Shipping::where('store_id', $store->id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('store/funnel', [
            'funnel' => [
                'id'              => $funnel->id,
                'name'            => $funnel->name,
                'seo_title'       => $funnel->seo_title ?: $product->name,
                'seo_description' => $funnel->seo_description ?: '',
                'favicon'         => $funnel->favicon ?: $configuration['favicon'] ?? '',
                'custom_css'      => $funnel->custom_css,
                'settings'        => $funnel->settings,
                'blocks'          => $funnel->blocks->map(fn($b) => [
                    'id'         => $b->id,
                    'type'       => $b->type,
                    'settings'   => $b->settings,
                ]),
            ],
            'product' => [
                'id'          => $product->id,
                'name'        => $product->name,
                'description' => $product->description,
                'price'       => (float) $product->price,
                'sale_price'  => $product->sale_price ? (float) $product->sale_price : null,
                'cover_image' => $product->cover_image,
                'images'      => $product->images,
                'variants'    => $product->variants ?? [],
                'stock'       => $product->stock,
            ],
            'store' => [
                'id'          => $store->id,
                'name'        => $store->name,
                'slug'        => $store->slug,
                'logo'        => $configuration['logo'] ?? '',
                'primary_color' => $configuration['primary_color'] ?? '',
            ],
            'storeSettings'  => $storeSettings,
            'currencies'     => $currencies,
            'shippingMethods'=> $shippingMethods,
            'isLoggedIn'     => \Illuminate\Support\Facades\Auth::guard('customer')->check(),
            'customer'       => \Illuminate\Support\Facades\Auth::guard('customer')->user(),
        ]);
    }
}

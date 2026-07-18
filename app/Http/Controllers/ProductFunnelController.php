<?php

namespace App\Http\Controllers;

use App\Models\FunnelBlock;
use App\Models\Product;
use App\Models\ProductFunnel;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductFunnelController extends Controller
{
    // ─── Helpers ──────────────────────────────────────────────────────────

    private function getStore(int $storeId): Store
    {
        $user = Auth::user();
        $query = Store::where('id', $storeId);

        if ($user->type === 'company') {
            $query->where('user_id', $user->id);
        } elseif ($user->created_by) {
            $query->where('user_id', $user->created_by);
        } else {
            $query->where('user_id', $user->id);
        }

        return $query->firstOrFail();
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────

    public function index(int $storeId)
    {
        $store = $this->getStore($storeId);

        $funnels = ProductFunnel::where('store_id', $store->id)
            ->with('product:id,name,cover_image,price')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($f) => [
                'id'              => $f->id,
                'name'            => $f->name,
                'slug'            => $f->slug,
                'status'          => $f->status,
                'product'         => $f->product ? [
                    'id'          => $f->product->id,
                    'name'        => $f->product->name,
                    'cover_image' => $f->product->cover_image,
                    'price'       => $f->product->price,
                ] : null,
                'views_count'     => $f->views_count,
                'clicks_count'    => $f->clicks_count,
                'orders_count'    => $f->orders_count,
                'conversion_rate' => $f->conversion_rate,
                'public_url'      => $f->public_url,
                'created_at'      => $f->created_at->toISOString(),
            ]);

        // Check if user can create more funnels
        $canCreate = ProductFunnel::canCreateForStore($store);
        $user = Auth::user();
        $maxFunnels = $user->plan?->max_funnels ?? 1;

        return Inertia::render('stores/funnels/index', [
            'store'       => ['id' => $store->id, 'name' => $store->name, 'slug' => $store->slug],
            'funnels'     => $funnels,
            'can_create'  => $canCreate,
            'max_funnels' => $maxFunnels,
        ]);
    }

    public function create(int $storeId)
    {
        $store = $this->getStore($storeId);

        if (!ProductFunnel::canCreateForStore($store)) {
            return redirect()->route('stores.funnels.index', $storeId)
                ->with('error', 'Vous avez atteint la limite de funnels pour votre plan.');
        }

        $products = Product::where('store_id', $store->id)
            ->where('is_active', true)
            ->select('id', 'name', 'cover_image', 'price', 'sale_price')
            ->orderBy('name')
            ->get();

        return Inertia::render('stores/funnels/create', [
            'store'    => ['id' => $store->id, 'name' => $store->name],
            'products' => $products,
        ]);
    }

    public function store(Request $request, int $storeId)
    {
        $store = $this->getStore($storeId);

        if (!ProductFunnel::canCreateForStore($store)) {
            return back()->withErrors(['error' => 'Limite de funnels atteinte.']);
        }

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'product_id' => 'required|exists:products,id',
            'slug'       => 'nullable|string|max:100|regex:/^[a-z0-9\-]+$/',
        ]);

        // Validate product belongs to this store
        $product = Product::where('id', $validated['product_id'])
            ->where('store_id', $store->id)
            ->firstOrFail();

        $slug = $validated['slug'] ?? Str::slug($validated['name']);
        $slug = $this->makeUniqueSlug($store->id, $slug);

        $funnel = ProductFunnel::create([
            'store_id'   => $store->id,
            'product_id' => $product->id,
            'name'       => $validated['name'],
            'slug'       => $slug,
            'status'     => 'draft',
            'settings'   => [
                'bg_color'    => '#ffffff',
                'font_family' => 'Inter',
                'max_width'   => '800px',
            ],
        ]);

        // Add default starter blocks
        $defaultBlocks = [
            ['type' => 'hero',             'sort_order' => 1],
            ['type' => 'product_showcase', 'sort_order' => 2],
            ['type' => 'benefits',         'sort_order' => 3],
            ['type' => 'cta_button',       'sort_order' => 4],
        ];

        foreach ($defaultBlocks as $block) {
            FunnelBlock::create([
                'funnel_id'  => $funnel->id,
                'type'       => $block['type'],
                'sort_order' => $block['sort_order'],
                'is_visible' => true,
                'settings'   => FunnelBlock::getDefaultSettings($block['type']),
            ]);
        }

        return redirect()->route('stores.funnels.edit', [$storeId, $funnel->id])
            ->with('success', 'Funnel créé avec succès.');
    }

    public function edit(int $storeId, int $funnelId)
    {
        $store  = $this->getStore($storeId);
        $funnel = ProductFunnel::where('store_id', $store->id)
            ->with(['product', 'blocks'])
            ->findOrFail($funnelId);

        $product = $funnel->product;

        return Inertia::render('stores/funnels/builder', [
            'store'       => ['id' => $store->id, 'name' => $store->name, 'slug' => $store->slug, 'theme' => $store->theme],
            'funnel'      => [
                'id'              => $funnel->id,
                'name'            => $funnel->name,
                'slug'            => $funnel->slug,
                'status'          => $funnel->status,
                'seo_title'       => $funnel->seo_title,
                'seo_description' => $funnel->seo_description,
                'custom_css'      => $funnel->custom_css,
                'settings'        => $funnel->settings,
                'views_count'     => $funnel->views_count,
                'clicks_count'    => $funnel->clicks_count,
                'orders_count'    => $funnel->orders_count,
                'conversion_rate' => $funnel->conversion_rate,
                'public_url'      => $funnel->public_url,
                'blocks'          => $funnel->blocks->map(fn($b) => [
                    'id'         => $b->id,
                    'type'       => $b->type,
                    'sort_order' => $b->sort_order,
                    'is_visible' => $b->is_visible,
                    'settings'   => $b->settings,
                ]),
            ],
            'product'     => $product ? [
                'id'          => $product->id,
                'name'        => $product->name,
                'description' => $product->description,
                'price'       => $product->price,
                'sale_price'  => $product->sale_price,
                'cover_image' => $product->cover_image,
                'images'      => $product->images,
                'variants'    => $product->variants,
                'stock'       => $product->stock,
            ] : null,
            'block_types' => FunnelBlock::getAvailableTypes(),
        ]);
    }

    public function update(Request $request, int $storeId, int $funnelId)
    {
        $store  = $this->getStore($storeId);
        $funnel = ProductFunnel::where('store_id', $store->id)->findOrFail($funnelId);

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'slug'            => 'required|string|max:100|regex:/^[a-z0-9\-]+$/',
            'seo_title'       => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'custom_css'      => 'nullable|string',
            'settings'        => 'nullable|array',
            'blocks'          => 'nullable|array',
            'blocks.*.id'     => 'nullable|integer',
            'blocks.*.type'   => 'required|string',
            'blocks.*.sort_order' => 'required|integer',
            'blocks.*.is_visible' => 'boolean',
            'blocks.*.settings'   => 'nullable|array',
        ]);

        // Ensure slug is unique for this store (excluding current funnel)
        $slug = $validated['slug'];
        $existingSlug = ProductFunnel::where('store_id', $store->id)
            ->where('slug', $slug)
            ->where('id', '!=', $funnel->id)
            ->exists();

        if ($existingSlug) {
            $slug = $this->makeUniqueSlug($store->id, $slug, $funnel->id);
        }

        $funnel->update([
            'name'            => $validated['name'],
            'slug'            => $slug,
            'seo_title'       => $validated['seo_title'] ?? null,
            'seo_description' => $validated['seo_description'] ?? null,
            'custom_css'      => $validated['custom_css'] ?? null,
            'settings'        => $validated['settings'] ?? $funnel->settings,
        ]);

        // Sync blocks
        if (isset($validated['blocks'])) {
            $incomingIds = [];

            foreach ($validated['blocks'] as $blockData) {
                if (!empty($blockData['id'])) {
                    $block = FunnelBlock::where('funnel_id', $funnel->id)
                        ->find($blockData['id']);
                    if ($block) {
                        $block->update([
                            'sort_order' => $blockData['sort_order'],
                            'is_visible' => $blockData['is_visible'] ?? true,
                            'settings'   => $blockData['settings'] ?? [],
                        ]);
                        $incomingIds[] = $block->id;
                    }
                } else {
                    $block = FunnelBlock::create([
                        'funnel_id'  => $funnel->id,
                        'type'       => $blockData['type'],
                        'sort_order' => $blockData['sort_order'],
                        'is_visible' => $blockData['is_visible'] ?? true,
                        'settings'   => $blockData['settings'] ?? FunnelBlock::getDefaultSettings($blockData['type']),
                    ]);
                    $incomingIds[] = $block->id;
                }
            }

            // Remove blocks that were deleted
            FunnelBlock::where('funnel_id', $funnel->id)
                ->whereNotIn('id', $incomingIds)
                ->delete();
        }

        return back()->with('success', 'Funnel sauvegardé.');
    }

    public function publish(Request $request, int $storeId, int $funnelId)
    {
        $store  = $this->getStore($storeId);
        $funnel = ProductFunnel::where('store_id', $store->id)->findOrFail($funnelId);

        $newStatus = $funnel->status === 'published' ? 'draft' : 'published';
        $funnel->update(['status' => $newStatus]);

        return back()->with('success', $newStatus === 'published'
            ? 'Funnel publié avec succès !'
            : 'Funnel dépublié.');
    }

    public function destroy(int $storeId, int $funnelId)
    {
        $store  = $this->getStore($storeId);
        $funnel = ProductFunnel::where('store_id', $store->id)->findOrFail($funnelId);
        $funnel->delete();

        return redirect()->route('stores.funnels.index', $storeId)
            ->with('success', 'Funnel supprimé.');
    }

    // ─── Add a block ──────────────────────────────────────────────────────

    public function addBlock(Request $request, int $storeId, int $funnelId)
    {
        $store  = $this->getStore($storeId);
        $funnel = ProductFunnel::where('store_id', $store->id)->findOrFail($funnelId);

        $validated = $request->validate([
            'type' => 'required|string',
        ]);

        $maxOrder = FunnelBlock::where('funnel_id', $funnel->id)->max('sort_order') ?? 0;

        $block = FunnelBlock::create([
            'funnel_id'  => $funnel->id,
            'type'       => $validated['type'],
            'sort_order' => $maxOrder + 1,
            'is_visible' => true,
            'settings'   => FunnelBlock::getDefaultSettings($validated['type']),
        ]);

        return response()->json([
            'block' => [
                'id'         => $block->id,
                'type'       => $block->type,
                'sort_order' => $block->sort_order,
                'is_visible' => $block->is_visible,
                'settings'   => $block->settings,
            ],
        ]);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────

    private function makeUniqueSlug(int $storeId, string $slug, ?int $excludeId = null): string
    {
        $base    = $slug;
        $counter = 1;

        while (true) {
            $query = ProductFunnel::where('store_id', $storeId)->where('slug', $slug);
            if ($excludeId) $query->where('id', '!=', $excludeId);
            if (!$query->exists()) break;
            $slug = $base . '-' . $counter++;
        }

        return $slug;
    }
}

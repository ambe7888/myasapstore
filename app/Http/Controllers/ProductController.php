<?php

namespace App\Http\Controllers;

use App\Events\ProductCreated;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductController extends BaseController
{
    /**
     * Display a listing of the products.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        // Base query for store products to calculate stats accurately
        $baseQuery = Product::where('store_id', $currentStoreId);
        
        $totalProducts = $baseQuery->count();
        $activeProducts = (clone $baseQuery)->where('is_active', true)->count();
        // Get low stock threshold from settings (default: 20)
        $lowStockThreshold = \App\Models\Setting::getSetting('low_stock_threshold', $user->id, $currentStoreId, 20);
        $lowStockProducts = (clone $baseQuery)->where('stock', '<=', $lowStockThreshold)->count();
        $totalValue = (clone $baseQuery)->get()->sum(function ($product) {
            return $product->price * $product->stock;
        });

        // Filtered query for listing
        $query = Product::with('category')->where('store_id', $currentStoreId);
        
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        $perPage = $request->input('per_page', 10);
        $products = $query->latest()->paginate($perPage)->withQueryString();
        
        // Get categories for the filter dropdown
        $categories = Category::where('store_id', $currentStoreId)
                            ->where('is_active', true)
                            ->get();
        
        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category_id']),
            'stats' => [
                'total' => $totalProducts,
                'active' => $activeProducts,
                'lowStock' => $lowStockProducts,
                'totalValue' => $totalValue
            ]
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create()
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        // Get categories for the current store
        $categories = Category::where('store_id', $currentStoreId)
                            ->where('is_active', true)
                            ->get();
        
        // Get taxes for the current store
        $taxes = \App\Models\Tax::where('store_id', $currentStoreId)
                            ->where('is_active', true)
                            ->get();
        
        return Inertia::render('products/create', [
            'categories' => $categories,
            'taxes' => $taxes
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        if (!$currentStoreId || !\App\Models\Store::where('id', $currentStoreId)->exists()) {
            return redirect()->back()->with('error', __('No active store found. Please create or select a store first.'));
        }

        if ($request->category_id === 'none' || empty($request->category_id)) {
            $request->merge(['category_id' => null]);
        }
        if ($request->tax_id === 'none' || empty($request->tax_id)) {
            $request->merge(['tax_id' => null]);
        }
        
        // Check if user can add more products to this store
        $productCheck = $user->canAddProductToStore($currentStoreId);
        if (!$productCheck['allowed']) {
            return redirect()->back()->with('error', $productCheck['message']);
        }
        
        // Validation
        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'specifications' => 'nullable|string',
            'details' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'cover_image' => 'nullable|string',
            'images' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'tax_id' => 'nullable|exists:taxes,id',
            'is_active' => 'nullable|boolean',
            'is_downloadable' => 'nullable|boolean',
            'downloadable_file' => 'nullable|string',
            'variants' => 'nullable|array',
            'custom_fields' => 'nullable|array',
        ]);
        
        $product = new Product();
        $product->name = $request->name;
        if (empty($request->sku)) {
            $product->sku = $this->generateAutoSku($request->name);
        } else {
            $product->sku = $request->sku;
        }
        $product->description = $request->description;
        $product->specifications = $request->specifications;
        $product->details = $request->details;
        $product->price = $request->price;
        $product->sale_price = $request->sale_price;
        $product->stock = $request->stock;
        $product->cover_image = $request->cover_image;
        $product->images = $request->images;
        $product->category_id = $request->category_id;
        $product->tax_id = $request->tax_id;
        $product->store_id = $currentStoreId;
        $product->is_active = $request->has('is_active') ? $request->is_active : true;
        $product->is_downloadable = $request->has('is_downloadable') ? $request->is_downloadable : false;
        $product->downloadable_file = $request->downloadable_file;
        $product->variants = $request->variants;
        $product->custom_fields = $request->custom_fields;
        $product->save();
        
        // Dispatch ProductCreated event for webhooks
        ProductCreated::dispatch($product);
        
        return redirect()->route('products.index')->with('success', __('Product created successfully'));
    }

    /**
     * Display the specified product.
     */
    public function show(string $id)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        $product = Product::with(['category', 'tax'])
                        ->where('store_id', $currentStoreId)
                        ->findOrFail($id);
        
        // Calculate dynamic stats for the product
        $orderItems = \App\Models\OrderItem::where('product_id', $product->id)->get();
        
        $stats = [
            'revenue' => $orderItems->sum('total_price'),
            'views' => 0, // Views tracking would need to be implemented separately
            'total_sold' => $orderItems->sum('quantity'),
            'total_orders' => $orderItems->count(),
        ];
        
        // Format revenue for display
        $stats['formatted_revenue'] = formatStoreCurrency($stats['revenue'], $user->id, $currentStoreId);
        
        return Inertia::render('products/show', [
            'product' => $product,
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(string $id)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        $product = Product::where('store_id', $currentStoreId)->findOrFail($id);
        
        // Get categories for the current store
        $categories = Category::where('store_id', $currentStoreId)
                            ->where('is_active', true)
                            ->get();
        
        // Get taxes for the current store
        $taxes = \App\Models\Tax::where('store_id', $currentStoreId)
                            ->where('is_active', true)
                            ->get();
        
        return Inertia::render('products/edit', [
            'product' => $product,
            'categories' => $categories,
            'taxes' => $taxes
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        if (!$currentStoreId || !\App\Models\Store::where('id', $currentStoreId)->exists()) {
            return redirect()->back()->with('error', __('No active store found. Please create or select a store first.'));
        }

        if ($request->category_id === 'none' || empty($request->category_id)) {
            $request->merge(['category_id' => null]);
        }
        if ($request->tax_id === 'none' || empty($request->tax_id)) {
            $request->merge(['tax_id' => null]);
        }
        
        $product = Product::where('store_id', $currentStoreId)->findOrFail($id);
        
        // Validation
        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'specifications' => 'nullable|string',
            'details' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'cover_image' => 'nullable|string',
            'images' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'tax_id' => 'nullable|exists:taxes,id',
            'is_active' => 'nullable|boolean',
            'is_downloadable' => 'nullable|boolean',
            'downloadable_file' => 'nullable|string',
            'variants' => 'nullable|array',
            'custom_fields' => 'nullable|array',
        ]);
        
        $product->name = $request->name;
        if (empty($request->sku)) {
            if (empty($product->sku)) {
                $product->sku = $this->generateAutoSku($request->name);
            }
        } else {
            $product->sku = $request->sku;
        }
        $product->description = $request->description ?? $product->description;
        $product->specifications = $request->specifications ?? $product->specifications;
        $product->details = $request->details ?? $product->details;
        $product->price = $request->price;
        $product->sale_price = $request->sale_price;
        $product->stock = $request->stock;
        $product->cover_image = $request->cover_image;
        $product->images = $request->images;
        $product->category_id = $request->category_id;
        $product->tax_id = $request->tax_id;
        // Check plan limitations if trying to activate product
        $newIsActive = $request->has('is_active') ? $request->is_active : $product->is_active;
        if ($newIsActive && !$product->is_active) {
            $productCheck = $user->canAddProductToStore($currentStoreId);
            if (!$productCheck['allowed']) {
                return redirect()->back()->with('error', $productCheck['message']);
            }
        }
        
        $product->is_active = $newIsActive;
        $product->is_downloadable = $request->has('is_downloadable') ? $request->is_downloadable : $product->is_downloadable;
        $product->downloadable_file = $request->downloadable_file;
        $product->variants = $request->variants;
        $product->custom_fields = $request->custom_fields;
        $product->save();
        
        // Enforce plan limitations after save
        if ($newIsActive) {
            enforcePlanLimitations($user->fresh());
        }
        
        return redirect()->route('products.index')->with('success', __('Product updated successfully'));
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        $product = Product::where('store_id', $currentStoreId)->findOrFail($id);
        $product->delete();
        
        return redirect()->route('products.index')->with('success', __('Product deleted successfully'));
    }
    
    /**
     * Export products data as CSV.
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        $query = Product::with('category')->where('store_id', $currentStoreId);
        
        if ($request->has('ids')) {
            $ids = explode(',', $request->ids);
            $query->whereIn('id', $ids);
        }
        
        $products = $query->get();
        
        $csvData = [];
        $csvData[] = ['Product Name', 'SKU', 'Category', 'Price', 'Sale Price', 'Stock', 'Variants', 'Status', 'Created Date'];
        
        foreach ($products as $product) {
            $variantDetails = 'No variants';
            if ($product->variants && is_array($product->variants) && count($product->variants) > 0) {
                $variantList = [];
                foreach ($product->variants as $variant) {
                    if (is_array($variant) && isset($variant['name'])) {
                        $variantList[] = $variant['name'] . (isset($variant['price']) ? ' (' . formatStoreCurrency($variant['price'], $user->id, $currentStoreId) . ')' : '');
                    }
                }
                $variantDetails = implode('; ', $variantList);
            }
            
            $csvData[] = [
                $product->name,
                $product->sku ?: 'Not set',
                $product->category ? $product->category->name : 'Uncategorized',
                formatStoreCurrency($product->price, $user->id, $currentStoreId),
                $product->sale_price ? formatStoreCurrency($product->sale_price, $user->id, $currentStoreId) : 'Not set',
                $product->stock,
                $variantDetails,
                $product->is_active ? 'Active' : 'Inactive',
                $product->created_at->format('Y-m-d H:i:s')
            ];
        }
        
        $filename = 'products-export-' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        
        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
    
    /**
     * Fix the "double UTF-8" mojibake that Excel/WooCommerce exports from
     * non-English WordPress sites commonly produce (é becomes "Ã©", a
     * leading BOM becomes "ï»¿", etc.), and strip a real BOM if present.
     */
    private function normalizeImportText($value): string
    {
        $value = (string) $value;

        if (str_contains($value, 'Ã') || str_contains($value, 'â€') || str_contains($value, "\xEF\xBF\xBD")) {
            $fixed = @mb_convert_encoding($value, 'ISO-8859-1', 'UTF-8');
            if ($fixed !== false && $fixed !== '' && mb_check_encoding($fixed, 'UTF-8')) {
                $value = $fixed;
            }
        }

        if (str_starts_with($value, "\xEF\xBB\xBF")) {
            $value = substr($value, 3);
        }

        return trim($value);
    }

    /**
     * Download a remote image (e.g. from a WooCommerce export) and host it
     * on this server via the media library, the same way an uploaded image
     * is stored. Returns null (without failing the whole import row) if the
     * source URL can't be fetched.
     */
    private function importImageFromUrl(string $url): ?string
    {
        try {
            \App\Services\DynamicStorageService::configureDynamicDisks();

            $mediaItem = \App\Models\MediaItem::create([
                'name' => basename(parse_url($url, PHP_URL_PATH) ?: '') ?: 'imported-image',
            ]);

            $media = $mediaItem->addMediaFromUrl($url)->toMediaCollection('images');
            $media->user_id = Auth::id();
            $media->save();

            return $media->getUrl();
        } catch (\Throwable $e) {
            \Log::warning('Product import: could not fetch image from ' . $url . ': ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Import products from CSV.
     */
    public function import(\Illuminate\Http\Request $request)
    {
        // Downloading images for every row can take a while on shared
        // hosting's default 30s limit — give it more room where allowed.
        if (function_exists('set_time_limit')) {
            @set_time_limit(300);
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:20480',
        ]);

        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);

        $file = $request->file('file');
        $handle = fopen($file->path(), 'r');

        $header = fgetcsv($handle);
        if (!$header) {
            return redirect()->back()->with('error', __('Invalid CSV file.'));
        }

        // Map by header name (case-insensitive) so exports from other
        // platforms — e.g. WooCommerce's Products > Export CSV — work
        // without reordering columns first.
        $headerMap = [];
        foreach ($header as $i => $label) {
            $headerMap[strtolower($this->normalizeImportText($label))] = $i;
        }

        $findColumn = function (array $aliases) use ($headerMap) {
            foreach ($aliases as $alias) {
                if (isset($headerMap[$alias])) {
                    return $headerMap[$alias];
                }
            }
            return null;
        };

        // Aliases include French labels since WooCommerce exports headers
        // in the site's own language (a very common case for this app's
        // market).
        $idCol = $findColumn(['id']);
        $nameCol = $findColumn(['name', 'product name', 'nom']);
        $skuCol = $findColumn(['sku', 'ugs']);
        $categoryCol = $findColumn(['categories', 'category', 'catégories', 'catégorie']);
        $priceCol = $findColumn(['regular price', 'price', 'tarif régulier', 'tarif normal', 'prix']);
        $salePriceCol = $findColumn(['sale price', 'tarif promo', 'prix promo']);
        $stockCol = $findColumn(['stock', 'stock quantity', 'quantity']);
        $statusCol = $findColumn(['published', 'status', 'publié']);
        $descriptionCol = $findColumn(['description', 'short description', 'description courte']);
        $imagesCol = $findColumn(['images', 'image']);

        if ($nameCol === null) {
            fclose($handle);
            return redirect()->back()->with('error', __('The CSV must have a "Name" column.'));
        }

        $successCount = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $get = fn (?int $col) => $col !== null ? $this->normalizeImportText($row[$col] ?? '') : '';

            $name = $get($nameCol);
            if (empty($name)) continue;

            // WooCommerce marks trashed/duplicate items with -1 in the
            // Published column — these shouldn't reappear in the new store.
            $rawStatus = $statusCol !== null ? trim((string) ($row[$statusCol] ?? '')) : '';
            if ($rawStatus === '-1') continue;

            $sku = $get($skuCol);
            if (strtolower($sku) === 'not set') $sku = '';

            // WooCommerce exports frequently reuse the same Name across many
            // distinct listings (e.g. a brand name used for every pair of
            // shoes) with no SKU at all. Falling back to matching by Name
            // would silently merge every same-named row into one product —
            // use the source row's own ID instead, when present, so each
            // row always maps to its own product.
            if (empty($sku)) {
                $wooId = $get($idCol);
                if ($wooId !== '') {
                    $sku = 'WC-' . $wooId;
                }
            }

            $categoryName = $get($categoryCol);
            // WooCommerce separates multiple categories with a comma and
            // hierarchy with " > " — keep just the leaf of the first one.
            if (str_contains($categoryName, ',')) {
                $categoryName = trim(explode(',', $categoryName)[0]);
            }
            if (str_contains($categoryName, '>')) {
                $parts = explode('>', $categoryName);
                $categoryName = trim(end($parts));
            }

            $priceStr = $get($priceCol) ?: '0';
            $salePriceStr = $get($salePriceCol);
            $stockStr = $get($stockCol) ?: '0';
            $statusStr = $get($statusCol) ?: 'active';
            $description = $get($descriptionCol);
            $imagesRaw = $get($imagesCol);

            // Clean numbers (extract float from string like "$1,234.56" -> 1234.56)
            $price = (float) filter_var($priceStr, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            $salePrice = in_array(strtolower($salePriceStr), ['', 'not set'], true)
                            ? null
                            : (float) filter_var($salePriceStr, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            $stock = (int) filter_var($stockStr, FILTER_SANITIZE_NUMBER_INT);

            $status = in_array(strtolower($statusStr), ['0', 'no', 'false', 'inactive', 'draft', 'private'], true) ? 0 : 1;

            $categoryId = null;
            if (!empty($categoryName) && strtolower($categoryName) !== 'uncategorized') {
                $category = Category::firstOrCreate(
                    ['store_id' => $currentStoreId, 'name' => $categoryName],
                    ['slug' => Category::generateUniqueSlug($categoryName, $currentStoreId), 'is_active' => true]
                );
                $categoryId = $category->id;
            }

            // Download each image so it's hosted on this server, independent
            // of the source site — stored the same way as a normal upload
            // (comma-separated URLs, same convention the picker uses).
            $coverImage = null;
            $images = null;
            if (!empty($imagesRaw)) {
                $sourceUrls = array_values(array_filter(
                    array_map('trim', explode(',', $imagesRaw)),
                    fn ($url) => filter_var($url, FILTER_VALIDATE_URL)
                ));
                $importedUrls = [];
                foreach ($sourceUrls as $sourceUrl) {
                    $importedUrl = $this->importImageFromUrl($sourceUrl);
                    if ($importedUrl) {
                        $importedUrls[] = $importedUrl;
                    }
                }
                if (!empty($importedUrls)) {
                    $coverImage = $importedUrls[0];
                    if (count($importedUrls) > 1) {
                        $images = implode(',', array_slice($importedUrls, 1));
                    }
                }
            }

            // Find existing product: first by SKU (if provided), then by Name
            $product = null;
            if (!empty($sku)) {
                $product = Product::where('store_id', $currentStoreId)
                    ->where('sku', $sku)
                    ->first();
            }

            if (!$product) {
                $product = Product::where('store_id', $currentStoreId)
                    ->where('name', trim($name))
                    ->first();
            }

            // If we still don't have an SKU, generate one now
            if (empty($sku)) {
                $sku = strtoupper(\Illuminate\Support\Str::random(8));
            }

            $fields = [
                'name' => $name,
                'category_id' => $categoryId,
                'price' => $price,
                'sale_price' => $salePrice,
                'stock' => $stock,
                'is_active' => $status,
            ];
            if ($description !== '') $fields['description'] = $description;
            if ($coverImage !== null) $fields['cover_image'] = $coverImage;
            if ($images !== null) $fields['images'] = $images;

            if ($product) {
                $product->update($fields);
            } else {
                $fields['store_id'] = $currentStoreId;
                $fields['sku'] = $sku;
                $fields['slug'] = \Illuminate\Support\Str::slug($name) . '-' . \Illuminate\Support\Str::random(4);
                Product::create($fields);
            }
            $successCount++;
        }

        fclose($handle);

        return redirect()->back()->with('success', __(':count products imported successfully.', ['count' => $successCount]));
    }
    
    /**
     * Handle bulk actions for products.
     */
    public function bulkAction(Request $request)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        $request->validate([
            'action' => 'required|string|in:delete,activate,deactivate,move_category',
            'ids' => 'required|array',
            'ids.*' => 'integer',
            'category_id' => 'required_if:action,move_category|nullable|integer',
        ]);
        
        $action = $request->action;
        $ids = $request->ids;

        if ($action === 'delete' && !$user->can('delete-products')) {
            return redirect()->back()->with('error', __('You do not have permission to delete products.'));
        }

        $products = Product::where('store_id', $currentStoreId)
            ->whereIn('id', $ids)
            ->get();
            
        if ($products->isEmpty()) {
            return redirect()->back()->with('error', __('No products selected or you do not have permission.'));
        }
        
        $count = $products->count();
        
        if ($action === 'delete') {
            foreach ($products as $product) {
                if ($product->cover_image) {
                    \Storage::disk('public')->delete($product->cover_image);
                }
                if ($product->images) {
                    $images = is_array($product->images) ? $product->images : json_decode($product->images, true);
                    if (is_array($images)) {
                        foreach ($images as $img) {
                            \Storage::disk('public')->delete($img);
                        }
                    }
                }
                $product->delete();
            }
            return redirect()->back()->with('success', __(':count products deleted successfully.', ['count' => $count]));
        } elseif ($action === 'activate') {
            foreach ($products as $product) {
                if (!$product->is_active) {
                    $productCheck = $user->canAddProductToStore($currentStoreId);
                    if (!$productCheck['allowed']) {
                        continue; // Skip activation if limit reached
                    }
                    $product->is_active = true;
                    $product->save();
                }
            }
            return redirect()->back()->with('success', __('Selected products activated.'));
        } elseif ($action === 'deactivate') {
            Product::where('store_id', $currentStoreId)
                ->whereIn('id', $ids)
                ->update(['is_active' => false]);
            return redirect()->back()->with('success', __('Selected products deactivated.'));
        } elseif ($action === 'move_category') {
            $category = \App\Models\Category::where('id', $request->category_id)
                ->where('store_id', $currentStoreId)
                ->first();

            if (!$category) {
                return redirect()->back()->with('error', __('Invalid category selected.'));
            }

            Product::where('store_id', $currentStoreId)
                ->whereIn('id', $ids)
                ->update(['category_id' => $category->id]);

            return redirect()->back()->with('success', __(':count products moved to :category.', ['count' => $count, 'category' => $category->name]));
        }

        return redirect()->back();
    }

    /**
     * Generate a unique SKU automatically.
     */
    private function generateAutoSku(string $name): string
    {
        $initials = '';
        $words = explode(' ', $name);
        foreach ($words as $word) {
            $initials .= substr($word, 0, 1);
        }
        $initials = preg_replace('/[^A-Za-z0-9]/', '', $initials);
        $initials = strtoupper(substr($initials, 0, 3));
        if (empty($initials)) {
            $initials = 'PROD';
        }
        
        do {
            $sku = $initials . '-' . strtoupper(\Illuminate\Support\Str::random(6));
        } while (Product::where('sku', $sku)->exists());

        return $sku;
    }

    /**
     * Duplicate a product.
     */
    public function duplicate($id)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);

        $product = Product::where('store_id', $currentStoreId)->findOrFail($id);
        
        $newProduct = $product->replicate();
        $newProduct->name = $product->name . ' (' . __('Copie') . ')';
        $newProduct->sku = $product->sku ? $product->sku . '-COPY-' . strtoupper(\Illuminate\Support\Str::random(4)) : null;
        $newProduct->created_at = now();
        $newProduct->updated_at = now();
        $newProduct->save();

        return redirect()->back()->with('success', __('Produit dupliqué avec succès.'));
    }
}

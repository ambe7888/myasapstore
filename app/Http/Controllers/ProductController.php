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
    public function index()
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        // Get products for the current store with category relationship
        $products = Product::with('category')
                        ->where('store_id', $currentStoreId)
                        ->latest()
                        ->get();
        
        // Get statistics
        $totalProducts = $products->count();
        $activeProducts = $products->where('is_active', true)->count();
        // Get low stock threshold from settings (default: 20)
        $lowStockThreshold = \App\Models\Setting::getSetting('low_stock_threshold', $user->id, $currentStoreId, 20);
        $lowStockProducts = $products->where('stock', '<=', $lowStockThreshold)->count();
        $totalValue = $products->sum(function ($product) {
            return $product->price * $product->stock;
        });
        
        return Inertia::render('products/index', [
            'products' => $products,
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
        $product->sku = $request->sku;
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
        $product->sku = $request->sku;
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
     * Import products from CSV.
     */
    public function import(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);

        $file = $request->file('file');
        $handle = fopen($file->path(), 'r');

        $header = fgetcsv($handle);
        if (!$header) {
            return redirect()->back()->with('error', __('Invalid CSV file.'));
        }

        $successCount = 0;
        $errorCount = 0;

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < 2) continue;

            $name = $row[0] ?? '';
            if (empty($name)) continue;

            $sku = $row[1] ?? '';
            if (strtolower(trim($sku)) === 'not set') $sku = '';

            $categoryName = $row[2] ?? '';
            $priceStr = $row[3] ?? '0';
            $salePriceStr = $row[4] ?? '';
            $stockStr = $row[5] ?? '0';
            $statusStr = $row[7] ?? 'Active';

            // Clean numbers (extract float from string like "$1,234.56" -> 1234.56)
            $price = (float) filter_var($priceStr, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            $salePrice = strtolower(trim($salePriceStr)) === 'not set' || empty($salePriceStr) 
                            ? null 
                            : (float) filter_var($salePriceStr, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            $stock = (int) filter_var($stockStr, FILTER_SANITIZE_NUMBER_INT);
            
            $status = strtolower(trim($statusStr)) === 'inactive' ? 0 : 1;

            $categoryId = null;
            if (!empty($categoryName) && strtolower(trim($categoryName)) !== 'uncategorized') {
                $category = Category::where('store_id', $currentStoreId)
                    ->where('name', trim($categoryName))
                    ->first();
                if ($category) {
                    $categoryId = $category->id;
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

            if ($product) {
                // Update
                $product->update([
                    'name' => $name,
                    'category_id' => $categoryId,
                    'price' => $price,
                    'sale_price' => $salePrice,
                    'stock' => $stock,
                    'is_active' => $status,
                ]);
            } else {
                // Create
                $slug = \Illuminate\Support\Str::slug($name) . '-' . \Illuminate\Support\Str::random(4);
                Product::create([
                    'store_id' => $currentStoreId,
                    'name' => $name,
                    'slug' => $slug,
                    'sku' => $sku,
                    'category_id' => $categoryId,
                    'price' => $price,
                    'sale_price' => $salePrice,
                    'stock' => $stock,
                    'is_active' => $status,
                ]);
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
            'action' => 'required|string|in:delete,activate,deactivate',
            'ids' => 'required|array',
            'ids.*' => 'integer'
        ]);
        
        $action = $request->action;
        $ids = $request->ids;
        
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
        }
        
        return redirect()->back();
    }
}

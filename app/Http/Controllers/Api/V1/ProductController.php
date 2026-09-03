<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\ProductCreated;
use App\Http\Controllers\Api\V1\Concerns\ScopesToOwnedStore;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ScopesToOwnedStore;

    public function index(Request $request)
    {
        $request->validate(['store_id' => 'required|integer']);
        $store = $this->resolveOwnedStore((int) $request->store_id);

        $query = Product::where('store_id', $store->id)->with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $perPage = $request->input('per_page', 20);
        $products = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $products->getCollection()->transform(fn (Product $product) => $this->formatProduct($product));

        return response()->json([
            'products' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show(int $product)
    {
        $product = Product::findOrFail($product);
        $this->resolveOwnedStore($product->store_id);

        return response()->json(['product' => $this->formatProduct($product)]);
    }

    public function store(Request $request)
    {
        $request->validate(['store_id' => 'required|integer']);
        $store = $this->resolveOwnedStore((int) $request->store_id);
        $user = Auth::user();

        $productCheck = $user->canAddProductToStore($store->id);
        if (!$productCheck['allowed']) {
            return response()->json(['message' => $productCheck['message']], 422);
        }

        $validated = $request->validate($this->validationRules());

        $product = new Product();
        $product->fill($validated);
        $product->sku = $validated['sku'] ?? $this->generateAutoSku($validated['name']);
        $product->store_id = $store->id;
        $product->is_active = $request->boolean('is_active', true);
        $product->save();

        ProductCreated::dispatch($product);

        return response()->json(['product' => $this->formatProduct($product)], 201);
    }

    public function update(Request $request, int $product)
    {
        $product = Product::findOrFail($product);
        $store = $this->resolveOwnedStore($product->store_id);
        $user = Auth::user();

        $validated = $request->validate($this->validationRules());

        $newIsActive = $request->has('is_active') ? $request->boolean('is_active') : $product->is_active;
        if ($newIsActive && !$product->is_active) {
            $productCheck = $user->canAddProductToStore($store->id);
            if (!$productCheck['allowed']) {
                return response()->json(['message' => $productCheck['message']], 422);
            }
        }

        $product->fill($validated);
        if (empty($validated['sku'])) {
            $product->sku = $product->sku ?: $this->generateAutoSku($validated['name']);
        }
        $product->is_active = $newIsActive;
        $product->save();

        if ($newIsActive) {
            enforcePlanLimitations($user->fresh());
        }

        return response()->json(['product' => $this->formatProduct($product)]);
    }

    public function destroy(int $product)
    {
        $product = Product::findOrFail($product);
        $this->resolveOwnedStore($product->store_id);
        $product->delete();

        return response()->json(['message' => __('Product deleted successfully')]);
    }

    private function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'cover_image' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'is_active' => 'nullable|boolean',
        ];
    }

    private function generateAutoSku(string $name): string
    {
        return strtoupper(Str::slug($name, '-')) . '-' . strtoupper(Str::random(4));
    }

    private function formatProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'description' => $product->description,
            'price' => (float) $product->price,
            'sale_price' => $product->sale_price !== null ? (float) $product->sale_price : null,
            'stock' => $product->stock,
            'cover_image' => $product->cover_image,
            'is_active' => (bool) $product->is_active,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ] : null,
        ];
    }
}

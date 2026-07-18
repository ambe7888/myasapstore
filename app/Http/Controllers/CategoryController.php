<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CategoryController extends BaseController
{
    /**
     * Display a listing of the categories.
     */
    public function index()
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        // Get categories for the current store with parent relationship and product count
        $allCategories = Category::with('parent')
                            ->withCount('products')
                            ->where('store_id', $currentStoreId)
                            ->get();
        
        // Sort hierarchically
        $categories = $this->buildCategoryHierarchy($allCategories);
        
        // Get statistics
        $totalCategories = $allCategories->count();
        $activeCategories = $allCategories->where('is_active', true)->count();
        $parentCategories = $allCategories->whereNull('parent_id')->count();
        $subCategories = $allCategories->whereNotNull('parent_id')->count();
        
        return Inertia::render('categories/index', [
            'categories' => $categories,
            'stats' => [
                'total' => $totalCategories,
                'active' => $activeCategories,
                'parent' => $parentCategories,
                'sub' => $subCategories
            ]
        ]);
    }

    private function buildCategoryHierarchy($categories, $parentId = null, $depth = 0)
    {
        $result = [];
        $filtered = $categories->where('parent_id', $parentId)->sortBy('sort_order');
        
        foreach ($filtered as $category) {
            $category->depth = $depth;
            $result[] = $category;
            $children = $this->buildCategoryHierarchy($categories, $category->id, $depth + 1);
            $result = array_merge($result, $children);
        }
        
        return $result;
    }

    /**
     * Show the form for creating a new category.
     */
    public function create()
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        // Get all categories for dropdown (for parent selection)
        $parentCategories = Category::where('store_id', $currentStoreId)
                                  ->where('is_active', true)
                                  ->get();
        
        return Inertia::render('categories/create', [
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Generate a unique slug for this store
        $slug = Category::generateUniqueSlug($request->name, $currentStoreId);
        
        $category = new Category();
        $category->name = $request->name;
        $category->slug = $slug;
        $category->description = $request->description;
        $category->image = $request->image;
        $category->parent_id = $request->parent_id === 'none' ? null : $request->parent_id;
        $category->store_id = $currentStoreId;
        $category->sort_order = $request->sort_order ?? 0;
        $category->is_active = $request->has('is_active') ? $request->is_active : true;
        $category->save();

        return redirect()->route('categories.index')->with('success', __('Category created successfully'));
    }

    /**
     * Display the specified category.
     */
    public function show(string $id)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        $category = Category::with('parent')
                          ->where('store_id', $currentStoreId)
                          ->findOrFail($id);
        
        // Get subcategories with product counts
        $subcategories = Category::where('parent_id', $category->id)
                               ->where('store_id', $currentStoreId)
                               ->withCount('products')
                               ->get();
        
        // Get product count for this category
        $productCount = \App\Models\Product::where('category_id', $category->id)
                                          ->where('store_id', $currentStoreId)
                                          ->count();
        
        // Calculate total revenue from products in this category
        $categoryProducts = \App\Models\Product::where('category_id', $category->id)
                                              ->where('store_id', $currentStoreId)
                                              ->pluck('id');
        
        $totalRevenue = \App\Models\OrderItem::whereIn('product_id', $categoryProducts)
                                            ->sum('total_price');
        
        $stats = [
            'total_products' => $productCount,
            'subcategories_count' => $subcategories->count(),
            'total_revenue' => $totalRevenue,
            'active_products' => \App\Models\Product::where('category_id', $category->id)
                                                   ->where('store_id', $currentStoreId)
                                                   ->where('is_active', true)
                                                   ->count(),
        ];
        
        // Format revenue for display
        $stats['formatted_revenue'] = formatStoreCurrency($totalRevenue, $user->id, $currentStoreId);
        
        return Inertia::render('categories/show', [
            'category' => $category,
            'subcategories' => $subcategories,
            'productCount' => $productCount,
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(string $id)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        $category = Category::where('store_id', $currentStoreId)->findOrFail($id);
        
        // Get parent categories for dropdown (excluding this category and its children)
        $parentCategories = Category::where('store_id', $currentStoreId)
                                  ->where('id', '!=', $id)
                                  ->where('is_active', true)
                                  ->get();
        
        return Inertia::render('categories/edit', [
            'category' => $category,
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        $category = Category::where('store_id', $currentStoreId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
        
        // Check if name changed, if so, update slug
        if ($category->name !== $request->name) {
            $category->slug = Category::generateUniqueSlug($request->name, $currentStoreId);
        }
        
        $category->name = $request->name;
        $category->description = $request->description;
        $category->image = $request->image;
        $category->parent_id = $request->parent_id === 'none' ? null : $request->parent_id;
        $category->sort_order = $request->sort_order ?? $category->sort_order;
        $category->is_active = $request->has('is_active') ? $request->is_active : $category->is_active;
        $category->save();

        return redirect()->route('categories.index')->with('success', __('Category updated successfully'));
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        $category = Category::where('store_id', $currentStoreId)->findOrFail($id);
        
        // Check if category has subcategories
        $hasSubcategories = Category::where('parent_id', $id)->exists();
        
        if ($hasSubcategories) {
            return redirect()->back()->with('error', __('Cannot delete category with subcategories'));
        }
        
        // Check if category has products (if the relationship exists)
        if (method_exists($category, 'products') && $category->products()->count() > 0) {
            return redirect()->back()->with('error', __('Cannot delete category with products'));
        }
        
        $category->delete();

        return redirect()->route('categories.index')->with('success', __('Category deleted successfully'));
    }
    
    /**
     * Export categories data as CSV.
     */
    public function export()
    {
        $user = Auth::user();
        $currentStoreId = getCurrentStoreId($user);
        
        $categories = Category::with('parent')
                            ->where('store_id', $currentStoreId)
                            ->get();
        
        $csvData = [];
        $csvData[] = ['Category Name', 'Slug', 'Parent Category', 'Description', 'Sort Order', 'Status', 'Created Date'];
        
        foreach ($categories as $category) {
            $csvData[] = [
                $category->name,
                $category->slug,
                $category->parent ? $category->parent->name : 'Root Category',
                $category->description ?: 'No description',
                $category->sort_order,
                $category->is_active ? 'Active' : 'Inactive',
                $category->created_at->format('Y-m-d H:i:s')
            ];
        }
        
        $filename = 'categories-export-' . now()->format('Y-m-d') . '.csv';
        
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
     * Import categories from CSV.
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
            if (count($row) < 2) continue; // Skip empty/invalid rows

            $name = $row[0] ?? '';
            if (empty($name)) continue; // Name is required

            $slug = !empty($row[1]) ? $row[1] : \Illuminate\Support\Str::slug($name);
            $parentName = $row[2] ?? '';
            $description = $row[3] ?? null;
            
            $sortOrder = 0;
            if (isset($row[4]) && is_numeric($row[4])) {
                $sortOrder = (int)$row[4];
            }
            
            $status = isset($row[5]) && strtolower(trim($row[5])) === 'inactive' ? 0 : 1;

            $parentId = null;
            if (!empty($parentName) && strtolower(trim($parentName)) !== 'root category') {
                $parent = Category::where('store_id', $currentStoreId)
                    ->where('name', trim($parentName))
                    ->first();
                if ($parent) {
                    $parentId = $parent->id;
                }
            }

            // Find existing category by slug or create new one
            $category = Category::where('store_id', $currentStoreId)
                ->where('slug', $slug)
                ->first();

            if ($category) {
                // Update
                $category->update([
                    'name' => $name,
                    'parent_id' => $parentId,
                    'description' => $description,
                    'sort_order' => $sortOrder,
                    'is_active' => $status,
                ]);
            } else {
                // Create
                Category::create([
                    'store_id' => $currentStoreId,
                    'name' => $name,
                    'slug' => $slug,
                    'parent_id' => $parentId,
                    'description' => $description,
                    'sort_order' => $sortOrder,
                    'is_active' => $status,
                ]);
            }
            $successCount++;
        }

        fclose($handle);

        return redirect()->back()->with('success', __(':count categories imported successfully.', ['count' => $successCount]));
    }
}

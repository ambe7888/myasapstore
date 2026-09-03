<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\ScopesToOwnedStore;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class StoreController extends Controller
{
    use ScopesToOwnedStore;

    public function index()
    {
        $stores = Store::where('user_id', $this->ownerId())->orderBy('id')->get();

        return response()->json([
            'stores' => $stores->map(fn (Store $store) => $this->formatStore($store)),
        ]);
    }

    public function show(int $store)
    {
        $store = $this->resolveOwnedStore($store);

        return response()->json(['store' => $this->formatStore($store)]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $storeCheck = $user->canCreateStore();
        if (!$storeCheck['allowed']) {
            return response()->json(['message' => $storeCheck['message']], 422);
        }

        $availableThemes = $user->getAvailableThemes();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'theme' => 'required|string|in:' . implode(',', $availableThemes),
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $store = new Store();
        $store->name = $request->name;
        $store->slug = Store::generateUniqueSlug($request->name);
        $store->description = $request->description;
        $store->theme = $request->theme;
        $store->user_id = Auth::id();
        $store->save();

        if (!getCurrentStoreId($user)) {
            $user->current_store = $store->id;
            $user->save();
        }

        event(new \App\Events\StoreCreated($store));

        return response()->json(['store' => $this->formatStore($store)], 201);
    }

    private function formatStore(Store $store): array
    {
        return [
            'id' => $store->id,
            'name' => $store->name,
            'slug' => $store->slug,
            'theme' => $store->theme,
            'description' => $store->description,
            'store_url' => getStoreUrl($store),
            'total_orders' => Order::where('store_id', $store->id)->count(),
            'total_customers' => Customer::where('store_id', $store->id)->count(),
            'total_revenue' => (float) Order::where('store_id', $store->id)->where('payment_status', 'paid')->sum('total_amount'),
        ];
    }
}

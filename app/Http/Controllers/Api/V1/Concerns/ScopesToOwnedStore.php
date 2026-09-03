<?php

namespace App\Http\Controllers\Api\V1\Concerns;

use App\Models\Store;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Resolves which "owner" a store belongs to the same way the web dashboard
 * does (StoreController::index): company users own stores directly, sub-users
 * (type=user) act on their creator's stores.
 */
trait ScopesToOwnedStore
{
    protected function ownerId(): int
    {
        $user = Auth::user();

        return $user->type === 'company' ? $user->id : ($user->created_by ?: $user->id);
    }

    protected function resolveOwnedStore(int $storeId): Store
    {
        $store = Store::where('id', $storeId)->where('user_id', $this->ownerId())->first();

        if (!$store) {
            throw ValidationException::withMessages([
                'store_id' => [__('Store not found or not accessible.')],
            ]);
        }

        return $store;
    }
}

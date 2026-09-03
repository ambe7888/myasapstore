<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    /**
     * Current plan, its limits, and the seller's usage against them.
     * Read-only in v1 — upgrading happens on the web (see plan.md).
     */
    public function show()
    {
        $user = Auth::user();
        $plan = $user->getCurrentPlan();
        $limits = $user->getPlanLimits();

        $storeIds = $user->stores()->pluck('id');

        return response()->json([
            'plan' => $plan ? [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $plan->price,
                'yearly_price' => $plan->yearly_price,
                'is_default' => $plan->isDefault(),
            ] : null,
            'is_trial' => (bool) $user->is_trial,
            'trial_expire_date' => $user->trial_expire_date,
            'plan_expire_date' => $user->plan_expire_date,
            'has_active_plan' => $user->hasActivePlan(),
            'needs_plan_subscription' => $user->needsPlanSubscription(),
            'limits' => $limits,
            'usage' => [
                'stores' => $storeIds->count(),
                'products' => Product::whereIn('store_id', $storeIds)->count(),
            ],
        ]);
    }

    /**
     * Plans available to subscribe/upgrade to (purchase happens on the web).
     */
    public function plans()
    {
        $plans = Plan::where('is_plan_enable', true)->orWhereNull('is_plan_enable')->get();

        return response()->json([
            'plans' => $plans->map(fn (Plan $plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price' => $plan->price,
                'yearly_price' => $plan->yearly_price,
                'max_stores' => $plan->max_stores,
                'max_products_per_store' => $plan->max_products_per_store,
                'max_users_per_store' => $plan->max_users_per_store,
                'is_default' => $plan->isDefault(),
            ]),
        ]);
    }
}

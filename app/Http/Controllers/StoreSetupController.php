<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\PaymentSetting;
use App\Models\Shipping;
use App\Models\Store;
use App\Models\StoreConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * First-run setup wizard shown to a seller right after signup: store identity,
 * categories, delivery zones, cash on delivery and theme in one guided flow.
 */
class StoreSetupController extends Controller
{
    private function currentStore(): ?Store
    {
        $user = Auth::user();
        $storeId = getCurrentStoreId($user);

        return $storeId ? Store::where('id', $storeId)->where('user_id', $user->id)->first() : null;
    }

    public function index()
    {
        $user = Auth::user();
        $store = $this->currentStore();

        if (!$store) {
            return redirect()->route('dashboard');
        }

        $config = StoreConfiguration::getConfiguration($store->id);

        return Inertia::render('store-setup/index', [
            'store' => [
                'id'    => $store->id,
                'name'  => $store->name,
                'slug'  => $store->slug,
                'phone' => $store->phone,
                'theme' => $store->theme,
                'logo'  => $config['logo'] ?? '',
            ],
            'availableThemes'    => $user->getAvailableThemes(),
            'existingCategories' => Category::where('store_id', $store->id)->pluck('name')->values(),
            'cod'                => (bool) isPaymentMethodEnabled('cod', $user->id, $store->id),
        ]);
    }

    public function complete(Request $request)
    {
        $user = Auth::user();
        $store = $this->currentStore();

        if (!$store) {
            return redirect()->route('dashboard');
        }

        $availableThemes = $user->getAvailableThemes();
        $themeRule = is_array($availableThemes) ? 'nullable|string|in:' . implode(',', $availableThemes) : 'nullable|string';

        $data = $request->validate([
            'store_name'            => 'required|string|max:255',
            'phone'                 => 'nullable|string|max:30',
            'logo'                  => 'nullable|string|max:500',
            'theme'                 => $themeRule,
            'categories'            => 'nullable|array|max:30',
            'categories.*'          => 'required|string|max:100',
            'shipping'              => 'nullable|array|max:10',
            'shipping.*.name'       => 'required|string|max:100',
            'shipping.*.cost'       => 'nullable|numeric|min:0',
            'shipping.*.delivery_time' => 'nullable|string|max:100',
            'cod'                   => 'nullable|boolean',
        ]);

        $store->name = trim($data['store_name']);
        $store->phone = $data['phone'] ?? $store->phone;
        if (!empty($data['theme'])) {
            $store->theme = $data['theme'];
        }
        $store->save();

        if (!empty($data['logo'])) {
            StoreConfiguration::updateConfiguration($store->id, ['logo' => $data['logo']]);
        }

        // Categories: skip any the store already has (case-insensitive).
        $existing = Category::where('store_id', $store->id)->pluck('name')->map(fn ($n) => mb_strtolower($n))->all();
        foreach (array_values(array_unique($data['categories'] ?? [])) as $i => $name) {
            $name = trim($name);
            if ($name === '' || in_array(mb_strtolower($name), $existing, true)) {
                continue;
            }
            Category::create([
                'store_id'   => $store->id,
                'name'       => $name,
                'slug'       => Category::generateUniqueSlug($name, $store->id),
                'sort_order' => $i,
                'is_active'  => true,
            ]);
            $existing[] = mb_strtolower($name);
        }

        // Delivery zones.
        $existingZones = Shipping::where('store_id', $store->id)->pluck('name')->map(fn ($n) => mb_strtolower($n))->all();
        foreach (($data['shipping'] ?? []) as $i => $zone) {
            $name = trim($zone['name']);
            if ($name === '' || in_array(mb_strtolower($name), $existingZones, true)) {
                continue;
            }
            $cost = (float) ($zone['cost'] ?? 0);
            Shipping::create([
                'store_id'      => $store->id,
                'name'          => $name,
                'type'          => $cost > 0 ? 'flat_rate' : 'free_shipping',
                'cost'          => $cost,
                'delivery_time' => $zone['delivery_time'] ?? null,
                'sort_order'    => $i,
                'is_active'     => true,
            ]);
            $existingZones[] = mb_strtolower($name);
        }

        // Cash on delivery.
        PaymentSetting::updateOrCreateSetting($user->id, 'is_cod_enabled', !empty($data['cod']) ? '1' : '0', $store->id);

        $this->markDone($store);

        return redirect()->route('dashboard')->with('success', 'Votre boutique est prête ! Ajoutez maintenant vos premiers produits.');
    }

    public function skip()
    {
        $store = $this->currentStore();
        if ($store) {
            $this->markDone($store);
        }

        return redirect()->route('dashboard');
    }

    private function markDone(Store $store): void
    {
        StoreConfiguration::updateConfiguration($store->id, [
            'setup_pending'   => false,
            'setup_completed' => true,
        ]);
    }
}

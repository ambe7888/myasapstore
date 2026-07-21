<?php
// Load Laravel bootstrap
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use App\Models\Store;
use App\Models\Setting;
use App\Models\Currency;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Find first store
$store = Store::first();
if (!$store) {
    echo "No store found.\n";
    exit;
}

echo "Store Name: " . $store->name . "\n";
echo "Store User ID: " . $store->user_id . "\n";
echo "Store ID: " . $store->id . "\n";

// Load user settings
$userSettings = Setting::where('user_id', $store->user_id)
              ->where('store_id', null)
              ->pluck('value', 'key')
              ->toArray();

// Load store settings
$storeSettings = Setting::where('user_id', $store->user_id)
              ->where('store_id', $store->id)
              ->pluck('value', 'key')
              ->toArray();

echo "User settings: " . json_encode($userSettings, JSON_PRETTY_PRINT) . "\n";
echo "Store settings: " . json_encode($storeSettings, JSON_PRETTY_PRINT) . "\n";

$companySettings = array_merge(
    is_array($userSettings) ? $userSettings : [],
    is_array($storeSettings) ? $storeSettings : []
);

$currencyCode = $companySettings['defaultCurrency'] ?? 'XOF';
echo "Resolved currency code: " . $currencyCode . "\n";

$currency = Currency::where('code', $currencyCode)->first();
if ($currency) {
    echo "Currency details found: " . json_encode($currency->toArray(), JSON_PRETTY_PRINT) . "\n";
} else {
    echo "Currency not found in currencies table.\n";
}

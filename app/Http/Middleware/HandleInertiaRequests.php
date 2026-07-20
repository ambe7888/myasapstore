<?php
namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\Currency;
use App\Models\ReferralSetting;
use App\Models\Store;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        
        // Skip database queries during installation
        if ($request->is('install/*') || $request->is('update/*') || !file_exists(storage_path('installed'))) {
            $globalSettings = [
                'currencySymbol' => '$',
                'currencyNname' => 'US Dollar',
                'base_url' => config('app.url')
            ];
            $storeCurrency = [
                'code' => 'XOF',
                'symbol' => 'FCFA',
                'name' => 'Franc CFA (XOF)',
                'position' => 'after',
                'decimals' => 0,
                'decimal_separator' => '.',
                'thousands_separator' => ' '
            ];
        } else {
            // Get system settings
            $settings = settings();
            // Get currency symbol
            $currencyCode = $settings['defaultCurrency'] ?? 'XOF';
            $currency = Currency::where('code', $currencyCode)->first();
            $currencySettings = [];
            if ($currency) {
                $currencySettings = [
                    'currencySymbol' => $currency->symbol, 
                    'currencyNname' => $currency->name
                ];
            } else {
                $currencySettings = [
                    'currencySymbol' =>  'FCFA', 
                    'currencyNname' =>'Franc CFA (XOF)'
                ];
            }
            
            // Merge currency settings with other settings
            $globalSettings = array_merge($settings, $currencySettings);
            $globalSettings['base_url'] = config('app.url');
            $globalSettings['image_url'] = config('app.url');
            
            // Filter out sensitive keys before sharing with frontend
            $globalSettings = $this->filterSensitiveSettings($globalSettings);
            
            // Get store-specific currency settings for authenticated users
            $storeCurrency = $this->getStoreCurrencySettings($request);
        }
        
        return [
            ...parent::share($request),
            'name'  => config('app.name'),
            'base_url'  => config('app.url'),
            'image_url'  => config('app.url'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'csrf_token' => csrf_token(),
            'auth'  => function() use ($request) {
                $user = $request->user() ? $request->user()->load('stores', 'plan') : null;
                
                // Get stores for the current user
                $stores = [];
                if ($user) {
                    if ($user->type === 'company') {
                        // Company users have their own stores
                        $stores = $user->stores;
                    } elseif ($user->type === 'user' && $user->created_by) {
                        // Regular users access their creator's stores
                        $creator = \App\Models\User::find($user->created_by);
                        if ($creator) {
                            $stores = $creator->stores;
                        }
                    }
                }
                
                // Check if demo mode is enabled and there's a demo store cookie
                if ($user && config('app.is_demo') && $request->cookie('demo_store_id')) {
                    $storeId = (int) $request->cookie('demo_store_id');
                    
                    // Verify the store belongs to the user or their creator
                    $storeExists = false;
                    if ($user->type === 'company') {
                        $storeExists = $user->stores->contains('id', $storeId);
                    } elseif ($user->type === 'user' && $user->created_by) {
                        $creator = \App\Models\User::find($user->created_by);
                        if ($creator) {
                            $storeExists = $creator->stores->contains('id', $storeId);
                        }
                    }
                    
                    if ($storeExists) {
                        // Override the current_store with the one from the cookie
                        $user->current_store = $storeId;
                    }
                }

                if ($user && !in_array($user->type, ['company', 'superadmin']) ) {
                    $user->plan = $user->creator->plan;
                }
                
                // Get enabled addons (always fresh data)
                $enabledAddons = [];
                
                // In demo mode, check session for temporary language preference
                if (config('app.is_demo', false) && session('demo_language')) {
                    $locale = session('demo_language');
                } else {
                    $locale = $user->lang ?? $this->getSuperAdminLang();
                }
                return [
                    'user'        => $user,
                    'roles'       => $request->user()?->roles->pluck('name'),
                    'permissions' => $request->user()?->getAllPermissions()->pluck('name'),
                    'enabledAddons' => $enabledAddons,
                    'lang' => $locale,
                    'stores' => $stores
                ];
            },
            'isImpersonating' => session('impersonated_by') ? true : false,
            'ziggy' => fn(): array=> [
                 ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info'    => $request->session()->get('info'),
            ],
            'globalSettings' => $globalSettings,
            'superadminSettings' => !$request->is('install/*') && !$request->is('update/*') && file_exists(storage_path('installed')) ? array_merge(defaultSettings(), getSuperadminSettings()) : defaultSettings(),
            'storeCurrency' => $storeCurrency,
            'dynamicTitleText' => !$request->is('install/*') && !$request->is('update/*') && file_exists(storage_path('installed')) ? getSetting('titleText', config('app.name', 'StoreGo')) : config('app.name', 'StoreGo'),
            'referralSettings' => [
                'is_enabled' => !$request->is('install/*') && !$request->is('update/*') && file_exists(storage_path('installed')) ? ReferralSetting::isEnabled() : false,
            ],
            'is_demo' => config('app.is_demo', false),
            'stores' => function() use ($request) {
                $user = $request->user();
                if (!$user) return [];
                
                $stores = [];
                if ($user->type === 'company') {
                    $stores = $user->stores;
                } elseif ($user->type === 'user' && $user->created_by) {
                    $creator = \App\Models\User::find($user->created_by);
                    $stores = $creator ? $creator->stores : [];
                }
                
                // In demo mode, ensure current_store reflects the cookie value
                if (config('app.is_demo') && $request->cookie('demo_store_id')) {
                    $storeId = (int) $request->cookie('demo_store_id');
                    $storeExists = collect($stores)->contains('id', $storeId);
                    if ($storeExists && $user) {
                        $user->current_store = $storeId;
                    }
                }
                
                return $stores;
            }
        ];
    }
    
    /**
     * Filter out sensitive configuration keys that should not be shared with frontend
     *
     * @param array $settings
     * @return array
     */
    private function filterSensitiveSettings(array $settings): array
    {
        $sensitiveKeys = config('sensitive-keys');
        
        return array_diff_key($settings, array_flip($sensitiveKeys));
    }

    /**
     * Get superadmin language if user lang is not set
     */
    private function getSuperAdminLang(): string
    {
        $superAdmin = \App\Models\User::whereHas('roles', function($query) {
            $query->whereIn('name', ['superadmin', 'super admin']);
        })->first();
        
        return $superAdmin ? $superAdmin->lang ?? 'fr' : 'fr';
    }
    
    /**
     * Get currency settings from company settings for the current user
     */
    private function getStoreCurrencySettings(Request $request): array
    {
        $user = $request->user();
        
        // Default currency settings
        $defaultCurrency = [
            'code' => 'XOF',
            'symbol' => 'FCFA',
            'name' => 'Franc CFA (XOF)',
            'position' => 'after',
            'decimals' => 0,
            'decimal_separator' => '.',
            'thousands_separator' => ' '
        ];
        
        $store = $request->attributes->get('resolved_store');
        if (!$store) {
            $storeSlug = $request->route('storeSlug') ?? null;
            if ($storeSlug) {
                $store = Store::where('slug', $storeSlug)->first();
            }
        }
        
        // If still no store, try to resolve from the current domain host
        if (!$store) {
            $host = $request->getHost();
            $cleanHost = Store::sanitizeDomain($host);
            if ($cleanHost) {
                // Try custom domain
                $store = Store::where('custom_domain', $cleanHost)
                    ->where('enable_custom_domain', true)
                    ->first();
                
                // Try custom subdomain
                if (!$store) {
                    $store = Store::where('custom_subdomain', $cleanHost)
                        ->where('enable_custom_subdomain', true)
                        ->first();
                }
                
                // Try slug subdomain (e.g. slug.mystoreasap.com)
                if (!$store) {
                    $mainDomain = parse_url(config('app.url'), PHP_URL_HOST);
                    if ($mainDomain) {
                        $hostParts = explode('.', $cleanHost);
                        $mainDomainParts = explode('.', Store::sanitizeDomain($mainDomain));
                        if (count($hostParts) > count($mainDomainParts)) {
                            $subdomain = $hostParts[0];
                            if ($subdomain !== 'www') {
                                $store = Store::where('slug', $subdomain)
                                    ->where('is_active', true)
                                    ->first();
                            }
                        }
                    }
                }
            }
        }
        
        $userId = null;
        $storeId = null;
        
        if ($store) {
            $userId = $store->user_id;
            $storeId = $store->id;
        } elseif ($user) {
            $userId = $user->id;
            if ($user->type === 'company' && getCurrentStoreId($user)) {
                $storeId = getCurrentStoreId($user);
            }
        }
        
        if (!$userId) {
            return $defaultCurrency;
        }
        
        try {
            // Get store currency settings with fallback to user-wide settings
            $userSettings = settings($userId);
            $storeSettings = settings($userId, $storeId);
            $companySettings = array_merge(
                is_array($userSettings) ? $userSettings : [],
                is_array($storeSettings) ? $storeSettings : []
            );
            
            // Get currency code from settings
            $currencyCode = $companySettings['defaultCurrency'] ?? 'XOF';
            
            // Get currency details from currencies table
            $currency = Currency::where('code', $currencyCode)->first();
            
            if ($currency) {
                return [
                    'code' => $currency->code,
                    'symbol' => $currency->symbol,
                    'name' => $currency->name,
                    'position' => $companySettings['currencySymbolPosition'] ?? 'before',
                    'decimals' => 0, // Force 0 decimal places project-wide on shop
                    'decimal_separator' => $companySettings['decimalSeparator'] ?? '.',
                    'thousands_separator' => $companySettings['thousandsSeparator'] ?? ','
                ];
            }
            
            return $defaultCurrency;
        } catch (\Exception $e) {
            // Return default currency if any error occurs
            return $defaultCurrency;
        }
    }
}
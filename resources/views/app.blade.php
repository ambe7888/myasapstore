<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
                
                // Set demo mode flag
                window.isDemo = {{ config('app.is_demo') ? 'true' : 'false' }};
                
                // Set base URL for image helper
                window.appSettings = {
                    baseUrl: '{{ config('app.url') }}'
                };
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        @php
            $resolvedStore = request()->attributes->get('resolved_store');
            if (!$resolvedStore) {
                $storeSlug = request()->route('storeSlug') ?? null;
                if ($storeSlug) {
                    $resolvedStore = \App\Models\Store::where('slug', $storeSlug)->first();
                }
            }
            
            $appName = config('app.name', 'My Store Asap');
            $pageTitle = $resolvedStore ? ($resolvedStore->name . ' - ' . ($resolvedStore->tagline ?? 'Boutique en ligne')) : getSetting('titleText', $appName);
            $seoDesc = $resolvedStore ? ($resolvedStore->seo_description ?? $resolvedStore->description ?? 'Bienvenue sur notre boutique en ligne. Découvrez notre sélection de produits de qualité et commandez facilement.') : getSetting('seo_description', 'Plateforme e-commerce tout-en-un pour créer votre boutique en ligne, vos tunnels de vente et gérer votre caisse rapidement.');
            $seoKeywords = $resolvedStore ? ($resolvedStore->name . ', boutique en ligne, e-commerce, achat en ligne, produits') : getSetting('seo_keywords', 'e-commerce, boutique en ligne, tunnel de vente, caisse pos, vente en ligne, My Store Asap');
            $canonicalUrl = $resolvedStore ? ($resolvedStore->enable_custom_domain && $resolvedStore->custom_domain ? 'https://' . $resolvedStore->custom_domain : url($resolvedStore->slug)) : url()->current();
            $ogImage = $resolvedStore && $resolvedStore->logo ? asset('storage/' . $resolvedStore->logo) : asset('images/og-image.png');
            $storeName = $resolvedStore ? $resolvedStore->name : $appName;
        @endphp

        <title inertia>{{ $pageTitle }}</title>
        <meta name="description" content="{{ $seoDesc }}">
        <meta name="keywords" content="{{ $seoKeywords }}">
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
        <link rel="canonical" href="{{ $canonicalUrl }}" />

        <!-- Open Graph / Facebook / WhatsApp -->
        <meta property="og:type" content="{{ $resolvedStore ? 'website' : 'website' }}" />
        <meta property="og:site_name" content="{{ $storeName }}" />
        <meta property="og:title" content="{{ $pageTitle }}" />
        <meta property="og:description" content="{{ $seoDesc }}" />
        <meta property="og:url" content="{{ $canonicalUrl }}" />
        <meta property="og:image" content="{{ $ogImage }}" />
        <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}" />

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="{{ $pageTitle }}" />
        <meta name="twitter:description" content="{{ $seoDesc }}" />
        <meta name="twitter:image" content="{{ $ogImage }}" />

        <!-- Structured Data / Schema.org JSON-LD -->
        @php
            if ($resolvedStore) {
                $schemaData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'OnlineStore',
                    'name' => $resolvedStore->name,
                    'url' => $canonicalUrl,
                    'description' => $seoDesc,
                    'logo' => $ogImage,
                ];
            } else {
                $schemaData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'SoftwareApplication',
                    'name' => 'My Store Asap',
                    'applicationCategory' => 'BusinessApplication',
                    'operatingSystem' => 'All',
                    'url' => url('/'),
                    'description' => $seoDesc,
                ];
            }
        @endphp
        <script type="application/ld+json">
        {!! json_encode($schemaData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
        </script>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        <script src="{{ asset('js/jquery.min.js') }}"></script>

        <!-- PWA Manifest & App Meta Tags -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#00b87c">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="MyStoreAsap">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="application-name" content="My Store Asap">
        <link rel="apple-touch-icon" href="/images/pwa/icon-192x192.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/images/pwa/icon-152x152.png">

        <!-- PWA Service Worker Registration -->
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js', { scope: '/' })
                        .then(function(reg) {
                            console.log('[PWA] Service Worker registered:', reg.scope);
                        })
                        .catch(function(err) {
                            console.log('[PWA] Service Worker registration failed:', err);
                        });
                });
            }
        </script>

        @routes

        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead

        {{-- Inject store custom head HTML --}}
        @php
            if (isset($resolvedStore) && $resolvedStore) {
                $storeConfig = \App\Models\StoreConfiguration::getConfiguration($resolvedStore->id);
                $customHeadCode = $storeConfig['custom_head_code'] ?? '';
            }
        @endphp
        @if(isset($customHeadCode) && $customHeadCode)
            {!! $customHeadCode !!}
        @endif
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>

<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\Product;
use App\Models\Category;
use App\Models\CustomPage;
use App\Models\LandingPageCustomPage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    /**
     * Generate dynamic sitemap.xml for main platform or seller custom domain.
     */
    public function sitemap(Request $request)
    {
        $resolvedStore = $request->attributes->get('resolved_store');

        $urls = [];

        if ($resolvedStore) {
            // Seller custom domain / store sitemap
            $baseUrl = $resolvedStore->enable_custom_domain && $resolvedStore->custom_domain
                ? 'https://' . $resolvedStore->custom_domain
                : url($resolvedStore->slug);

            $urls[] = [
                'loc' => $baseUrl,
                'lastmod' => $resolvedStore->updated_at ? $resolvedStore->updated_at->toAtomString() : now()->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '1.0'
            ];

            // Store Products
            $products = Product::where('store_id', $resolvedStore->id)->where('is_active', true)->get();
            foreach ($products as $product) {
                $urls[] = [
                    'loc' => $baseUrl . '/product/' . $product->id,
                    'lastmod' => $product->updated_at ? $product->updated_at->toAtomString() : now()->toAtomString(),
                    'changefreq' => 'weekly',
                    'priority' => '0.8'
                ];
            }

            // Store Custom Pages
            $customPages = CustomPage::where('store_id', $resolvedStore->id)->where('status', 'published')->get();
            foreach ($customPages as $page) {
                $urls[] = [
                    'loc' => $baseUrl . '/page/' . $page->slug,
                    'lastmod' => $page->updated_at ? $page->updated_at->toAtomString() : now()->toAtomString(),
                    'changefreq' => 'monthly',
                    'priority' => '0.6'
                ];
            }
        } else {
            // Main SaaS Platform Sitemap
            $urls[] = [
                'loc' => url('/'),
                'lastmod' => now()->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '1.0'
            ];

            $landingPages = LandingPageCustomPage::where('is_active', true)->get();
            foreach ($landingPages as $page) {
                $urls[] = [
                    'loc' => url('/page/' . $page->slug),
                    'lastmod' => $page->updated_at ? $page->updated_at->toAtomString() : now()->toAtomString(),
                    'changefreq' => 'weekly',
                    'priority' => '0.7'
                ];
            }
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($urls as $url) {
            $xml .= '<url>';
            $xml .= '<loc>' . htmlspecialchars($url['loc']) . '</loc>';
            $xml .= '<lastmod>' . $url['lastmod'] . '</lastmod>';
            $xml .= '<changefreq>' . $url['changefreq'] . '</changefreq>';
            $xml .= '<priority>' . $url['priority'] . '</priority>';
            $xml .= '</url>';
        }
        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    /**
     * Generate dynamic robots.txt.
     */
    public function robots(Request $request)
    {
        $resolvedStore = $request->attributes->get('resolved_store');
        $sitemapUrl = $resolvedStore && $resolvedStore->enable_custom_domain && $resolvedStore->custom_domain
            ? 'https://' . $resolvedStore->custom_domain . '/sitemap.xml'
            : url('/sitemap.xml');

        $content = "User-agent: *\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /admin\n";
        $content .= "Disallow: /dashboard\n";
        $content .= "Disallow: /checkout\n";
        $content .= "Disallow: /cart\n";
        $content .= "Sitemap: " . $sitemapUrl . "\n";

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }
}

<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Store;
use App\Models\StoreConfiguration;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class FacebookCatalogController extends Controller
{
    /**
     * Generate Google/Meta Product Catalog XML Feed for Facebook Commerce Manager.
     */
    public function feed(Request $request, ?string $storeSlug = null): Response
    {
        // 1. Resolve Store
        $store = $request->attributes->get('store');

        if (!$store && $storeSlug) {
            $store = Store::where('slug', $storeSlug)->first();
        }

        if (!$store) {
            $currentHost = $request->getHost();
            $store = Store::where(function ($q) use ($currentHost) {
                $q->where('custom_domain', $currentHost)
                  ->orWhere('custom_subdomain', $currentHost);
            })->first();
        }

        if (!$store) {
            return response('Store not found', 404);
        }

        // 2. Resolve Store Base URL & Currency
        $config = StoreConfiguration::getConfiguration($store->id);
        $currency = strtoupper($config['currency'] ?? 'MAD');

        if ($store->enable_custom_domain && !empty($store->custom_domain)) {
            $baseUrl = 'https://' . $store->custom_domain;
        } elseif ($store->enable_custom_subdomain && !empty($store->custom_subdomain)) {
            $mainDomain = config('app.domain', 'mystoreasap.com');
            $baseUrl = 'https://' . $store->custom_subdomain . '.' . $mainDomain;
        } else {
            $appUrl = rtrim(config('app.url'), '/');
            $baseUrl = $appUrl . '/' . $store->slug;
        }

        // 3. Get Active Products
        $products = Product::where('store_id', $store->id)
            ->where('is_active', true)
            ->with('category')
            ->orderBy('id', 'desc')
            ->get();

        // 4. Construct XML Document
        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"/>');
        
        $channel = $xml->addChild('channel');
        $channel->addChild('title', htmlspecialchars($store->name . ' - Facebook Catalog'));
        $channel->addChild('link', htmlspecialchars($baseUrl));
        $channel->addChild('description', htmlspecialchars($store->description ?: 'Catalogue produits ' . $store->name));

        foreach ($products as $product) {
            $item = $channel->addChild('item');
            
            // ID & Basic Details
            $sku = !empty($product->sku) ? $product->sku : 'PROD-' . $product->id;
            $item->addChild('g:id', htmlspecialchars($sku), 'http://base.google.com/ns/1.0');
            $item->addChild('g:title', htmlspecialchars($product->name), 'http://base.google.com/ns/1.0');

            // Clean Description
            $rawDesc = !empty($product->description) ? strip_tags($product->description) : $product->name;
            $cleanDesc = trim(preg_replace('/\s+/', ' ', $rawDesc));
            $item->addChild('g:description', htmlspecialchars(mb_substr($cleanDesc, 0, 4900)), 'http://base.google.com/ns/1.0');

            // Product Link
            $productUrl = (str_starts_with($baseUrl, 'http') ? $baseUrl : 'https://' . $baseUrl) . '/product/' . $product->id;
            $item->addChild('g:link', htmlspecialchars($productUrl), 'http://base.google.com/ns/1.0');

            // Image Link
            $imagePath = $product->cover_image;
            if (empty($imagePath)) {
                $imageUrl = 'https://placehold.co/600x600?text=' . urlencode($product->name);
            } elseif (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
                $imageUrl = $imagePath;
            } else {
                $cleanImg = ltrim($imagePath, '/');
                $imageUrl = url('/' . $cleanImg);
            }
            $item->addChild('g:image_link', htmlspecialchars($imageUrl), 'http://base.google.com/ns/1.0');

            // Brand / Vendor
            $item->addChild('g:brand', htmlspecialchars($store->name), 'http://base.google.com/ns/1.0');
            
            // Condition
            $item->addChild('g:condition', 'new', 'http://base.google.com/ns/1.0');

            // Availability
            $isAvailable = ($product->stock === null || (int)$product->stock > 0);
            $availability = $isAvailable ? 'in stock' : 'out of stock';
            $item->addChild('g:availability', $availability, 'http://base.google.com/ns/1.0');

            // Price (Regular / Sale)
            $effectivePrice = ($product->sale_price && (float)$product->sale_price > 0 && (float)$product->sale_price < (float)$product->price)
                ? (float)$product->sale_price
                : (float)$product->price;

            $formattedPrice = number_format($effectivePrice, 2, '.', '') . ' ' . $currency;
            $item->addChild('g:price', $formattedPrice, 'http://base.google.com/ns/1.0');

            if ($product->sale_price && (float)$product->sale_price > 0 && (float)$product->sale_price < (float)$product->price) {
                $formattedOriginalPrice = number_format((float)$product->price, 2, '.', '') . ' ' . $currency;
                $domItem = dom_import_simplexml($item);
                $domPriceNodes = $domItem->getElementsByTagNameNS('http://base.google.com/ns/1.0', 'price');
                if ($domPriceNodes->length > 0) {
                    $domPriceNodes->item(0)->nodeValue = $formattedOriginalPrice;
                }
                $item->addChild('g:sale_price', $formattedPrice, 'http://base.google.com/ns/1.0');
            }

            // Category
            if ($product->category && !empty($product->category->name)) {
                $item->addChild('g:product_type', htmlspecialchars($product->category->name), 'http://base.google.com/ns/1.0');
            }
        }

        return response($xml->asXML(), 200)->header('Content-Type', 'text/xml; charset=utf-8');
    }
}

<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Sends automated seller notifications through Meta's official WhatsApp
 * Cloud API (Graph API), configured once by the platform superadmin and
 * used to alert every store owner on new orders — separate from the
 * existing WhatsAppService, which only builds a wa.me click-to-chat link
 * for the storefront's "pay via WhatsApp" checkout option.
 *
 * Meta's approved message templates only accept positional {{1}}, {{2}}...
 * placeholders, not named ones, so instead of a free-text template body
 * (like the messaging_message_template setting) the superadmin picks, in
 * order, which of the system's supported order variables fills each
 * position — matching whatever variables their approved template defines.
 */
class WhatsAppCloudApiService
{
    /**
     * Fixed Graph API version this integration is built against. Not user
     * configurable — bumping it is a code change, not a settings tweak.
     */
    private const API_VERSION = 'v21.0';

    private ?string $lastError = null;

    /**
     * Variable keys the system knows how to fill in, in the same spirit as
     * the order-confirmation message template's {store_name}/{order_no}/...
     * placeholders. Shown to the superadmin as a dropdown per template
     * position so every position always resolves to a real value.
     */
    public static function supportedVariables(): array
    {
        return [
            'store_name' => __('Store name'),
            'order_no' => __('Order number'),
            'customer_name' => __('Customer name'),
            'customer_phone' => __('Customer phone'),
            'items_summary' => __('Order items (product, variant, quantity)'),
            'final_total' => __('Order total'),
            'sub_total' => __('Subtotal'),
            'qty_total' => __('Total quantity'),
            'shipping_amount' => __('Shipping cost'),
            'discount_amount' => __('Discount amount'),
            'total_tax' => __('Tax amount'),
            'shipping_address' => __('Shipping address'),
            'shipping_city' => __('Shipping city'),
            'shipping_country' => __('Shipping country'),
            'shipping_postalcode' => __('Shipping postal code'),
            'order_date' => __('Order date'),
            'payment_method' => __('Payment method'),
        ];
    }

    /**
     * Variables that can fill the template's dynamic URL button, kept
     * separate from supportedVariables() because most of those (e.g.
     * shipping address) would build a broken link — only values that are
     * safe to drop into a URL path belong here.
     */
    public static function supportedLinkVariables(): array
    {
        return [
            'order_id' => __('Order ID (for the order link)'),
        ];
    }

    public function isEnabled(): bool
    {
        return getSetting('whatsapp_cloud_enabled', '0') === '1';
    }

    /**
     * Notify the store owner of a newly placed order via an approved
     * WhatsApp message template. Meta only allows business-initiated
     * messages (i.e. not a reply within a 24h customer window) through a
     * pre-approved template, so this always sends a template message.
     */
    public function sendOrderNotification(Order $order): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        $store = $order->store;
        if (!$store || !$store->user) {
            return false;
        }

        $to = $this->cleanNumber($store->user->phone);
        if (!$to) {
            Log::warning('WhatsApp Cloud API: seller has no usable phone number', ['store_id' => $store->id]);
            return false;
        }

        $values = $this->resolveOrderVariables($order);
        $bodyParams = array_map(
            fn (string $key) => $values[$key] ?? '',
            $this->getConfiguredVariableKeys()
        );

        $linkValues = ['order_id' => (string) $order->id];
        $linkParam = $this->getConfiguredLinkVariable();
        $linkValue = $linkParam !== null ? ($linkValues[$linkParam] ?? null) : null;

        return $this->sendTemplate($to, $bodyParams, $linkValue);
    }

    /**
     * Send the configured template with placeholder values so the
     * superadmin can verify the integration from the settings page
     * without waiting for a real order.
     */
    public function sendTestNotification(string $to): bool|string
    {
        $cleanTo = $this->cleanNumber($to);
        if (!$cleanTo) {
            return 'Numéro de téléphone invalide.';
        }

        $sampleValues = [
            'store_name' => 'Boutique Test',
            'order_no' => 'TEST-0001',
            'customer_name' => 'Client Test',
            'customer_phone' => '+225 07 00 00 00 00',
            'items_summary' => "1x Chaussure Berluti (Rouge, 42) - 45 000\n2x Sac Lacoste - 18 000",
            'final_total' => '15 000',
            'sub_total' => '14 000',
            'qty_total' => '2',
            'shipping_amount' => '1 000',
            'discount_amount' => '0',
            'total_tax' => '0',
            'shipping_address' => 'Cocody, Rue des Jardins',
            'shipping_city' => 'Abidjan',
            'shipping_country' => 'Côte d\'Ivoire',
            'shipping_postalcode' => '00225',
            'order_date' => now()->format('d/m/Y H:i'),
            'payment_method' => 'Espèces',
        ];

        $bodyParams = array_map(
            fn (string $key) => $sampleValues[$key] ?? $key,
            $this->getConfiguredVariableKeys()
        );

        $sampleLinkValues = ['order_id' => '1'];
        $linkParam = $this->getConfiguredLinkVariable();
        $linkValue = $linkParam !== null ? ($sampleLinkValues[$linkParam] ?? null) : null;

        $result = $this->sendTemplate($cleanTo, $bodyParams, $linkValue);

        return $result === true ? true : ($this->lastError ?? 'Échec de l\'envoi.');
    }

    /**
     * The superadmin's configured, ordered list of variable keys — one per
     * template position. Falls back to a sensible 3-variable default so a
     * fresh install still sends something meaningful.
     */
    private function getConfiguredVariableKeys(): array
    {
        $raw = getSetting('whatsapp_cloud_template_variables');
        $keys = $raw ? json_decode($raw, true) : null;

        if (!is_array($keys) || empty($keys)) {
            return ['store_name', 'order_no', 'final_total'];
        }

        $supported = array_keys(self::supportedVariables());
        return array_values(array_filter($keys, fn ($key) => in_array($key, $supported, true)));
    }

    /**
     * The superadmin's chosen variable for the template's dynamic URL
     * button, or null when no button is configured (empty setting = no
     * button component sent at all).
     */
    private function getConfiguredLinkVariable(): ?string
    {
        $key = getSetting('whatsapp_cloud_link_variable');
        if (!$key || !in_array($key, array_keys(self::supportedLinkVariables()), true)) {
            return null;
        }

        return $key;
    }

    private function resolveOrderVariables(Order $order): array
    {
        $shippingCity = $order->shipping_city ? (\App\Models\City::find($order->shipping_city)->name ?? $order->shipping_city) : '';
        $shippingCountry = $order->shipping_country ? (\App\Models\Country::find($order->shipping_country)->name ?? $order->shipping_country) : '';

        return [
            'store_name' => $order->store->name ?? '',
            'order_no' => $order->order_number,
            'customer_name' => trim($order->customer_first_name . ' ' . $order->customer_last_name),
            'customer_phone' => $order->customer_phone ?? '',
            'items_summary' => $this->buildItemsSummary($order),
            'final_total' => number_format($order->total_amount, 2),
            'sub_total' => number_format($order->subtotal, 2),
            'qty_total' => (string) $order->items->sum('quantity'),
            'shipping_amount' => number_format($order->shipping_amount, 2),
            'discount_amount' => number_format($order->discount_amount, 2),
            'total_tax' => number_format($order->tax_amount, 2),
            'shipping_address' => $order->shipping_address ?? '',
            'shipping_city' => $shippingCity,
            'shipping_country' => $shippingCountry,
            'shipping_postalcode' => $order->shipping_postal_code ?? '',
            'order_date' => $order->created_at->format('d/m/Y H:i'),
            'payment_method' => ucfirst($order->payment_method ?? ''),
        ];
    }

    /**
     * Meta templates can't loop over a variable number of items, so this
     * flattens the order's line items (with variant and quantity) into one
     * multi-line block that fills a single {{n}} position — the same
     * approach WhatsAppService uses for its {item_variable} placeholder.
     */
    private function buildItemsSummary(Order $order): string
    {
        $lines = [];

        foreach ($order->items as $item) {
            $variants = $item->product_variants;
            $variant = '';

            if (is_array($variants) && !empty($variants)) {
                $variantParts = [];
                foreach ($variants as $key => $value) {
                    $variantParts[] = is_numeric($key) ? $value : "$key: $value";
                }
                $variant = implode(', ', $variantParts);
            } elseif (is_string($variants) && $variants && $variants !== '[]' && $variants !== 'null') {
                $variant = $variants;
            }

            $label = $item->product_name . ($variant !== '' ? " ({$variant})" : '');
            $lines[] = "{$item->quantity}x {$label} - " . number_format($item->total_price, 2);
        }

        return implode("\n", $lines);
    }

    /**
     * $linkValue, when set, becomes the dynamic suffix Meta appends to the
     * template's URL button — e.g. a button configured as
     * https://mystoreasap.com/orders/{{1}} resolves to
     * https://mystoreasap.com/orders/458 when $linkValue is "458". Null
     * means no button component is sent (either no button is configured,
     * or the chosen variable has no value for this order).
     */
    private function sendTemplate(string $to, array $bodyParams, ?string $linkValue = null): bool
    {
        $accessToken = getSetting('whatsapp_cloud_access_token');
        $phoneNumberId = getSetting('whatsapp_cloud_phone_number_id');
        $templateName = getSetting('whatsapp_cloud_template_name', 'new_order_notification');
        $lang = getSetting('whatsapp_cloud_template_lang', 'fr');

        if (!$accessToken || !$phoneNumberId) {
            $this->lastError = 'Identifiants WhatsApp Cloud API manquants.';
            return false;
        }

        $components = [];

        if (!empty($bodyParams)) {
            $components[] = [
                'type' => 'body',
                'parameters' => array_map(
                    fn ($param) => ['type' => 'text', 'text' => (string) $param],
                    $bodyParams
                ),
            ];
        }

        if ($linkValue !== null) {
            $components[] = [
                'type' => 'button',
                'sub_type' => 'url',
                'index' => '0',
                'parameters' => [
                    ['type' => 'text', 'text' => $linkValue],
                ],
            ];
        }

        try {
            $response = Http::withToken($accessToken)->post(
                'https://graph.facebook.com/' . self::API_VERSION . "/{$phoneNumberId}/messages",
                [
                    'messaging_product' => 'whatsapp',
                    'to' => $to,
                    'type' => 'template',
                    'template' => [
                        'name' => $templateName,
                        'language' => ['code' => $lang],
                        'components' => $components,
                    ],
                ]
            );

            if ($response->failed()) {
                $this->lastError = $response->json('error.message') ?? $response->body();
                Log::warning('WhatsApp Cloud API notification failed: ' . $this->lastError);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            $this->lastError = $e->getMessage();
            Log::error('WhatsApp Cloud API request error: ' . $e->getMessage());
            return false;
        }
    }

    private function cleanNumber(?string $number): ?string
    {
        if (!$number) {
            return null;
        }
        $cleaned = preg_replace('/[^0-9]/', '', $number);
        return (strlen($cleaned) >= 10 && strlen($cleaned) <= 15) ? $cleaned : null;
    }
}

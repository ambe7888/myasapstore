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
 */
class WhatsAppCloudApiService
{
    private ?string $lastError = null;

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

        return $this->sendTemplate($to, [
            $store->name,
            $order->order_number,
            number_format($order->total_amount, 2),
        ]);
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

        $result = $this->sendTemplate($cleanTo, ['Boutique Test', 'TEST-0001', '0.00'], true);

        return $result === true ? true : ($this->lastError ?? 'Échec de l\'envoi.');
    }

    private function sendTemplate(string $to, array $bodyParams, bool $throwDetails = false): bool
    {
        $accessToken = getSetting('whatsapp_cloud_access_token');
        $phoneNumberId = getSetting('whatsapp_cloud_phone_number_id');
        $templateName = getSetting('whatsapp_cloud_template_name', 'new_order_notification');
        $lang = getSetting('whatsapp_cloud_template_lang', 'fr');
        $apiVersion = getSetting('whatsapp_cloud_api_version', 'v20.0');

        if (!$accessToken || !$phoneNumberId) {
            $this->lastError = 'Identifiants WhatsApp Cloud API manquants.';
            return false;
        }

        try {
            $response = Http::withToken($accessToken)->post(
                "https://graph.facebook.com/{$apiVersion}/{$phoneNumberId}/messages",
                [
                    'messaging_product' => 'whatsapp',
                    'to' => $to,
                    'type' => 'template',
                    'template' => [
                        'name' => $templateName,
                        'language' => ['code' => $lang],
                        'components' => [[
                            'type' => 'body',
                            'parameters' => array_map(
                                fn ($param) => ['type' => 'text', 'text' => (string) $param],
                                $bodyParams
                            ),
                        ]],
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

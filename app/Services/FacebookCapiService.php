<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FacebookCapiService
{
    public static function sendPurchaseEvent(Order $order): void
    {
        try {
            $store = $order->store;
            if (!$store) {
                return;
            }

            $config = \App\Models\StoreConfiguration::getConfiguration($store->id);
            $pixelId = $config['facebook_pixel'] ?? null;
            $accessToken = $config['facebook_capi_token'] ?? null;

            if (empty($pixelId) || empty($accessToken)) {
                return;
            }

            // Hashing helper as required by Facebook CAPI specs (SHA-256)
            $hash = function ($value) {
                return $value ? hash('sha256', strtolower(trim($value))) : null;
            };

            $email = $order->customer_email;
            $phone = $order->customer_phone;
            
            $userData = [
                'client_ip_address' => request()->ip(),
                'client_user_agent' => request()->userAgent(),
            ];

            if ($email) {
                $userData['em'] = [$hash($email)];
            }
            if ($phone) {
                $userData['ph'] = [$hash($phone)];
            }

            $eventData = [
                'event_name' => 'Purchase',
                'event_time' => time(),
                'event_id' => 'purchase_' . $order->order_number,
                'user_data' => $userData,
                'custom_data' => [
                    'currency' => strtoupper($config['currency'] ?? 'MAD'),
                    'value' => (float)$order->total_amount,
                ],
                'action_source' => 'website',
                'event_source_url' => request()->fullUrl(),
            ];

            $response = Http::post("https://graph.facebook.com/v19.0/{$pixelId}/events", [
                'data' => [$eventData],
                'access_token' => $accessToken,
            ]);

            if ($response->failed()) {
                Log::error('Facebook CAPI event failed', [
                    'store_id' => $store->id,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Facebook CAPI error', [
                'error' => $e->getMessage()
            ]);
        }
    }
}

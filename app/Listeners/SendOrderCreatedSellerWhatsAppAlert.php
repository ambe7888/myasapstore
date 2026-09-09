<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Services\WhatsAppCloudApiService;
use Illuminate\Support\Facades\Log;

/**
 * Notifies the store owner (seller) of every new order via the platform's
 * WhatsApp Cloud API integration, regardless of which payment method the
 * customer chose. This is independent of SendOrderCreatedWhatsApp, which
 * only fires when the customer themselves picked "pay via WhatsApp".
 */
class SendOrderCreatedSellerWhatsAppAlert
{
    public function __construct(private WhatsAppCloudApiService $service)
    {
    }

    public function handle(OrderCreated $event): void
    {
        try {
            $this->service->sendOrderNotification($event->order);
        } catch (\Throwable $e) {
            Log::error('Seller WhatsApp order alert failed: ' . $e->getMessage());
        }
    }
}

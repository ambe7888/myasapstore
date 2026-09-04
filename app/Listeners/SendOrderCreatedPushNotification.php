<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Services\ExpoPushService;

class SendOrderCreatedPushNotification
{
    public function handle(OrderCreated $event): void
    {
        $order = $event->order;
        $store = $order->store;

        if (!$store || !$store->user_id) {
            return;
        }

        ExpoPushService::sendToUser(
            $store->user_id,
            'Nouvelle commande !',
            sprintf('Commande #%s - %s', $order->order_number, number_format((float) $order->total_amount, 2)),
            ['type' => 'order', 'order_id' => $order->id]
        );
    }
}

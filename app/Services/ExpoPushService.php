<?php

namespace App\Services;

use App\Models\DeviceToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Sends push notifications to the seller mobile app via Expo's push service
 * (https://exp.host/--/api/v2/push/send). No native FCM/APNs setup needed —
 * Expo handles delivery to both platforms from a single HTTP call.
 */
class ExpoPushService
{
    private const PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

    public static function sendToUser(int $userId, string $title, string $body, array $data = []): void
    {
        $tokens = DeviceToken::where('user_id', $userId)->pluck('token');

        if ($tokens->isEmpty()) {
            return;
        }

        $messages = $tokens->map(fn (string $token) => [
            'to' => $token,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'sound' => 'default',
        ])->values()->all();

        try {
            Http::timeout(5)->post(self::PUSH_ENDPOINT, $messages);
        } catch (\Throwable $e) {
            Log::warning('Expo push notification failed: ' . $e->getMessage());
        }
    }
}

<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\WhatsAppCloudApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SendPlanExpiryWhatsAppAlerts extends Command
{
    protected $signature = 'plans:send-expiry-whatsapp-alerts';

    protected $description = "Send a WhatsApp alert to company owners whose plan subscription expires today";

    public function handle(WhatsAppCloudApiService $service): int
    {
        if (!$service->isEnabled()) {
            return 0;
        }

        $users = User::where('type', 'company')
            ->where('plan_is_active', 1)
            ->whereDate('plan_expire_date', today())
            ->get();

        $sent = 0;

        foreach ($users as $user) {
            // The scheduler runs this daily; guard against sending twice if
            // it's ever triggered more than once on the same day.
            $cacheKey = 'plan_expiry_whatsapp_alert_' . $user->id . '_' . today()->toDateString();
            if (Cache::has($cacheKey)) {
                continue;
            }
            Cache::put($cacheKey, true, now()->addHours(25));

            try {
                if ($service->sendPlanExpiryAlert($user)) {
                    $sent++;
                }
            } catch (\Throwable $e) {
                Log::error('Plan expiry WhatsApp alert failed: ' . $e->getMessage(), ['user_id' => $user->id]);
            }
        }

        $this->info("Sent {$sent} plan expiry WhatsApp alert(s).");

        return 0;
    }
}

<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

$users = App\Models\User::where('type','company')->get();
foreach($users as $u) {
    echo "=== User: {$u->name} (id={$u->id}) ===\n";
    echo "plan_id: {$u->plan_id}\n";
    echo "plan_is_active: {$u->plan_is_active}\n";
    echo "plan_expire_date: {$u->plan_expire_date}\n";
    echo "is_trial: {$u->is_trial}\n";
    echo "trial_expire_date: {$u->trial_expire_date}\n";
    echo "needsPlanSubscription: " . ($u->needsPlanSubscription() ? 'true' : 'false') . "\n";
    echo "isPlanExpired: " . ($u->isPlanExpired() ? 'true' : 'false') . "\n";
    echo "isTrialExpired: " . ($u->isTrialExpired() ? 'true' : 'false') . "\n\n";
}

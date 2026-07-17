<?php
/**
 * Script de mise à jour directe de la Landing Page en Base de Données
 * Usage: https://votre-domaine.com/update-landing.php?key=secret123
 */

define('LARAVEL_START', microtime(true));

if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    die("Erreur : Fichier vendor/autoload.php introuvable.");
}

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\LandingPageSetting;
use Illuminate\Support\Facades\Artisan;

$secretKey = 'secret123';
if (($_GET['key'] ?? '') !== $secretKey) {
    http_response_code(403);
    die("<h1>Accès refusé</h1><p>Veuillez passer ?key=$secretKey</p>");
}

echo "<!DOCTYPE html><html><head><title>Update Landing Page DB</title><style>body{font-family:sans-serif;background:#1e1e1e;color:#00ff00;padding:20px;}pre{background:#252526;padding:10px;border-radius:5px;color:#fff;}</style></head><body>";
echo "<h1>🚀 Mise à jour Directe de la Landing Page dans la Base de Données</h1>";

try {
    // 1. Exécuter la migration
    Artisan::call('migrate', ['--force' => true]);
    echo "<h2>1. Exécution des migrations :</h2>";
    echo "<pre>" . Artisan::output() . "</pre>";

    // 2. Mise à jour des textes en français dans la base de données
    $setting = LandingPageSetting::first();
    if ($setting) {
        $setting->delete(); // Supprime l'ancien enregistrement en anglais
    }
    
    // Génère les nouveaux paramètres entièrement traduits en français
    LandingPageSetting::getSettings();
    
    echo "<h2>2. Mise à jour de la table `landing_page_settings` :</h2>";
    echo "<p>✅ Enregistrement en français avec <strong>My Store Asap</strong> généré avec succès !</p>";

    // 3. Effacer les caches
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    echo "<h2>3. Nettoyage des caches :</h2>";
    echo "<p>✅ Caches réinitialisés.</p>";

    echo "<h2 style='color:#00ff00;'>🎉 Tout est mis à jour en base de données et dans le code !</h2>";

} catch (\Throwable $e) {
    echo "<h2 style='color:#ff5555;'>❌ Erreur :</h2>";
    echo "<pre style='color:#ff5555;'>" . $e->getMessage() . "</pre>";
}

echo "</body></html>";

<?php
/**
 * Script d'initialisation et de maintenance sans terminal SSH / cPanel.
 * Usage: https://votre-domaine.com/deploy-helper.php?key=secret123
 */

define('LARAVEL_START', microtime(true));

if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    die("Erreur : Le dossier 'vendor' est introuvable. Veuillez uploader le dossier 'vendor' exécuté via 'composer install'.");
}

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Artisan;

// Sécurité : Vérification de la clé secrète dans l'URL
$secretKey = 'secret123'; // Vous pouvez modifier ce mot de passe
if (($_GET['key'] ?? '') !== $secretKey) {
    http_response_code(403);
    die("<h1>Accès refusé</h1><p>Clé secrète invalide. Exemple : deploy-helper.php?key=$secretKey</p>");
}

$action = $_GET['action'] ?? 'all';

echo "<!DOCTYPE html><html><head><title>cPanel Deploy Helper</title><style>body{font-family:monospace;background:#1e1e1e;color:#00ff00;padding:20px;}h2{color:#fff;border-bottom:1px solid #444;padding-bottom:5px;}</style></head><body>";
echo "<h1>🚀 Deploy Helper - Initialisation Laravel</h1>";

try {
    if (in_array($action, ['all', 'key'])) {
        echo "<h2>1. Clé d'application (key:generate)</h2>";
        Artisan::call('key:generate', ['--force' => true]);
        echo "<pre>" . Artisan::output() . "</pre>";
    }

    if (in_array($action, ['all', 'storage'])) {
        echo "<h2>2. Lien symbolique Storage (storage:link)</h2>";
        Artisan::call('storage:link');
        echo "<pre>" . Artisan::output() . "</pre>";
    }

    if (in_array($action, ['all', 'migrate'])) {
        echo "<h2>3. Base de données & Migrations (migrate --seed)</h2>";
        Artisan::call('migrate', ['--force' => true]);
        Artisan::call('db:seed', ['--force' => true]);
        echo "<pre>" . Artisan::output() . "</pre>";
    }

    if (in_array($action, ['all', 'cache'])) {
        echo "<h2>4. Nettoyage et Optimisation du Cache</h2>";
        Artisan::call('config:clear');
        Artisan::call('cache:clear');
        Artisan::call('view:clear');
        Artisan::call('route:clear');
        Artisan::call('optimize');
        echo "<pre>" . Artisan::output() . "</pre>";
    }

    echo "<h2 style='color:#00ff00;'>✅ Déploiement et configuration terminés avec succès !</h2>";
    echo "<p style='color:#ff9900;'>⚠️ Pour des raisons de sécurité, supprimez ou désactivez ce fichier ('deploy-helper.php') après l'initialisation.</p>";

} catch (\Throwable $e) {
    echo "<h2 style='color:#ff5555;'>❌ Erreur rencontrée :</h2>";
    echo "<pre style='color:#ff5555;'>" . $e->getMessage() . "\n" . $e->getTraceAsString() . "</pre>";
}

echo "</body></html>";

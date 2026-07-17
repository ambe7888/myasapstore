<?php
/**
 * Script de réparation et de synchronisation des images pour cPanel
 * Usage: https://votre-domaine.com/fix-storage.php?key=secret123
 */

$secretKey = 'secret123';
if (($_GET['key'] ?? '') !== $secretKey) {
    http_response_code(403);
    die("<h1>Accès refusé</h1><p>Veuillez passer ?key=$secretKey</p>");
}

echo "<!DOCTYPE html><html><head><title>Fix Storage Images</title><style>body{font-family:sans-serif;background:#1e1e1e;color:#00ff00;padding:20px;}pre{background:#252526;padding:10px;border-radius:5px;color:#fff;}code{color:#ff9900;}</style></head><body>";
echo "<h1>🔧 Réparation du Stockage d'Images (cPanel)</h1>";

$baseDir = __DIR__;
$targetDir = $baseDir . '/storage/app/public';
$publicStorageLink = $baseDir . '/public/storage';

// 1. Créer le dossier cible s'il n'existe pas
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
    echo "<p>✅ Dossier <code>storage/app/public</code> créé.</p>";
}

// 2. Nettoyer l'ancien lien s'il existe et est cassé
if (file_exists($publicStorageLink) || is_link($publicStorageLink)) {
    if (is_link($publicStorageLink)) {
        @unlink($publicStorageLink);
        echo "<p>ℹ️ Ancien lien symbolique <code>public/storage</code> réinitialisé.</p>";
    } elseif (is_dir($publicStorageLink) && count(scandir($publicStorageLink)) <= 2) {
        @rmdir($publicStorageLink);
        echo "<p>ℹ️ Ancien dossier vide <code>public/storage</code> supprimé.</p>";
    }
}

// 3. Tenter de créer le lien symbolique
$symlinkCreated = false;
if (!file_exists($publicStorageLink) && function_exists('symlink')) {
    try {
        if (@symlink($targetDir, $publicStorageLink)) {
            $symlinkCreated = true;
            echo "<p>✅ <strong>Lien symbolique créé avec succès :</strong><br><code>public/storage</code> ➔ <code>storage/app/public</code></p>";
        } else {
            echo "<p style='color:#ff9900;'>⚠️ Fonction symlink() bloquée par l'hébergeur. Bascule en mode dossier physique synchronisé.</p>";
        }
    } catch (\Throwable $e) {
        echo "<p style='color:#ff9900;'>⚠️ Erreur symlink : " . htmlspecialchars($e->getMessage()) . "</p>";
    }
}

// 4. Si symlink est désactivé sur cPanel, créer un dossier physique et copier les fichiers
if (!$symlinkCreated && !is_link($publicStorageLink)) {
    if (!file_exists($publicStorageLink)) {
        mkdir($publicStorageLink, 0755, true);
        echo "<p>✅ Dossier physique <code>public/storage</code> créé.</p>";
    }

    function syncDirs($src, $dst) {
        if (!file_exists($src)) return;
        $dir = opendir($src);
        @mkdir($dst, 0755, true);
        while (false !== ($file = readdir($dir))) {
            if (($file != '.') && ($file != '..')) {
                if (is_dir($src . '/' . $file)) {
                    syncDirs($src . '/' . $file, $dst . '/' . $file);
                } else {
                    copy($src . '/' . $file, $dst . '/' . $file);
                }
            }
        }
        closedir($dir);
    }

    syncDirs($targetDir, $publicStorageLink);
    echo "<p>✅ Fichiers synchronisés de <code>storage/app/public</code> vers <code>public/storage</code>.</p>";
}

// 5. Créer les sous-dossiers nécessaires
$subDirs = ['media', 'uploads', 'products', 'avatars', 'stores', 'placeholder'];
foreach ($subDirs as $sub) {
    $d1 = $targetDir . '/' . $sub;
    $d2 = $publicStorageLink . '/' . $sub;
    if (!file_exists($d1)) @mkdir($d1, 0755, true);
    if (!file_exists($d2) && !$symlinkCreated) @mkdir($d2, 0755, true);
}

echo "<h2>📊 État du système :</h2>";
echo "<pre>";
echo "Base Dir       : " . $baseDir . "\n";
echo "Target Dir     : " . $targetDir . " (Existe: " . (file_exists($targetDir) ? "Oui" : "Non") . ")\n";
echo "Public Storage : " . $publicStorageLink . " (Existe: " . (file_exists($publicStorageLink) ? "Oui" : "Non") . " | Est Symlink: " . (is_link($publicStorageLink) ? "Oui" : "Non") . ")\n";
echo "</pre>";

echo "<p style='color:#00ff00;font-weight:bold;font-size:16px;'>🎉 Réparation terminée ! Rechargez votre site pour voir les images.</p>";
echo "</body></html>";

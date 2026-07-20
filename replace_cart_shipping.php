<?php

function replaceCartShipping($dir) {
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    foreach ($iterator as $file) {
        if ($file->isDir()) continue;
        if ($file->getExtension() === 'tsx') {
            $path = $file->getRealPath();
            
            // Only targets cart files (e.g. WatchesCart.tsx, cart.tsx, FurnitureCart.tsx, etc.)
            if (stripos($path, 'cart') !== false) {
                $content = file_get_contents($path);
                $original = $content;
                
                // Replace Free/Gratuit displays in cart summaries
                $content = str_replace("=== 0 ? 'Gratuit' : formatCurrency(summary.shipping", "=== 0 ? 'Calculé à la caisse' : formatCurrency(summary.shipping", $content);
                $content = str_replace("=== 0 ? 'Gratuit' : formatCurrency(dynamicSummary.shipping", "=== 0 ? 'Calculé à la caisse' : formatCurrency(dynamicSummary.shipping", $content);
                
                if ($content !== $original) {
                    file_put_contents($path, $content);
                    echo "Updated shipping calculation display in cart: $path\n";
                }
            }
        }
    }
}

replaceCartShipping(__DIR__ . '/resources/js/pages/store');
echo "Replacement finished successfully!\n";

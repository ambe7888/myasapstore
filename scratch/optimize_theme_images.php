<?php

$dir = __DIR__ . '/../public/storage/placeholder/themes';

if (!is_dir($dir)) {
    echo "Directory not found: $dir\n";
    exit(1);
}

$files = glob($dir . '/*.{png,jpg,jpeg,webp}', GLOB_BRACE);

foreach ($files as $filePath) {
    $filename = basename($filePath);
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    
    // Skip already optimized webp if tiny
    $sizeBefore = filesize($filePath);
    
    // Load image
    $img = null;
    if ($ext === 'png') {
        $img = @imagecreatefrompng($filePath);
    } elseif ($ext === 'jpg' || $ext === 'jpeg') {
        $img = @imagecreatefromjpeg($filePath);
    } elseif ($ext === 'webp') {
        $img = @imagecreatefromwebp($filePath);
    }
    
    if (!$img) {
        continue;
    }
    
    $origWidth = imagesx($img);
    $origHeight = imagesy($img);
    
    // Target width: 700px (perfect for cards and previews)
    $targetWidth = 700;
    if ($origWidth > $targetWidth) {
        $targetHeight = (int)round(($origHeight / $origWidth) * $targetWidth);
        $resized = imagecreatetruecolor($targetWidth, $targetHeight);
        
        // Preserve alpha
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        
        imagecopyresampled($resized, $img, 0, 0, 0, 0, $targetWidth, $targetHeight, $origWidth, $origHeight);
        imagedestroy($img);
        $img = $resized;
    }
    
    // Save as compressed WebP
    $webpPath = pathinfo($filePath, PATHINFO_DIRNAME) . '/' . pathinfo($filePath, PATHINFO_FILENAME) . '.webp';
    imagewebp($img, $webpPath, 80);
    
    // Save as compressed PNG (if original was png)
    if ($ext === 'png') {
        imagepng($img, $filePath, 7);
    }
    
    imagedestroy($img);
    
    $sizeAfter = filesize($webpPath);
    echo "Optimized $filename: " . round($sizeBefore / 1024, 1) . " KB -> " . round($sizeAfter / 1024, 1) . " KB\n";
}

echo "Image optimization completed!\n";

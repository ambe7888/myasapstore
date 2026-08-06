<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\LandingPageSetting;
use App\Models\Setting;

echo "--- 1. Updating Landing Page Settings DB ---\n";
$s = LandingPageSetting::first();
if ($s) {
    $cs = $s->config_sections;
    if (isset($cs['sections'])) {
        foreach ($cs['sections'] as &$sec) {
            if (($sec['key'] ?? '') === 'templates') {
                $sec['title'] = 'Explorez nos thèmes de boutiques e-commerce';
                $sec['subtitle'] = 'Choisissez parmi nos thèmes professionnels prêts à l\'emploi, spécialement conçus pour sublimer vos produits et maximiser vos ventes.';
                $sec['templates_list'] = [
                    ['name' => 'fashion', 'label' => 'Mode & Habillement', 'category' => 'Mode', 'image' => '/storage/placeholder/themes/fashion.webp'],
                    ['name' => 'electronics', 'label' => 'Électronique & High-Tech', 'category' => 'High-Tech', 'image' => '/storage/placeholder/themes/electronics.webp'],
                    ['name' => 'beauty-cosmetics', 'label' => 'Beauté & Cosmétiques', 'category' => 'Beauté', 'image' => '/storage/placeholder/themes/beauty-cosmetics.webp'],
                    ['name' => 'jewelry', 'label' => 'Bijouterie & Joaillerie', 'category' => 'Luxe', 'image' => '/storage/placeholder/themes/jewelry.webp'],
                    ['name' => 'watches', 'label' => 'Horlogerie & Montres', 'category' => 'Luxe', 'image' => '/storage/placeholder/themes/watches.webp'],
                    ['name' => 'furniture-interior', 'label' => 'Meubles & Intérieur', 'category' => 'Maison', 'image' => '/storage/placeholder/themes/furniture-interior.webp'],
                    ['name' => 'cars-automotive', 'label' => 'Automobile & Accessoires', 'category' => 'Auto', 'image' => '/storage/placeholder/themes/cars-automotive.webp'],
                    ['name' => 'baby-kids', 'label' => 'Bébé & Enfants', 'category' => 'Enfants', 'image' => '/storage/placeholder/themes/baby-kids.webp'],
                    ['name' => 'perfume-fragrances', 'label' => 'Parfumerie & Fragrances', 'category' => 'Beauté', 'image' => '/storage/placeholder/themes/perfume-fragrances.webp'],
                    ['name' => 'home-accessories', 'label' => 'Maison & Décoration', 'category' => 'Maison', 'image' => '/storage/placeholder/themes/home-accessories.webp']
                ];
            }
        }
    }
    $s->config_sections = $cs;
    $s->save();
    echo "Landing Page Settings updated in DB!\n";
} else {
    echo "No LandingPageSetting record found.\n";
}

echo "\n--- 2. Updating System Email Settings DB ---\n";
$emailSettings = [
    'email_provider' => 'smtp',
    'email_driver' => 'smtp',
    'email_host' => 'mail.mystoreasap.com',
    'email_port' => '465',
    'email_username' => 'info@mystoreasap.com',
    'email_password' => 'V~{-3L94P)hJl6j&',
    'email_encryption' => 'ssl',
    'email_from_address' => 'info@mystoreasap.com',
    'email_from_name' => 'My Store Asap'
];

foreach ($emailSettings as $name => $val) {
    updateSetting($name, $val, null, null);
    echo "Updated setting: $name = $val\n";
}

echo "\nALL DONE SUCCESSFULLY!\n";

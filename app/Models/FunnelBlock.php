<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FunnelBlock extends Model
{
    protected $fillable = [
        'funnel_id',
        'type',
        'sort_order',
        'is_visible',
        'settings',
    ];

    protected $casts = [
        'settings'   => 'array',
        'is_visible' => 'boolean',
        'sort_order' => 'integer',
    ];

    // ─── Relationships ────────────────────────────────────────────────────

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(ProductFunnel::class, 'funnel_id');
    }

    // ─── Block Type Definitions ───────────────────────────────────────────

    public static function getAvailableTypes(): array
    {
        return [
            'hero'             => ['label' => 'Hero Banner',        'icon' => 'layout',          'category' => 'header'],
            'product_showcase' => ['label' => 'Product Showcase',   'icon' => 'shopping-bag',    'category' => 'product'],
            'benefits'         => ['label' => 'Benefits / Features','icon' => 'check-circle',    'category' => 'content'],
            'testimonials'     => ['label' => 'Testimonials',       'icon' => 'message-square',  'category' => 'social'],
            'countdown'        => ['label' => 'Countdown Timer',    'icon' => 'clock',           'category' => 'urgency'],
            'video'            => ['label' => 'Video',              'icon' => 'play-circle',     'category' => 'media'],
            'text_block'       => ['label' => 'Text / Rich Content','icon' => 'type',            'category' => 'content'],
            'image_block'      => ['label' => 'Image',              'icon' => 'image',           'category' => 'media'],
            'faq'              => ['label' => 'FAQ Accordion',      'icon' => 'help-circle',     'category' => 'content'],
            'trust_badges'     => ['label' => 'Trust Badges',       'icon' => 'shield',          'category' => 'social'],
            'guarantee'        => ['label' => 'Guarantee Section',  'icon' => 'award',           'category' => 'social'],
            'price_table'      => ['label' => 'Price / Offer',      'icon' => 'tag',             'category' => 'product'],
            'cta_button'       => ['label' => 'CTA Button',         'icon' => 'mouse-pointer',   'category' => 'conversion'],
            'spacer'           => ['label' => 'Spacer',             'icon' => 'minus',           'category' => 'layout'],
            'divider'          => ['label' => 'Divider',            'icon' => 'separator-horizontal', 'category' => 'layout'],
        ];
    }

    /**
     * Get default settings for a block type.
     */
    public static function getDefaultSettings(string $type): array
    {
        $defaults = [
            'hero' => [
                'headline'         => 'Le produit qui change tout',
                'subheadline'      => 'Commandez maintenant et recevez votre colis en 48h',
                'cta_text'         => 'Commander maintenant',
                'cta_color'        => '#e94560',
                'cta_text_color'   => '#ffffff',
                'bg_color'         => '#1a1a2e',
                'text_color'       => '#ffffff',
                'show_image'       => true,
                'image_position'   => 'right',
                'padding'          => 'large',
            ],
            'product_showcase' => [
                'show_price'       => true,
                'show_variants'    => true,
                'show_rating'      => true,
                'show_stock'       => true,
                'cta_text'         => 'Ajouter au panier',
                'cta_color'        => '#e94560',
                'bg_color'         => '#ffffff',
                'layout'           => 'image-left',
            ],
            'benefits' => [
                'title'            => 'Pourquoi choisir ce produit ?',
                'bg_color'         => '#f8fafc',
                'items'            => [
                    ['icon' => 'check', 'title' => 'Qualité premium', 'description' => 'Fabriqué avec les meilleurs matériaux'],
                    ['icon' => 'truck', 'title' => 'Livraison rapide', 'description' => 'Livré chez vous en 48h'],
                    ['icon' => 'shield', 'title' => 'Satisfait ou remboursé', 'description' => 'Garantie 30 jours'],
                ],
            ],
            'testimonials' => [
                'title'            => 'Ce que disent nos clients',
                'bg_color'         => '#ffffff',
                'use_product_reviews' => false,
                'items'            => [
                    ['name' => 'Marie L.', 'rating' => 5, 'text' => 'Excellent produit, je recommande !', 'avatar' => ''],
                    ['name' => 'Jean D.', 'rating' => 5, 'text' => 'Livraison rapide et produit conforme.', 'avatar' => ''],
                ],
            ],
            'countdown' => [
                'title'            => 'Offre limitée — se termine dans :',
                'end_date'         => '',
                'end_time'         => '23:59:59',
                'duration_hours'   => 24,
                'mode'             => 'duration', // 'duration' or 'fixed_date'
                'bg_color'         => '#e94560',
                'text_color'       => '#ffffff',
                'show_labels'      => true,
            ],
            'video' => [
                'url'              => '',
                'autoplay'         => false,
                'title'            => '',
                'bg_color'         => '#000000',
                'aspect_ratio'     => '16:9',
            ],
            'text_block' => [
                'content'          => '<h2>Votre titre ici</h2><p>Votre texte ici...</p>',
                'bg_color'         => '#ffffff',
                'text_color'       => '#1a1a1a',
                'text_align'       => 'left',
                'padding'          => 'medium',
            ],
            'image_block' => [
                'image'            => '',
                'alt'              => '',
                'width'            => 'full', // full, contained
                'bg_color'         => '#ffffff',
                'link'             => '',
            ],
            'faq' => [
                'title'            => 'Questions fréquentes',
                'bg_color'         => '#f8fafc',
                'items'            => [
                    ['question' => 'Quel est le délai de livraison ?', 'answer' => 'Nous livrons sous 48 à 72 heures ouvrables.'],
                    ['question' => 'Puis-je retourner le produit ?', 'answer' => 'Oui, vous avez 30 jours pour nous retourner le produit.'],
                ],
            ],
            'trust_badges' => [
                'bg_color'         => '#ffffff',
                'items'            => [
                    ['icon' => 'lock', 'label' => 'Paiement sécurisé'],
                    ['icon' => 'truck', 'label' => 'Livraison offerte'],
                    ['icon' => 'refresh-cw', 'label' => 'Retours 30j'],
                    ['icon' => 'award', 'label' => 'Qualité garantie'],
                ],
            ],
            'guarantee' => [
                'title'            => 'Garantie Satisfait ou Remboursé',
                'description'      => 'Si vous n\'êtes pas satisfait, nous vous remboursons intégralement dans les 30 jours.',
                'badge_text'       => '30 Jours',
                'bg_color'         => '#f0fdf4',
                'text_color'       => '#166534',
                'border_color'     => '#86efac',
            ],
            'price_table' => [
                'original_price'   => '',
                'sale_price'       => '',
                'currency_symbol'  => 'MAD',
                'label'            => 'Prix spécial',
                'savings_text'     => 'Économisez {amount}',
                'cta_text'         => 'Profiter de l\'offre',
                'cta_color'        => '#e94560',
                'bg_color'         => '#ffffff',
            ],
            'cta_button' => [
                'text'             => 'Commander maintenant',
                'color'            => '#e94560',
                'text_color'       => '#ffffff',
                'size'             => 'large',
                'width'            => 'full',
                'bg_color'         => '#ffffff',
                'padding'          => 'medium',
                'subtext'          => 'Livraison offerte · Paiement sécurisé',
            ],
            'spacer' => [
                'height'           => 60,
                'bg_color'         => '#ffffff',
            ],
            'divider' => [
                'style'            => 'solid', // solid, dashed, dotted, wave
                'color'            => '#e2e8f0',
                'thickness'        => 1,
                'bg_color'         => '#ffffff',
                'margin'           => 'medium',
            ],
        ];

        return $defaults[$type] ?? [];
    }
}

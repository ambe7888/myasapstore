<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPageSetting extends Model
{
    protected $fillable = [
        'company_name', 'contact_email', 'contact_phone', 'contact_address', 'config_sections'
    ];
    
    protected $attributes = [
        'company_name' => '',
        'contact_email' => '',
        'contact_phone' => '',
        'contact_address' => ''
    ];

    protected $casts = [
        'config_sections' => 'array'
    ];

    public static function getSettings()
    {
        $settings = self::first();
        
        if (!$settings) {
            // Import default sections from the template file structure
            $defaultConfig = [
                'colors' => [
                    'primary' => '#10b77f',
                    'secondary' => '#059669',
                    'accent' => '#065f46'
                ],
                'sections' => [
                    [
                        'key' => 'header',
                        'transparent' => false,
                        'background_color' => '#ffffff',
                        'text_color' => '#1f2937',
                        'button_style' => 'gradient'
                    ],
                    [
                        'key' => 'hero',
                        'title' => 'Lancez votre boutique en ligne en quelques minutes',
                        'subtitle' => 'Créez et gérez plusieurs boutiques en ligne grâce à notre plateforme e-commerce tout-en-un.',
                        'announcement_text' => '🚀 NOUVEAU : Tableau de bord analytique avancé disponible',
                        'primary_button_text' => 'Commencer l\'essai gratuit',
                        'secondary_button_text' => 'Connexion',
                        'image' => '',
                        'background_color' => '#f8fafc',
                        'text_color' => '#1f2937',
                        'layout' => 'image-right',
                        'height' => 600,
                        'stats' => [
                            ['value' => '10K+', 'label' => 'Boutiques Actives'],
                            ['value' => '50+', 'label' => 'Pays Couverts'],
                            ['value' => '99%', 'label' => 'Satisfaction Clients']
                        ],
                        'card' => [
                            'name' => 'Jean Dupont',
                            'title' => 'Développeur Senior',
                            'company' => 'Tech Solutions Inc.',
                            'initials' => 'JD'
                        ]
                    ],
                    [
                        'key' => 'features',
                        'title' => 'Tout ce dont vous avez besoin pour vendre en ligne',
                        'description' => 'Des outils e-commerce puissants conçus pour développer votre activité.',
                        'background_color' => '#ffffff',
                        'layout' => 'grid',
                        'columns' => 3,
                        'image' => '',
                        'show_icons' => true,
                        'features_list' => [
                            ['title' => 'Gestion Multi-Boutiques', 'description' => 'Créez et gérez un nombre illimité de boutiques en ligne depuis un seul tableau de bord.', 'icon' => 'store'],
                            ['title' => '30+ Passerelles de Paiement', 'description' => 'Acceptez les paiements par carte, Stripe, PayPal, FedaPay, CinetPay et plus encore.', 'icon' => 'credit-card'],
                            ['title' => 'Analyses & Statistiques Avancées', 'description' => 'Suivez vos ventes, vos clients et vos performances avec des rapports détaillés en temps réel.', 'icon' => 'bar-chart']
                        ]
                    ],
                    [
                        'key' => 'screenshots',
                        'title' => 'Découvrez My Store Asap en action',
                        'subtitle' => 'Explorez notre interface intuitive et nos outils de gestion d\'exception.',
                        'screenshots_list' => [
                            [
                                'src' => '/screenshots/hero.png',
                                'alt' => 'Vue d\'ensemble du tableau de bord',
                                'title' => 'Vue d\'ensemble du Tableau de Bord',
                                'description' => 'Un tableau de bord complet pour piloter vos boutiques et analyser vos chiffres.'
                            ],
                            [
                                'src' => '/screenshots/store-builder.png',
                                'alt' => 'Créateur de boutique',
                                'title' => 'Créateur de Boutique',
                                'description' => 'Une interface fluide pour personnaliser et publier vos boutiques.'
                            ]
                        ]
                    ],
                    [
                        'key' => 'why_choose_us',
                        'title' => 'Pourquoi choisir My Store Asap ?',
                        'subtitle' => 'La solution e-commerce globale pour les entrepreneurs modernes.',
                        'reasons' => [
                            ['title' => 'Architecture Multi-Boutiques', 'description' => 'Gérez plusieurs enseignes à partir d\'un seul compte centralisé.', 'icon' => 'stores'],
                            ['title' => 'Zéro commission cachée', 'description' => 'Conservez 100% de vos profits avec notre tarification claire et transparente.', 'icon' => 'money']
                        ],
                        'stats' => [
                            ['value' => '10K+', 'label' => 'Boutiques Actives', 'color' => 'blue'],
                            ['value' => '99%', 'label' => 'Satisfaction', 'color' => 'green']
                        ]
                    ],
                    [
                        'key' => 'templates',
                        'title' => 'Explorez nos thèmes professionnels',
                        'subtitle' => 'Choisissez parmi une sélection de thèmes élégants adaptés à votre secteur d\'activité.',
                        'background_color' => '#f8fafc',
                        'layout' => 'grid',
                        'columns' => 3,
                        'templates_list' => [
                            ['name' => 'freelancer', 'category' => 'professional'],
                            ['name' => 'doctor', 'category' => 'medical'],
                            ['name' => 'restaurant', 'category' => 'food'],
                            ['name' => 'realestate', 'category' => 'business'],
                            ['name' => 'fitness', 'category' => 'health'],
                            ['name' => 'photography', 'category' => 'creative'],
                            ['name' => 'lawfirm', 'category' => 'professional'],
                            ['name' => 'cafe', 'category' => 'food'],
                            ['name' => 'salon', 'category' => 'beauty'],
                            ['name' => 'construction', 'category' => 'business'],
                            ['name' => 'eventplanner', 'category' => 'services'],
                            ['name' => 'tech-startup', 'category' => 'technology']
                        ],
                        'cta_text' => 'Voir tous les thèmes',
                        'cta_link' => '#'
                    ],
                    [
                        'key' => 'about',
                        'title' => 'À Propos de Nous',
                        'description' => 'Nous sommes passionnés par l\'autonomisation des entrepreneurs pour créer et développer des entreprises e-commerce prospères.',
                        'story_title' => 'La Révolution E-commerce Multi-Boutiques',
                        'story_content' => 'Conçu par des experts du e-commerce et de la technologie, My Store Asap a été créé pour simplifier la gestion de boutiques en ligne à grande échelle.',
                        'image' => '',
                        'background_color' => '#f9fafb',
                        'layout' => 'image-right',
                        'stats' => [
                            ['value' => '4+ Ans', 'label' => 'Expérience', 'color' => 'blue'],
                            ['value' => '10K+', 'label' => 'Utilisateurs Heureux', 'color' => 'green'],
                            ['value' => '50+', 'label' => 'Pays', 'color' => 'purple']
                        ]
                    ],
                    [
                        'key' => 'team',
                        'title' => 'Notre Équipe',
                        'subtitle' => 'Une équipe d\'innovateurs passionnés à votre service.',
                        'cta_title' => 'Vous souhaitez nous rejoindre ?',
                        'cta_description' => 'Nous recherchons toujours des talents pour agrandir notre équipe.',
                        'cta_button_text' => 'Voir les postes ouverts',
                        'members' => [
                            ['name' => 'Sarah Johnson', 'role' => 'Fondatrice & CEO', 'bio' => 'Experte tech et e-commerce avec plus de 15 ans d\'expérience.', 'image' => '', 'linkedin' => '#', 'email' => 'sarah@mystoreasap.com']
                        ]
                    ],
                    [
                        'key' => 'testimonials',
                        'title' => 'Ce que disent nos clients',
                        'subtitle' => 'Découvrez les retours des marchands qui développent leur business avec nous.',
                        'trust_title' => 'Adopté par des milliers de marchands dans le monde',
                        'trust_stats' => [
                            ['value' => '4.9/5', 'label' => 'Note Moyenne', 'color' => 'blue'],
                            ['value' => '10K+', 'label' => 'Marchands Satisfaits', 'color' => 'green']
                        ],
                        'testimonials' => [
                            ['name' => 'Alexandre Martin', 'role' => 'Directeur des Ventes', 'company' => 'TechCorp Inc.', 'content' => 'My Store Asap a totalement révolutionné notre manière de gérer nos boutiques en ligne.', 'rating' => 5]
                        ]
                    ],
                    [
                        'key' => 'active_campaigns',
                        'title' => 'Promotions & Entreprises à la Une',
                        'subtitle' => 'Découvrez les entreprises actuellement propulsées par notre plateforme',
                        'background_color' => '#f8fafc',
                        'show_view_all' => true,
                        'max_display' => 6
                    ],
                    [
                        'key' => 'plans',
                        'title' => 'Choisissez votre formule',
                        'subtitle' => 'Commencez dès aujourd\'hui et évoluez selon la croissance de votre entreprise.',
                        'faq_text' => 'Des questions sur nos tarifs ? Contactez notre équipe commerciale'
                    ],
                    [
                        'key' => 'faq',
                        'title' => 'Foire Aux Questions',
                        'subtitle' => 'Une question ? Nous avons les réponses.',
                        'cta_text' => 'Vous avez encore des questions ?',
                        'button_text' => 'Contacter le Support',
                        'faqs' => [
                            ['question' => 'Comment fonctionne My Store Asap ?', 'answer' => 'My Store Asap vous permet de créer et gérer plusieurs boutiques en ligne indépendantes depuis une interface unique, avec différents thèmes, produits et devises.']
                        ]
                    ],
                    [
                        'key' => 'newsletter',
                        'title' => 'Restez informé avec My Store Asap',
                        'subtitle' => 'Recevez nos conseils e-commerce exclusifs et les mises à jour de la plateforme.',
                        'privacy_text' => 'Pas de spam, désabonnez-vous à tout moment.',
                        'benefits' => [
                            ['icon' => '📧', 'title' => 'Mises à jour hebdomadaires', 'description' => 'Dernières fonctionnalités et astuces']
                        ]
                    ],
                    [
                        'key' => 'contact',
                        'title' => 'Contactez-nous',
                        'subtitle' => 'Des questions sur My Store Asap ? Notre équipe est là pour vous répondre.',
                        'form_title' => 'Envoyez-nous un message',
                        'info_title' => 'Informations de contact',
                        'info_description' => 'Nous sommes là pour vous aider et répondre à toutes vos interrogations.',
                        'layout' => 'split',
                        'background_color' => '#f9fafb'
                    ],
                    [
                        'key' => 'footer',
                        'description' => 'Donnez une nouvelle dimension à votre business grâce à notre plateforme e-commerce multi-boutiques.',
                        'newsletter_title' => 'Restez connecté',
                        'newsletter_subtitle' => 'Inscrivez-vous à notre newsletter',
                        'links' => [
                            'product' => [['name' => 'Fonctionnalités', 'href' => '#features'], ['name' => 'Tarifs', 'href' => '#pricing']],
                            'company' => [['name' => 'À Propos', 'href' => '#about'], ['name' => 'Contact', 'href' => '#contact']]
                        ],
                        'social_links' => [
                            ['name' => 'Facebook', 'icon' => 'Facebook', 'href' => '#'],
                            ['name' => 'Twitter', 'icon' => 'Twitter', 'href' => '#']
                        ],
                        'section_titles' => [
                            'product' => 'Produit',
                            'company' => 'Entreprise'
                        ]
                    ]
                ],
                'theme' => [
                    'primary_color' => '#10b77f',
                    'secondary_color' => '#ffffff',
                    'accent_color' => '#f7f7f7',
                    'logo_light' => '',
                    'logo_dark' => '',
                    'favicon' => ''
                ],
                'colors' => [
                    'primary' => '#10b77f',
                    'secondary' => '#059669',
                    'accent' => '#065f46'
                ],
                'seo' => [
                    'meta_title' => 'My Store Asap - Plateforme E-Commerce Multi-Boutiques SaaS',
                    'meta_description' => 'Créez et gérez plusieurs boutiques en ligne facilement avec My Store Asap. 30+ passerelles de paiement, thèmes professionnels et fonctionnalités puissantes.',
                    'meta_keywords' => 'plateforme ecommerce, createur de boutique en ligne, gestion multi boutiques, vendre en ligne'
                ],
                'custom_css' => '',
                'custom_js' => '',
                'section_order' => ['header', 'hero', 'features', 'screenshots', 'why_choose_us', 'templates', 'about', 'team', 'testimonials', 'active_campaigns', 'plans', 'faq', 'newsletter', 'contact', 'footer'],
                'section_visibility' => [
                    'header' => true,
                    'hero' => true,
                    'features' => true,
                    'screenshots' => true,
                    'why_choose_us' => true,
                    'templates' => true,
                    'about' => true,
                    'team' => true,
                    'testimonials' => true,
                    'active_campaigns' => true,
                    'plans' => true,
                    'faq' => true,
                    'newsletter' => true,
                    'contact' => true,
                    'footer' => true
                ]
            ];
            
            $settings = self::create([
                'config_sections' => $defaultConfig
            ]);
        }
        
        return $settings;
    }
}
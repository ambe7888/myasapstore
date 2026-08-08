<?php

namespace Database\Seeders;

use App\Models\LandingPageSetting;
use App\Models\LandingPageCustomPage;
use Illuminate\Database\Seeder;

class LandingPageSeeder extends Seeder
{
    public function run(): void
    {
        // Check if landing page settings already exist (client already has data)
        $existingSettings = LandingPageSetting::exists();
        
        if ($existingSettings) {
            return; // Skip if settings already exist
        }

        // Update or create landing page settings
        LandingPageSetting::updateOrCreate(
            ['id' => 1],
            [
            'company_name' => 'My Store Asap',
            'contact_email' => 'support@mystoreasap.com',
            'contact_phone' => '+1 (555) 123-4567',
            'contact_address' => 'San Francisco, CA',
            'config_sections' => [
                'sections' => [
                    [
                        'key' => 'header',
                        'transparent' => false,
                        'background_color' => '#ffffff',
                        'logo_position' => 'left',
                        'menu_style' => 'horizontal',
                        'show_cta' => true,
                        'cta_text' => 'Start Free Trial',
                        'cta_link' => '/register',
                        'sticky' => true,
                        'shadow' => true
                    ],
                    [
                        'key' => 'hero',
                        'title' => 'Build & Manage Multiple Online Stores',
                        'subtitle' => 'Complete SaaS platform for creating unlimited e-commerce stores with multiple themes, payment gateways, and advanced management tools.',
                        'description' => 'Join thousands of entrepreneurs who use our multi-store SaaS platform to build successful online businesses. Start your free trial today.',
                        'announcement_text' => '🚀 New: Advanced Multi-Store Analytics Dashboard Now Available',
                        'cta_text' => 'Start Free Trial',
                        'cta_link' => '/register',
                        'primary_button_text' => 'Start Free Trial',
                        'secondary_cta_text' => 'View Live Demo',
                        'secondary_cta_link' => '/store/demo-store',
                        'secondary_button_text' => 'View Live Demo',
                        'background_color' => '#f8fafc',
                        'background_image' => '/storage/placeholder/hero-ecommerce.svg',
                        'overlay' => true,
                        'overlay_opacity' => 0.7,
                        'animation' => 'fade-in',
                        'video_url' => null,
                        'show_stats' => true,
                        'stats' => [
                            ['label' => 'Active Stores', 'value' => '25,000+'],
                            ['label' => 'Happy Merchants', 'value' => '8,500+'],
                            ['label' => 'Store Themes', 'value' => '10+'],
                        ],
                        'hero_cards' => [
                            [
                                'title' => 'Quick Setup',
                                'description' => 'Launch your store in under 5 minutes',
                                'icon' => 'rocket',
                                'color' => '#3b82f6'
                            ],
                            [
                                'title' => 'Secure Payments',
                                'description' => '30+ payment gateways integrated',
                                'icon' => 'shield',
                                'color' => '#10b77f'
                            ],
                            [
                                'title' => 'Multi-Store',
                                'description' => 'Manage unlimited stores from one dashboard',
                                'icon' => 'store',
                                'color' => '#8b5cf6'
                            ]
                        ],
                        'card' => [
                            'name' => 'Sarah Mitchell',
                            'title' => 'E-commerce Director',
                            'company' => 'Digital Commerce Solutions',
                            'initials' => 'SM'
                        ],
                        'image' => '/storage/placeholder/dashboard-preview.svg',
                        'image_position' => 'right'
                    ],
                    [
                        'key' => 'features',
                        'title' => 'Complete Multi-Store SaaS Platform',
                        'subtitle' => 'Everything you need to build and manage unlimited online stores',
                        'description' => 'From store creation to theme customization, our SaaS platform provides all the tools you need to run a successful multi-store business.',
                        'background_color' => '#ffffff',
                        'layout' => 'grid',
                        'columns' => 3,
                        'show_icons' => true,
                        'icon_style' => 'modern',
                        'features' => [
                            [
                                'icon' => 'store',
                                'title' => 'Unlimited Store Creation',
                                'description' => 'Create and manage unlimited online stores from a single SaaS dashboard',
                                'color' => '#3b82f6',
                                'link' => '/features/multi-store'
                            ],
                            [
                                'icon' => 'palette',
                                'title' => 'Multiple Store Themes',
                                'description' => 'Choose from 10+ professional themes: Fashion, Electronics, Beauty, Jewelry, and more',
                                'color' => '#10b77f',
                                'link' => '/features/themes'
                            ],
                            [
                                'icon' => 'payment',
                                'title' => '30+ Payment Gateways',
                                'description' => 'Stripe, PayPal, Razorpay, Flutterwave, and 26+ more payment gateways integrated',
                                'color' => '#f59e0b',
                                'link' => '/features/payments'
                            ],
                            [
                                'icon' => 'inventory',
                                'title' => 'Product & Inventory Management',
                                'description' => 'Manage products, categories, and inventory across all your stores',
                                'color' => '#8b5cf6',
                                'link' => '/features/inventory'
                            ],
                            [
                                'icon' => 'users',
                                'title' => 'Customer Management',
                                'description' => 'Manage customers, orders, and reviews across all stores from one place',
                                'color' => '#ef4444',
                                'link' => '/features/customers'
                            ],
                            [
                                'icon' => 'blog',
                                'title' => 'Built-in Blog System',
                                'description' => 'Each store comes with a complete blog system for content marketing',
                                'color' => '#06b6d4',
                                'link' => '/features/blog'
                            ]
                        ]
                    ],
                    [
                        'key' => 'screenshots',
                        'title' => 'See Our SaaS Platform in Action',
                        'subtitle' => 'Explore the multi-store dashboard and theme management features',
                        'description' => 'Get a glimpse of how easy it is to create and manage multiple online stores with our SaaS platform.',
                        'background_color' => '#f8fafc',
                        'layout' => 'carousel',
                        'autoplay' => true,
                        'autoplay_speed' => 5000,
                        'show_thumbnails' => true,
                        'screenshots_list' => [
                            [
                                'title' => 'Multi-Store Dashboard',
                                'description' => 'Manage all your stores from one central SaaS dashboard',
                                'src' => '/storage/placeholder/landing-page/multi-store-dashboard.png',
                                'alt' => 'Multi-store SaaS dashboard overview'
                            ],
                            [
                                'title' => 'Product Management',
                                'description' => 'Add products, manage categories, and track inventory for each store',
                                'src' => '/storage/placeholder/landing-page/product-management.png',
                                'alt' => 'Product management interface'
                            ],
                            [
                                'title' => 'Theme Selection',
                                'description' => 'Choose from 10+ professional themes for each store',
                                'src' => '/storage/placeholder/landing-page/theme-selection.png',
                                'alt' => 'Store theme selection interface'
                            ],
                            [
                                'title' => 'Order Management',
                                'description' => 'Process orders and manage customer transactions',
                                'src' => '/storage/placeholder/landing-page/order-management.png',
                                'alt' => 'Order management system'
                            ],
                            [
                                'title' => 'Blog Management',
                                'description' => 'Built-in blog system for each store with content management',
                                'src' => '/storage/placeholder/landing-page/blog-management.png',
                                'alt' => 'Blog management interface'
                            ],
                            [
                                'title' => 'Payment Integration',
                                'description' => '30+ payment gateways ready to integrate with your stores',
                                'src' => '/storage/placeholder/landing-page/payment-integration.png',
                                'alt' => 'Payment gateway integration'
                            ]
                        ]
                    ],
                    [
                        'key' => 'why_choose_us',
                        'title' => 'Why Choose Our SaaS Platform?',
                        'subtitle' => 'The complete multi-store e-commerce SaaS solution',
                        'description' => 'Unlike single-store platforms, our SaaS solution is built specifically for managing unlimited stores with different themes and configurations.',
                        'background_color' => '#ffffff',
                        'layout' => 'split',
                        'image' => '/storage/placeholder/multi-store-dashboard.svg',
                        'image_position' => 'left',
                        'reasons' => [
                            [
                                'title' => 'Complete E-commerce Features',
                                'description' => 'Product management, order processing, customer management, and blog system built-in',
                                'icon' => 'features'
                            ],
                            [
                                'title' => 'Ready-to-Use Themes',
                                'description' => '10+ professional themes ready to use - no customization needed, just select and go live',
                                'icon' => 'themes'
                            ]
                        ],
                        'stats' => [
                            [
                                'value' => '25,000+',
                                'label' => 'Active Stores',
                                'color' => '#3b82f6'
                            ],
                            [
                                'value' => '98.5%',
                                'label' => 'Uptime',
                                'color' => '#10b77f'
                            ],
                            [
                                'value' => '$2.5M+',
                                'label' => 'Revenue Generated',
                                'color' => '#f59e0b'
                            ],
                            [
                                'value' => '120+',
                                'label' => 'Countries Served',
                                'color' => '#8b5cf6'
                            ]
                        ],
                        'stats_title' => 'Trusted by Entrepreneurs Worldwide',
                        'stats_subtitle' => 'Join thousands of successful merchants who chose StoreGo',
                        'cta_title' => 'Ready to Launch Your Store?',
                        'cta_subtitle' => 'Start your 14-day free trial today - no credit card required'
                    ],

                    [
                        'key' => 'about',
                        'title' => 'About Our Platform',
                        'subtitle' => 'Empowering entrepreneurs with multi-store SaaS technology',
                        'description' => 'Founded by SaaS and e-commerce experts, our platform is built to solve the real challenges of managing multiple online stores.',
                        'background_color' => '#f8fafc',
                        'layout' => 'image-right',
                        'image' => '/storage/placeholder/about-storego.svg',
                        'image_position' => 'right',
                        'parallax' => false,
                        'story_title' => 'Revolutionizing Multi-Store E-commerce Since 2019',
                        'story_content' => 'StoreGo emerged from the vision of experienced e-commerce professionals who recognized the growing need for unified multi-store management. What started as a solution for managing multiple online stores has evolved into a comprehensive platform serving over 25,000 entrepreneurs across 120+ countries. Our mission is to democratize e-commerce by providing powerful, intuitive tools that enable anyone to build, manage, and scale successful online businesses without technical barriers.',
                        'stats' => [
                            ['label' => 'Store Themes', 'value' => '10+', 'color' => '#3b82f6'],
                            ['label' => 'Payment Gateways', 'value' => '30+', 'color' => '#10b77f'],
                            ['label' => 'Active Features', 'value' => '50+', 'color' => '#8b5cf6'],
                            ['label' => 'Customer Rating', 'value' => '4.9/5', 'color' => '#f59e0b'],
                            ['label' => 'Support Response', 'value' => '<4hrs', 'color' => '#ef4444'],
                            ['label' => 'Success Rate', 'value' => '94%', 'color' => '#06b6d4']
                        ],
                        'values' => [
                            [
                                'title' => 'Our Mission',
                                'description' => 'To democratize e-commerce by providing powerful, easy-to-use tools that enable anyone to build and manage successful online stores.',
                                'icon' => 'target'
                            ],
                            [
                                'title' => 'Innovation First',
                                'description' => 'We continuously innovate to stay ahead of e-commerce trends and provide cutting-edge solutions for modern businesses.',
                                'icon' => 'lightbulb'
                            ],
                            [
                                'title' => 'Customer Success',
                                'description' => 'Your success is our success. We provide exceptional support and resources to help you grow your online business.',
                                'icon' => 'heart'
                            ],
                            [
                                'title' => 'Reliability',
                                'description' => 'Built on enterprise-grade infrastructure with 99.9% uptime guarantee and world-class security standards.',
                                'icon' => 'shield'
                            ]
                        ],
                        'image_title' => 'Innovation Driven',
                        'image_subtitle' => 'Building the future of e-commerce',
                        'image_icon' => '🚀'
                    ],

                    [
                        'key' => 'team',
                        'title' => 'Meet Our Team',
                        'subtitle' => 'Meet the passionate team behind StoreGo\'s success',
                        'description' => 'Our diverse team of e-commerce experts, engineers, and designers is dedicated to helping entrepreneurs build successful online businesses.',
                        'background_color' => '#f8fafc',
                        'layout' => 'grid',
                        'columns' => 3,
                        'members' => [
                            [
                                'name' => 'Alex Rodriguez',
                                'role' => 'CEO & Co-Founder',
                                'bio' => 'Former Shopify executive with 10+ years in e-commerce. Passionate about empowering entrepreneurs worldwide.',
                                'image' => '/storage/placeholder/team/alex.svg',
                                'linkedin' => 'https://linkedin.com/in/',
                                'twitter' => 'https://twitter.com/',
                                'email' => 'alex@storego.com'
                            ],
                            [
                                'name' => 'Sarah Kim',
                                'role' => 'CTO & Co-Founder',
                                'bio' => 'Tech leader specializing in scalable e-commerce platforms. Expert in cloud architecture and SaaS development.',
                                'image' => '/storage/placeholder/team/sarah.svg',
                                'linkedin' => 'https://linkedin.com/in/',
                                'twitter' => 'https://twitter.com/',
                                'email' => 'sarah@storego.com'
                            ],
                            [
                                'name' => 'David Wilson',
                                'role' => 'Head of Customer Success',
                                'bio' => 'Helping merchants grow their businesses since day one. 8+ years in customer success and e-commerce consulting.',
                                'image' => '/storage/placeholder/team/david.svg',
                                'linkedin' => 'https://linkedin.com/in/',
                                'email' => 'david@storego.com'
                            ],
                            [
                                'name' => 'Maria Garcia',
                                'role' => 'VP of Engineering',
                                'bio' => 'Full-stack engineer with expertise in React, Laravel, and microservices. Leading our product development team.',
                                'image' => '/storage/placeholder/team/maria.svg',
                                'linkedin' => 'https://linkedin.com/in/',
                                'twitter' => 'https://twitter.com/',
                                'email' => 'maria@storego.com'
                            ]
                        ],
                        'cta_title' => 'Join Our Growing Team',
                        'cta_description' => 'We\'re always looking for talented individuals who are passionate about e-commerce, technology, and helping entrepreneurs succeed. Join us in building the future of multi-store SaaS platforms.',
                        'cta_button_text' => 'View Open Positions'
                    ],
                    [
                        'key' => 'plans',
                        'title' => 'Choose Your Plan',
                        'subtitle' => 'Transparent pricing that grows with your business',
                        'description' => 'Start free and upgrade as you grow. No hidden fees, no transaction charges.',
                        'background_color' => '#f8fafc',
                        'billing_toggle' => true,
                        'highlight_popular' => true,
                        'show_features' => true,
                        'money_back_guarantee' => '30-day money back guarantee',
                        'guarantee_text' => 'Try risk-free with our 30-day money back guarantee',
                        'annual_discount' => 'Save 20% with annual billing',
                        'contact_sales_text' => 'Need a custom enterprise plan?',
                        'contact_sales_link' => '/contact-sales'
                    ],
                    [
                        'key' => 'testimonials',
                        'title' => 'What Our Merchants Say',
                        'subtitle' => 'Join thousands of successful store owners',
                        'description' => 'Don\'t just take our word for it. See what our successful merchants have to say about StoreGo.',
                        'background_color' => '#ffffff',
                        'layout' => 'carousel',
                        'autoplay' => true,
                        'autoplay_speed' => 6000,
                        'show_ratings' => true,
                        'show_navigation' => true,
                        'show_trust_indicators' => true,
                        'trust_indicators' => [
                            ['metric' => 'Customer Satisfaction', 'value' => '98.5%', 'description' => 'of merchants recommend StoreGo to others'],
                            ['metric' => 'Average Rating', 'value' => '4.9/5', 'description' => 'based on 8,500+ verified reviews'],
                            ['metric' => 'Success Rate', 'value' => '94%', 'description' => 'of stores see growth in first 90 days'],
                            ['metric' => 'Revenue Growth', 'value' => '340%', 'description' => 'average increase in first year'],
                            ['metric' => 'Platform Uptime', 'value' => '99.9%', 'description' => 'guaranteed service availability']
                        ],
                        'trust_title' => 'Trusted by Entrepreneurs Worldwide',
                        'trust_stats' => [
                            ['value' => '98.5%', 'label' => 'Customer Satisfaction', 'color' => '#10b77f'],
                            ['value' => '4.9/5', 'label' => 'Average Rating', 'color' => '#f59e0b'],
                            ['value' => '94%', 'label' => 'Success Rate', 'color' => '#3b82f6'],
                            ['value' => '99.9%', 'label' => 'Platform Uptime', 'color' => '#8b5cf6'],
                            ['value' => '<2hrs', 'label' => 'Support Response', 'color' => '#ef4444']
                        ],
                        'testimonials' => [
                            [
                                'name' => 'Emma Thompson',
                                'role' => 'Store Owner',
                                'company' => 'Boutique Fashion Co.',
                                'content' => 'StoreGo made it incredibly easy to launch my fashion store. The multi-store feature lets me manage different brands from one dashboard. Sales increased 400% in the first 6 months!',
                                'rating' => 5,
                                'avatar' => '/storage/placeholder/testimonials/emma.svg',
                                'location' => 'London, UK'
                            ],
                            [
                                'name' => 'Carlos Martinez',
                                'role' => 'E-commerce Manager',
                                'company' => 'Electronics Plus',
                                'content' => 'The inventory management and POS integration are game-changers. We can track everything in real-time across our online and physical stores.',
                                'rating' => 5,
                                'avatar' => '/storage/placeholder/testimonials/carlos.svg',
                                'location' => 'Madrid, Spain'
                            ],
                            [
                                'name' => 'Priya Patel',
                                'role' => 'Entrepreneur',
                                'company' => 'Handmade Crafts',
                                'content' => 'The payment gateway integrations are fantastic. I can accept payments from customers worldwide with no hassle. Customer support is always there when I need help.',
                                'rating' => 5,
                                'avatar' => '/storage/placeholder/testimonials/priya.svg',
                                'location' => 'Mumbai, India'
                            ]
                        ]
                    ],
                    [
                        'key' => 'faq',
                        'title' => 'Frequently Asked Questions',
                        'subtitle' => 'Everything you need to know about StoreGo',
                        'description' => 'Got questions? We\'ve got answers. Browse our most frequently asked questions below.',
                        'background_color' => '#f8fafc',
                        'layout' => 'accordion',
                        'show_search' => true,
                        'show_categories' => true,
                        'contact_support_text' => 'Still have questions? Our support team is here to help.',
                        'contact_support_link' => '/contact',
                        'cta_text' => 'Ready to Start Your E-commerce Journey?',
                        'button_text' => 'Start Free Trial Now',
                        'faqs' => [
                            [
                                'question' => 'How quickly can I set up my first store?',
                                'answer' => 'You can create a store in minutes by selecting a theme, adding your products, and configuring basic settings. The platform is designed for quick setup.',
                                'category' => 'Getting Started'
                            ],
                            [
                                'question' => 'Can I manage multiple stores from one account?',
                                'answer' => 'Yes! This is a multi-store SaaS platform. You can create and manage unlimited stores from a single dashboard.',
                                'category' => 'Multi-Store'
                            ],
                            [
                                'question' => 'What payment gateways are supported?',
                                'answer' => 'We support 30+ payment gateways including Stripe, PayPal, Razorpay, Flutterwave, and many other regional and international providers.',
                                'category' => 'Payments'
                            ],
                            [
                                'question' => 'What themes are available?',
                                'answer' => 'We offer 10+ professional themes including Fashion, Electronics, Beauty & Cosmetics, Jewelry, Watches, Furniture, Cars, Baby & Kids, Perfume, and Home & Accessories.',
                                'category' => 'Themes'
                            ],
                            [
                                'question' => 'Does each store have a blog system?',
                                'answer' => 'Yes! Every store comes with a built-in blog system for content marketing, with categories, tags, and full content management.',
                                'category' => 'Features'
                            ],
                            [
                                'question' => 'Can customers create accounts and track orders?',
                                'answer' => 'Yes! The platform includes complete customer management with registration, login, order tracking, and customer profiles.',
                                'category' => 'Customer Management'
                            ]
                        ]
                    ],
                    [
                        'key' => 'newsletter',
                        'title' => 'Stay Updated',
                        'subtitle' => 'Get the latest e-commerce tips and StoreGo updates',
                        'description' => 'Join our newsletter and get exclusive insights, tips, and updates delivered to your inbox.',
                        'background_color' => '#3b82f6',
                        'text_color' => '#ffffff',
                        'placeholder' => 'Enter your email address',
                        'button_text' => 'Subscribe Now',
                        'privacy_text' => 'We respect your privacy. Unsubscribe at any time.',
                        'benefits' => [
                            [
                                'icon' => '📈',
                                'title' => 'Growth Strategies',
                                'description' => 'Weekly e-commerce growth tips and best practices'
                            ],
                            [
                                'icon' => '🚀',
                                'title' => 'Early Access',
                                'description' => 'Be first to try new StoreGo features and updates'
                            ],
                            [
                                'icon' => '💡',
                                'title' => 'Success Stories',
                                'description' => 'Learn from successful merchant case studies'
                            ]
                        ],
                        'subscriber_count' => '95,000+',
                        'frequency' => 'Weekly',
                        'success_message' => 'Thank you for subscribing! Check your email for confirmation.'
                    ],
                    [
                        'key' => 'contact',
                        'title' => 'Get in Touch',
                        'subtitle' => 'Ready to start your e-commerce journey?',
                        'description' => 'Our team of e-commerce experts is here to help you succeed. Get in touch and let\'s build something amazing together.',
                        'background_color' => '#ffffff',
                        'show_form' => true,
                        'show_info' => true,
                        'contact_info_title' => 'Contact Information',
                        'contact_info_description' => 'Reach out to us through any of these channels. We\'re here to help you build your dream e-commerce business.',
                        'form_fields' => ['name', 'email', 'subject', 'message'],
                        'form_title' => 'Send us a message',
                        'form_subtitle' => 'We\'ll get back to you within 4 hours',
                        'contact_methods' => [
                            ['type' => 'email', 'value' => 'support@storego.com', 'label' => 'Email Support', 'description' => 'Get help via email'],
                            ['type' => 'phone', 'value' => '+1 (555) 123-4567', 'label' => 'Phone Support', 'description' => 'Speak with our team'],
                            ['type' => 'chat', 'value' => 'Live Chat', 'label' => 'Live Chat', 'description' => 'Chat with us instantly']
                        ],
                        'response_time' => '4 hours',
                        'support_hours' => '24/7',
                        'contact_faqs' => [
                            [
                                'question' => 'How quickly do you respond to inquiries?',
                                'answer' => 'We typically respond to all inquiries within 4 hours during business hours, often much sooner.'
                            ],
                            [
                                'question' => 'Do you offer phone support?',
                                'answer' => 'Yes! Phone support is available for all paid plan customers. Free trial users can access email and chat support.'
                            ],
                            [
                                'question' => 'Can you help with store setup and migration?',
                                'answer' => 'Absolutely! Our team offers free store setup assistance and migration services for all customers.'
                            ]
                        ]
                    ],
                    [
                        'key' => 'footer',
                        'background_color' => '#1f2937',
                        'text_color' => '#ffffff',
                        'show_social' => true,
                        'show_newsletter' => true,
                        'show_logo' => true,
                        'logo_position' => 'top',
                        'description' => 'StoreGo is the leading multi-store e-commerce SaaS platform that empowers entrepreneurs to create, manage, and scale unlimited online stores from a single dashboard. Join thousands of successful merchants worldwide.',
                        'newsletter_title' => 'Stay Connected with StoreGo',
                        'newsletter_subtitle' => 'Get exclusive e-commerce insights, platform updates, and growth strategies delivered to your inbox',
                        'links' => [
                            'product' => [
                                ['name' => 'Features', 'href' => '#'],
                                ['name' => 'Store Themes', 'href' => '#'],
                                ['name' => 'Pricing Plans', 'href' => '#'],
                                ['name' => 'Live Demo', 'href' => '#']
                            ],
                            'company' => [
                                ['name' => 'About Us', 'href' => '#'],
                                ['name' => 'Contact Us', 'href' => '#']
                            ],
                            'support' => [
                                ['name' => 'FAQ', 'href' => '#'],
                                ['name' => 'Dashboard', 'href' => '#']
                            ],
                            'legal' => [
                                ['name' => 'Privacy Policy', 'href' => '#'],
                                ['name' => 'Terms of Service', 'href' => '#'],
                                ['name' => 'Refund Policy', 'href' => '#']
                            ]
                        ],
                        'section_titles' => [
                            'product' => 'Platform',
                            'company' => 'Company',
                            'support' => 'Resources',
                            'legal' => 'Legal & Security'
                        ],
                        'social_links' => [
                            ['name' => 'Twitter', 'icon' => 'Twitter', 'href' => 'https://x.com/'],
                            ['name' => 'LinkedIn', 'icon' => 'Linkedin', 'href' => 'https://www.linkedin.com/'],
                            ['name' => 'Facebook', 'icon' => 'Facebook', 'href' => 'https://www.facebook.com/'],
                            ['name' => 'Instagram', 'icon' => 'Instagram', 'href' => 'https://www.instagram.com/']
                        ],
                        'copyright' => '© 2024 StoreGo. All rights reserved.',
                        'bottom_text' => 'Built for entrepreneurs, by entrepreneurs. Trusted by 25,000+ merchants across 120+ countries worldwide. SOC 2 Type II compliant with 99.9% uptime guarantee.'
                    ]
                ],
                'colors' => [
                    'primary' => '#10b77f',
                    'secondary' => '#059669',
                    'accent' => '#065f46'
                ],
                'seo' => [
                    'meta_title' => 'StoreGo - Multi-Store E-commerce Platform | Launch Your Online Store',
                    'meta_description' => 'Create and manage multiple online stores with StoreGo. 30+ payment gateways, beautiful themes, inventory management, and more. Start your free trial today.',
                    'meta_keywords' => 'ecommerce platform, online store builder, multi-store management, sell online, ecommerce website, store builder'
                ],
                'section_order' => [
                    'header', 'hero', 'features', 'screenshots', 'why_choose_us', 'about', 'team', 'plans', 'testimonials', 'faq', 'newsletter', 'contact', 'footer'
                ],
                'section_visibility' => [
                    'header' => true,
                    'hero' => true,
                    'features' => true,
                    'screenshots' => true,
                    'why_choose_us' => true,
                    'about' => true,
                    'campaigns' => true,
                    'team' => true,
                    'plans' => true,
                    'testimonials' => true,
                    'faq' => true,
                    'newsletter' => true,
                    'contact' => true,
                    'footer' => true
                ]
            ]
        ]);

        // Create landing page custom pages
        $pages = [
            [
                'title' => 'À Propos de Nous',
                'slug' => 'about-us',
                'content' => "Bienvenue sur <b>My Store Asap</b>, la plateforme e-commerce tout-en-un conçue pour permettre aux entrepreneurs et aux commerçants de <b>créer, gérer et développer leurs boutiques en ligne en toute simplicité</b>.<br><br>Notre mission est de vous fournir des outils puissants, automatisés et intuitifs pour piloter vos ventes, gérer vos stocks, traiter les commandes et faire prospérer votre entreprise sur le web et sur mobile.<br><br><b>Nos chiffres clés :</b> &bull; Plus de 25 000 boutiques actives &bull; Couverture dans plus de 120 pays &bull; Infrastructure sécurisée et disponible à 99.9%<br><br><b>Notre Mission :</b> Démocratiser le commerce électronique en offrant une solution moderne, rapide et accessible à tous les créateurs d'entreprise.<br><b>Nos Valeurs :</b> Innovation, fiabilité, sécurité et réussite de nos vendeurs.<br><b>Notre Engagement :</b> Offrir un accompagnement réactif et une plateforme performante adaptée aux réalités du marché.",
                'meta_title' => 'À Propos de Nous - My Store Asap',
                'meta_description' => 'Découvrez My Store Asap – la plateforme e-commerce puissante conçue pour simplifier la création et la gestion de vos boutiques en ligne.',
                'is_active' => true,
                'sort_order' => 1
            ],

            [
                'title' => 'Politique de Confidentialité',
                'slug' => 'privacy-policy',
                'content' => "Chez <b>My Store Asap</b>, la protection de vos données personnelles et de celles de vos clients est une priorité absolue. Cette politique de confidentialité détaille les informations que nous collectons, la manière dont nous les utilisons et vos droits.<br><br><b>1. Données Collectées :</b> &bull; Informations de compte (Nom, adresse e-mail, téléphone, nom de la boutique) &bull; Données de transaction et d'historique de commandes &bull; Informations de paiement sécurisées via nos processeurs de paiement partenaires &bull; Données de navigation et d'utilisation de la plateforme.<br><br><b>2. Utilisation des Données :</b> &bull; Assurer la création, l'hébergement et le bon fonctionnement de votre boutique &bull; Traiter vos transactions et commandes en toute sécurité &bull; Améliorer nos services et vous fournir un support technique personnalisé &bull; Lutter contre la fraude et garantir la conformité réglementaire.<br><br><b>3. Protection et Sécurité :</b> Vos données sont protégées grâce à des protocoles de chiffrement avancés (SSL/TLS), des serveurs sécurisés et des audits de sécurité réguliers. Nous ne vendons ni ne louons vos données à des tiers.<br><br><b>4. Vos Droits (RGPD) :</b> Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. Pour toute demande, vous pouvez contacter notre délégué à la protection des données.",
                'meta_title' => 'Politique de Confidentialité - My Store Asap',
                'meta_description' => 'Consultez la politique de confidentialité de My Store Asap concernant la collecte, l\'utilisation et la protection de vos données.',
                'is_active' => true,
                'sort_order' => 2
            ],
            [
                'title' => 'Conditions Générales d\'Utilisation (CGU)',
                'slug' => 'terms-of-service',
                'content' => "Veuillez lire attentivement les présentes Conditions Générales d'Utilisation avant d'utiliser la plateforme <b>My Store Asap</b>. En vous inscrivant ou en accédant à nos services, vous acceptez d'être lié par ces conditions.<br><br><b>1. Acceptation des Conditions :</b> L'utilisation de nos services implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.<br><br><b>2. Description des Services :</b> My Store Asap fournit un logiciel en tant que service (SaaS) permettant de :<br>&bull; Créer et personnaliser des boutiques en ligne et tunnels de vente<br>&bull; Gérer un catalogue de produits, les stocks et les catégories<br>&bull; Recevoir et traiter les commandes clients avec des moyens de paiement intégrés<br>&bull; Accéder à des statistiques détaillées et à des modules de gestion (POS/Caisse, Réductions, etc.)<br><br><b>3. Obligations de l'Utilisateur :</b> En tant que vendeur ou utilisateur, vous vous engagez à :<br>&bull; Fournir des informations exactes et maintenues à jour lors de l'inscription<br>&bull; Préserver la confidentialité de vos identifiants de connexion<br>&bull; Respecter les lois en vigueur concernant la vente de biens et services<br>&bull; Ne pas diffuser de contenus illégaux, contrefaits ou trompeurs.<br><br><b>4. Abonnements et Paiements :</b> Les frais liés à votre formule d'abonnement sont facturés selon les modalités du plan choisi. Tout retard ou défaut de paiement peut entraîner la suspension temporaire de votre accès.<br><br><b>5. Résiliation :</b> Vous pouvez résilier votre abonnement à tout moment. My Store Asap se réserve le droit de suspendre tout compte en cas de violation grave des présentes conditions.",
                'meta_title' => 'Conditions Générales d\'Utilisation - My Store Asap',
                'meta_description' => 'Consultez les conditions générales d\'utilisation et de vente applicables sur la plateforme My Store Asap.',
                'is_active' => true,
                'sort_order' => 3
            ],
            [
                'title' => 'Contactez-nous',
                'slug' => 'contact-us',
                'content' => "Vous avez des questions sur <b>My Store Asap</b>, besoin d'une démonstration ou d'assistance technique ? Notre équipe d'assistance est à votre entière disposition.<br><br><b>Nos Coordonnées :</b><br>&bull; <b>E-mail Support :</b> support@mystoreasap.com (Réponse sous 24 heures)<br>&bull; <b>Téléphone / WhatsApp :</b> +225 07 00 00 00 00 (Lundi au Vendredi, 8h30 - 18h00)<br>&bull; <b>Adresse :</b> Abidjan, Côte d'Ivoire<br><br><b>Horaires du Service Client :</b><br>&bull; Lundi - Vendredi : 08:30 - 18:00<br>&bull; Samedi : 09:00 - 13:00<br>&bull; Dimanche & Jours fériés : Fermé",
                'meta_title' => 'Contactez-nous - Support My Store Asap',
                'meta_description' => 'Contactez l\'équipe My Store Asap pour toute demande d\'information, d\'assistance ou de partenariat.',
                'is_active' => true,
                'sort_order' => 4
            ],
            [
                'title' => 'Foire Aux Questions (FAQ)',
                'slug' => 'faq',
                'content' => "Retrouvez les réponses aux questions les plus fréquemment posées sur l'utilisation de la plateforme <b>My Store Asap</b>.<br><br><b>Prise en main :</b><br><b>Qu'est-ce que My Store Asap ?</b> My Store Asap est une plateforme e-commerce complète permettant d'installer et gérer sa propre boutique en ligne, ses tunnels de vente et sa caisse enregistreuse en quelques clics.<br><b>Puis-je utiliser mon propre nom de domaine ?</b> Oui ! Vous pouvez associer votre propre nom de domaine personnalisé (ex: maboutique.com) ou sous-domaine à votre boutique.<br><br><b>Fonctionnalités & Paiement :</b><br><b>Quels moyens de paiement puis-je proposer ?</b> Vous pouvez accepter le paiement à la livraison, Wave, Orange Money, MTN Money, Stripe, PayPal et le virement bancaire.<br><b>Comment fonctionne la gestion des commandes ?</b> Vous recevez des notifications instantanées pour chaque commande avec suivi du statut (en attente, expédié, livré).",
                'meta_title' => 'Foire Aux Questions (FAQ) - My Store Asap',
                'meta_description' => 'Trouvez rapidement les réponses à vos questions sur la création de boutique, les noms de domaine et la gestion des ventes sur My Store Asap.',
                'is_active' => true,
                'sort_order' => 5
            ],
            [
                'title' => 'Politique de Remboursement',
                'slug' => 'refund-policy',
                'content' => "Veuillez lire attentivement la présente politique de remboursement de <b>My Store Asap</b>.<br><br><b>Absence de Remboursement après Activation :</b> Une fois votre compte activé et l'accès à la plateforme et à vos boutiques mis à votre disposition, <b>aucun remboursement ne pourra être accordé</b>.<br><br><b>Paiements Fermes et Définitifs :</b> Toutes les souscriptions d'abonnement, les renouvellements ainsi que l'achat d'options complémentaires sont fermes et non remboursables. Vous pouvez néanmoins résilier votre abonnement à tout moment pour interrompre le renouvellement automatique à l'échéance de la période en cours.",
                'meta_title' => 'Politique de Remboursement - My Store Asap',
                'meta_description' => 'Consultez la politique de non-remboursement après activation de compte sur My Store Asap.',
                'is_active' => true,
                'sort_order' => 6
            ]

        ];

        foreach ($pages as $index => $pageData) {
            $daysAgo = rand(1, 60) + ($index * 5);
            $createdAt = \Carbon\Carbon::now()->subDays($daysAgo);
            
            $pageData['created_at'] = $createdAt;
            $pageData['updated_at'] = $createdAt;
            
            LandingPageCustomPage::updateOrCreate(
                ['slug' => $pageData['slug']],
                $pageData
            );
        }

    }
}
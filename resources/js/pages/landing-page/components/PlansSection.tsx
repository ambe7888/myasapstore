import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { useTranslation } from 'react-i18next';
import { formatSuperadminCurrency } from '@/utils/helpers';

// Simple encryption function for plan ID
const encryptPlanId = (planId: number): string => {
  const key = 'Store2025';
  const str = planId.toString();
  let encrypted = '';
  for (let i = 0; i < str.length; i++) {
    encrypted += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(encrypted);
};

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  yearly_price?: number;
  duration: string;
  features?: string[];
  stats?: {
    stores: string | number;
    users_per_store: string | number;
    products_per_store: string | number;
    storage: string;
    templates: string | number;
    bio_links?: string;
    bio_links_templates?: string;
  };
  is_popular?: boolean;
  is_plan_enable: string;
}

interface PlansSectionProps {
  brandColor?: string;
  plans: Plan[];
  settings?: any;
  sectionData?: {
    title?: string;
    subtitle?: string;
    faq_text?: string;
  };
}

function PlansSection({ plans, settings, sectionData, brandColor = '#059669' }: PlansSectionProps) {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { ref, isVisible } = useScrollAnimation();
  
  // Get colors from settings
  const colors = settings?.config_sections?.colors || { primary: brandColor, secondary: '#059669', accent: '#065f46' };
  const primaryColor = colors.primary || brandColor;
  const secondaryColor = colors.secondary || '#059669';
  const accentColor = colors.accent || '#065f46';

  // Filter enabled plans
  const enabledPlans = plans.filter(plan => {
    return plan.is_plan_enable === 'on';
  });

  // Default plans if none provided
  const defaultPlans = [
    {
      id: 1,
      name: 'Starter',
      description: 'Idéal pour lancer votre première boutique en ligne',
      price: 0,
      yearly_price: 0,
      duration: 'month',
      features: [
        '1 Boutique en ligne',
        '10 Thèmes E-Commerce HD',
        'Support WhatsApp',
        'Analytiques de base'
      ],
      is_popular: false,
      is_plan_enable: 'on'
    },
    {
      id: 2,
      name: 'Professional',
      description: 'Parfait pour les vendeurs actifs et les tunnels de vente',
      price: 19,
      yearly_price: 190,
      duration: 'month',
      features: [
        '5 Boutiques en ligne',
        'Tunnels de Vente Illimités',
        'Support WhatsApp & COD',
        'Domaine Personnalisé',
        'Branding Personnalisé',
        'Support Prioritaire'
      ],
      is_popular: true,
      is_plan_enable: 'on'
    },
    {
      id: 3,
      name: 'Enterprise',
      description: 'Pour les agences et les grandes marques',
      price: 49,
      yearly_price: 490,
      duration: 'month',
      features: [
        'Boutiques Illimitées',
        'Gestion d\'Équipe',
        'Domaines Personnalisés Multiples',
        'Solution White Label',
        'Accès API & Webhooks',
        'Support Dédié 24/7'
      ],
      is_popular: false,
      is_plan_enable: 'on'
    }
  ];

  const displayPlans = enabledPlans.length > 0 ? enabledPlans : defaultPlans;

  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    return formatSuperadminCurrency(numericAmount);
  };
  
  const getPrice = React.useCallback((plan: Plan) => {
    if (billingCycle === 'yearly' && plan.yearly_price !== undefined) {
      return plan.yearly_price;
    }
    return plan.price;
  }, [billingCycle]);

  return (
    <section id="plans" className="py-16 sm:py-20 lg:py-28 bg-slate-50 relative overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Block Header */}
        <div className={`text-center mb-12 lg:mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t("Tarification Transparente")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {sectionData?.title || t('Des forfaits adaptés à vos ambitions')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed font-medium">
            {sectionData?.subtitle || t('Démarrez gratuitement et faites évoluer votre offre sans aucun frais caché.')}
          </p>

          {/* Billing Switcher Toggle */}
          <div className="inline-flex items-center gap-3 bg-white p-1.5 rounded-full border border-slate-200 shadow-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t("Mensuel")}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t("Annuel")}</span>
              <span className="bg-emerald-500/20 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {displayPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`group relative flex flex-col bg-white rounded-3xl border transition-all duration-300 ${
                plan.is_popular 
                  ? 'border-emerald-500 shadow-2xl shadow-emerald-950/15 ring-2 ring-emerald-500/20 lg:-translate-y-2' 
                  : 'border-slate-200/80 shadow-lg shadow-emerald-950/5 hover:border-emerald-300 hover:shadow-xl'
              }`}
            >
              {/* Popular Badge Header */}
              {plan.is_popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-bold">
                    <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    <span>{t("Le Plus Populaire")}</span>
                  </div>
                </div>
              )}
              
              {/* Content Container */}
              <div className="flex flex-col h-full p-8">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="mb-8 pb-6 border-b border-slate-100 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {getPrice(plan) === 0 ? formatCurrency(0) : formatCurrency(getPrice(plan))}
                  </span>
                  <span className="text-slate-500 text-xs font-medium">
                    /{billingCycle === 'yearly' ? t('an') : t('mois')}
                  </span>
                </div>
                
                {/* Usage Limits Stats */}
                {plan.stats && (
                  <div className="mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                      {t("Ressources incluses")}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                        <div className="text-base font-extrabold text-emerald-600">{plan.stats?.stores || '1'}</div>
                        <div className="text-[10px] font-semibold text-slate-500">{t("Boutiques")}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                        <div className="text-base font-extrabold text-emerald-600">{plan.stats?.products_per_store || '50'}</div>
                        <div className="text-[10px] font-semibold text-slate-500">{t("Produits")}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Features List */}
                <div className="mb-8 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    {t("Fonctionnalités")}
                  </span>
                  <ul className="space-y-3">
                    {(plan.features || []).map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-xs font-medium text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Action CTA */}
                <div className="mt-auto pt-4">
                  <Link
                    href={route('register', { plan: encryptPlanId(plan.id) })}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                      plan.is_popular
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25 hover:scale-[1.02]'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
                    }`}
                  >
                    <span>{plan.price === 0 ? t('Démarrer Gratuitement') : t('Choisir ce forfait')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sectionData?.faq_text && (
          <div className="text-center mt-12">
            <p className="text-slate-500 text-sm font-medium">
              {sectionData.faq_text}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default PlansSection;
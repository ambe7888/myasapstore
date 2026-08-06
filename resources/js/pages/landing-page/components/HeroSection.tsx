import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles, ShoppingBag, Store as StoreIcon, ShieldCheck, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/utils/image-helper';

interface HeroSectionProps {
  brandColor?: string;
  settings: any;
  sectionData: {
    title?: string;
    subtitle?: string;
    announcement_text?: string;
    primary_button_text?: string;
    secondary_button_text?: string;
    image?: string;
    stats?: Array<{value: string; label: string}>;
    card?: {
      name: string;
      title: string;
      company: string;
      initials: string;
    };
  };
}

export default function HeroSection({ settings, sectionData, brandColor = '#059669' }: HeroSectionProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = React.useState(false);
  const heroImage = sectionData.image ? getImageUrl(sectionData.image) : null;

  return (
    <section id="hero" className="pt-28 pb-16 lg:pt-36 lg:pb-24 bg-gradient-to-b from-slate-50 via-emerald-50/30 to-white relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-200/25 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Top Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 border border-emerald-200/90 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
              <span>{sectionData.announcement_text || t("⚡ La plateforme e-commerce tout-en-un #1 pour Tunnels de Vente et Boutiques")}</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              {sectionData.title || (
                <>
                  Lancez votre boutique & vos <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">Tunnels de Vente</span> en 2 min
                </>
              )}
            </h1>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-medium max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {sectionData.subtitle || t("Créez des boutiques haute conversion avec 10 thèmes HD intégrés, tunnels de vente drag & drop, gestion des commandes Cash on Delivery et intégration WhatsApp automatique.")}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center lg:justify-start pt-2">
              <Link
                href={route('register')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-emerald-600/25 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2.5"
              >
                <span>{sectionData.primary_button_text || t('Créer ma boutique gratuitement')}</span>
                <ArrowRight size={18} />
              </Link>

              <a
                href="#templates"
                className="bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 font-bold text-base px-8 py-4 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-emerald-300 flex items-center justify-center gap-2"
              >
                <StoreIcon size={18} className="text-emerald-600" />
                <span>{sectionData.secondary_button_text || t('Explorer les 10 thèmes')}</span>
              </a>
            </div>

            {/* Quick Feature Bullet Points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t("Pas de carte bancaire requise")}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t("Configuration en 2 minutes")}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t("Domaine Personnalisé Gratuit")}</span>
              </div>
            </div>

            {/* Stats Row */}
            {sectionData.stats && sectionData.stats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/60 max-w-xl mx-auto lg:mx-0">
                {sectionData.stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {stat.value}
                    </div>
                    <div className="text-slate-500 font-medium text-xs mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Hero Bento Mockup (5 cols) */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Floating Sales Alert Pill */}
              <div className="absolute -top-5 -right-3 z-30 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-[11px]">{t("Nouvelle Commande !")}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">+ 45 000 FCFA • Tunnels de vente</div>
                </div>
              </div>

              {/* Floating Visitors Badge */}
              <div className="absolute -bottom-5 -left-3 z-30 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span>🔥 148 visiteurs en direct</span>
              </div>

              {/* Main Card Container */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-emerald-950/10 border border-emerald-100/90 relative z-20">
                {/* Store Header Preview */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/20">
                      AS
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Mon E-Shop Express</h4>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ● Boutique En Ligne Active
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Ventes aujourd'hui</span>
                    <span className="font-extrabold text-slate-900 text-sm">345 000 FCFA</span>
                  </div>
                </div>

                {/* Hero Showcase Graphic */}
                {heroImage && !imageError ? (
                  <div className="rounded-2xl overflow-hidden shadow-inner border border-slate-100 relative group">
                    <img 
                      src={heroImage} 
                      alt="Aperçu Boutique" 
                      className="w-full h-64 object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-slate-50 via-emerald-50/50 to-teal-50/30 rounded-2xl p-5 border border-emerald-100/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">10 Thèmes Prêts à l'Emploi</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-100">100% Modifiables</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-1">
                        <div className="w-full h-12 bg-rose-50 rounded-lg flex items-center justify-center text-lg">👗</div>
                        <span className="text-[10px] font-bold text-slate-700 block truncate">Mode</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-1">
                        <div className="w-full h-12 bg-sky-50 rounded-lg flex items-center justify-center text-lg">📱</div>
                        <span className="text-[10px] font-bold text-slate-700 block truncate">High-Tech</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-1">
                        <div className="w-full h-12 bg-amber-50 rounded-lg flex items-center justify-center text-lg">💄</div>
                        <span className="text-[10px] font-bold text-slate-700 block truncate">Beauté</span>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Tunnel de Vente Express</div>
                          <div className="text-[10px] text-slate-500">Validation en 1-clic avec WhatsApp</div>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Actif</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
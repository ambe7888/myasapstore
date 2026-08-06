import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, Play } from 'lucide-react';
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

export default function HeroSection({ settings, sectionData, brandColor = '#3b82f6' }: HeroSectionProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = React.useState(false);
  const heroImage = sectionData.image ? getImageUrl(sectionData.image) : null;
  
  // Get colors from settings
  const colors = settings?.config_sections?.colors || { primary: brandColor, secondary: '#059669', accent: '#065f46' };
  const primaryColor = colors.primary || brandColor;

  return (
    <section id="hero" className="pt-24 sm:pt-28 pb-16 sm:pb-24 bg-slate-950 text-white relative overflow-hidden flex items-center min-h-[90vh]">
      {/* Background Glow Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] opacity-70"></div>
        <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-6 sm:space-y-8">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{sectionData.announcement_text || t('⚡ Plateforme E-commerce & Tunnels de Vente')}</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]" role="banner">
              {sectionData.title ? (
                sectionData.title
              ) : (
                <>
                  Créez vos <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Boutiques & Tunnels</span> en quelques minutes
                </>
              )}
            </h1>
            
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              {sectionData.subtitle || 'Concevez vos boutiques en ligne professionnelles, déployez vos tunnels de vente à haute conversion et recevez vos commandes directement par WhatsApp & Paiement à la livraison.'}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
              <Link
                href={route('register')}
                className="px-7 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-base shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5"
              >
                <span>{sectionData.primary_button_text || t('Créer ma boutique gratuite')}</span>
                <ArrowRight size={18} />
              </Link>

              <a
                href="#templates"
                className="px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2.5 backdrop-blur-sm"
              >
                <Play size={16} className="fill-slate-200 text-slate-200" />
                <span>{sectionData.secondary_button_text || t('Explorer les thèmes (10)')}</span>
              </a>
            </div>

            {/* Quick Stats Banner */}
            {sectionData.stats && sectionData.stats.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                {sectionData.stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-slate-400 text-xs font-medium mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-center lg:text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">10+</div>
                  <div className="text-slate-400 text-xs font-medium mt-0.5">{t("Thèmes Niche")}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">100%</div>
                  <div className="text-slate-400 text-xs font-medium mt-0.5">{t("Mobile Responsive")}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">⚡ 1 Click</div>
                  <div className="text-slate-400 text-xs font-medium mt-0.5">{t("WhatsApp & COD")}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Content - Modern SaaS Preview Card */}
          <div className="relative lg:ml-4">
            {heroImage && sectionData.image && !imageError ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-emerald-500/10">
                <img 
                  src={heroImage} 
                  alt="Hero" 
                  className="w-full h-auto object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="relative mx-auto max-w-md">
                {/* Floating Glow Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-600/30">
                        🛍️
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">CuirMall Store</h3>
                        <p className="text-xs text-emerald-400 font-medium">Boutique Active & En ligne</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Vérifié
                    </span>
                  </div>

                  {/* Feature Pills */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-left">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">{t("Tunnel de vente")}</span>
                      <span className="text-xs font-bold text-white mt-1 block">Drag & Drop Builder</span>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-left">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">{t("Commande Directe")}</span>
                      <span className="text-xs font-bold text-emerald-400 mt-1 block">WhatsApp Express</span>
                    </div>
                  </div>

                  {/* Themes preview row */}
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-medium">Thèmes prêts à l'emploi</span>
                      <span className="text-emerald-400 font-bold">10 Thèmes Pro</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {['Mode & Habillement', 'High-Tech', 'Beauté', 'Montres'].map((tName, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-200 font-medium whitespace-nowrap border border-slate-700">
                          {tName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Demo Conversion Metric */}
                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-950/60 to-teal-950/40 rounded-xl border border-emerald-800/60">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🚀</span>
                      <span className="text-xs font-semibold text-white">Taux de conversion moyen</span>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-400">+34%</span>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-teal-500/20 rounded-full blur-xl pointer-events-none"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
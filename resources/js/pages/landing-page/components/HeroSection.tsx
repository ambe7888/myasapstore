import React from 'react';
import { Link } from '@inertiajs/react';
import { Play, Lock } from 'lucide-react';
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
  };
}

export default function HeroSection({ settings, sectionData, brandColor = '#00b87c' }: HeroSectionProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = React.useState(false);
  const heroImage = sectionData?.image ? getImageUrl(sectionData.image) : null;

  // Get dynamic colors from landing page settings
  const colors = settings?.config_sections?.colors || settings?.config_sections?.theme || {};
  const primaryColor = colors.primary || colors.primary_color || brandColor || '#00b87c';

  return (
    <section 
      id="hero" 
      className="relative pt-32 pb-20 text-white overflow-hidden min-h-[90vh] flex flex-col justify-between"
      style={{ backgroundColor: primaryColor }}
    >
      
      {/* Decorative Background Accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Content */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Promo Badge */}
            <div className="inline-flex items-center gap-2 bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-md transform hover:scale-105 transition-all">
              <span className="bg-[#00b87c] text-white px-2 py-0.5 rounded-full text-[10px] uppercase font-black">PROMO</span>
              <span>{sectionData.announcement_text || t("70% Special Offer")}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              {sectionData.title || t("Ecommerce Store with Multi theme and Multi Store")}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 leading-relaxed font-normal max-w-xl mx-auto lg:mx-0">
              {sectionData.subtitle || t("Use these awesome forms to login or create new account in your project for free.")}
            </p>

            {/* Action Buttons - Outlined Pill Style like ECOMMERCEGO */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start pt-2">
              <Link
                href={route('register')}
                className="px-7 py-3.5 rounded-full text-base font-bold text-white border-2 border-white/90 hover:border-white hover:bg-white hover:text-[#00b87c] transition-all flex items-center gap-2 shadow-lg group"
              >
                <span>{sectionData.primary_button_text || t("Démo en direct")}</span>
                <div className="w-6 h-6 rounded-full bg-white/20 group-hover:bg-[#00b87c] group-hover:text-white flex items-center justify-center transition-colors">
                  <Play size={12} className="fill-current translate-x-0.5" />
                </div>
              </Link>
              
              <Link
                href={route('login')}
                className="px-7 py-3.5 rounded-full text-base font-bold text-white border-2 border-white/90 hover:border-white hover:bg-white hover:text-[#00b87c] transition-all flex items-center gap-2 shadow-lg group"
              >
                <span>{sectionData.secondary_button_text || t("Commencer")}</span>
                <Lock size={16} className="text-white/90 group-hover:text-[#00b87c]" />
              </Link>
            </div>

            {/* Social Proof Text */}
            <div className="pt-6 flex items-center justify-center lg:justify-start gap-3 text-xs font-bold text-white/90">
              <span className="flex -space-x-2">
                <span className="w-7 h-7 rounded-full bg-emerald-700 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">4.9</span>
                <span className="w-7 h-7 rounded-full bg-teal-800 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">★</span>
              </span>
              <span>{t("Trusted by 1000+ Customer")}</span>
            </div>
          </div>

          {/* Right Column - Dashboard Mockup Preview */}
          <div className="lg:col-span-6 relative">
            <div className="relative transform lg:rotate-1 hover:rotate-0 transition-transform duration-500 shadow-2xl rounded-2xl overflow-hidden border-4 border-white/30 bg-white">
              <img 
                src={heroImage && sectionData?.image && !imageError ? heroImage : "/images/hero-dashboard-preview.png"} 
                alt="Dashboard Preview" 
                className="w-full h-auto object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Continuous Brand Ticker */}
      <div className="w-full pt-10 pb-4 bg-black/10 backdrop-blur-sm border-t border-white/10 mt-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-white/80 text-xs font-black tracking-widest uppercase overflow-x-auto gap-8 whitespace-nowrap">
          <span>ECOMMERCEGO</span>
          <span>•</span>
          <span>MY STORE ASAP</span>
          <span>•</span>
          <span>MULTI STORE</span>
          <span>•</span>
          <span>MULTI THEME</span>
          <span>•</span>
          <span>POS SYSTEM</span>
          <span>•</span>
          <span>FUNNEL BUILDER</span>
          <span>•</span>
          <span>MY STORE ASAP</span>
        </div>
      </div>

    </section>
  );
}
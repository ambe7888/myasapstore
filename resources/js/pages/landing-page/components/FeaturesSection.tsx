import React from 'react';
import { QrCode, Smartphone, Share2, BarChart3, Globe, Shield, Star, Zap, Users, Lock, Wifi, Heart, ArrowUpRight } from 'lucide-react';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { useTranslation } from 'react-i18next';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesSectionProps {
  brandColor?: string;
  settings: any;
  sectionData: {
    title?: string;
    description?: string;
    features_list?: Feature[];
    image?: string;
    background_color?: string;
    columns?: number;
  };
}

// Icon mapping for dynamic icons
const iconMap: Record<string, React.ComponentType<any>> = {
  'qr-code': QrCode,
  'smartphone': Smartphone,
  'share': Share2,
  'bar-chart': BarChart3,
  'globe': Globe,
  'shield': Shield,
  'star': Star,
  'zap': Zap,
  'users': Users,
  'lock': Lock,
  'wifi': Wifi,
  'heart': Heart
};

export default function FeaturesSection({ settings, sectionData, brandColor = '#059669' }: FeaturesSectionProps) {
  const { ref, isVisible } = useScrollAnimation();
  const { t } = useTranslation();
  
  // Get colors from settings
  const colors = settings?.config_sections?.colors || { primary: brandColor, secondary: '#059669', accent: '#065f46' };
  const primaryColor = colors.primary || brandColor;
  const secondaryColor = colors.secondary || '#059669';
  const accentColor = colors.accent || '#065f46';

  // Helper to get full URL for images
  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${window.appSettings?.imageUrl || ''}${path}`;
  };
  
  const sectionImage = getImageUrl(sectionData.image);
  const backgroundColor = sectionData.background_color || '#f8fafc';
  const columns = sectionData.columns || 3;

  // Default features if none provided
  const defaultFeatures = [
    {
      icon: 'bar-chart',
      title: 'Tunnels de Vente Drag & Drop',
      description: 'Concevez des tunnels de vente captivants pour maximiser vos taux de conversion avec paiement à la livraison.'
    },
    {
      icon: 'globe',
      title: '10 Thèmes E-Commerce Spécialisés',
      description: 'Déployez une boutique au design sur mesure pour la mode, le high-tech, la beauté, les bijoux ou l\'automobile.'
    },
    {
      icon: 'shield',
      title: 'Commandes WhatsApp & Cash on Delivery',
      description: 'Recevez les notifications de commandes directement sur WhatsApp et facilitez les paiements à la livraison.'
    }
  ];

  const features = sectionData.features_list && sectionData.features_list.length > 0 
    ? sectionData.features_list 
    : defaultFeatures;

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-28 relative overflow-hidden" style={{ backgroundColor }} ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Block Section Header */}
        <div className={`text-center mb-12 lg:mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-4">
            <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t("Fonctionnalités Clés")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {sectionData.title || t('Des outils puissants pour faire décoller vos ventes')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            {sectionData.description || t('Tout ce dont vous avez besoin pour créer, gérer et optimiser vos boutiques et tunnels de vente en ligne.')}
          </p>
        </div>

        {sectionImage && (
          <div className="mb-12 text-center">
            <img src={sectionImage} alt="Features" className="max-w-full h-auto rounded-3xl shadow-2xl border border-slate-200/80 mx-auto" />
          </div>
        )}
        
        {/* Bento Grid Cards */}
        <div className={`grid grid-cols-1 ${columns >= 2 ? 'sm:grid-cols-2' : ''} ${columns >= 3 ? 'lg:grid-cols-3' : ''} ${columns >= 4 ? 'xl:grid-cols-4' : ''} gap-6 lg:gap-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || QrCode;
            const cardColor = index % 3 === 0 ? primaryColor : index % 3 === 1 ? secondaryColor : accentColor;
            
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-emerald-950/5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-110" 
                      style={{ backgroundColor: `${cardColor}15` }}
                    >
                      <IconComponent className="w-7 h-7" style={{ color: cardColor }} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
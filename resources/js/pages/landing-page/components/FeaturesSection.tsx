import React from 'react';
import { QrCode, Smartphone, Share2, BarChart3, Globe, Shield, Star, Zap, Users, Lock, Wifi, Heart } from 'lucide-react';
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

export default function FeaturesSection({ settings, sectionData, brandColor = '#3b82f6' }: FeaturesSectionProps) {
  const { ref, isVisible } = useScrollAnimation();
  const { t } = useTranslation();
  
  // Get colors from settings
  const colors = settings?.config_sections?.colors || { primary: brandColor, secondary: '#059669', accent: '#065f46' };
  const primaryColor = colors.primary || brandColor;
  const secondaryColor = colors.secondary || '#059669';
  const accentColor = colors.accent || '#065f46';
  // Helper to get full URL for images
  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${window.appSettings.imageUrl}${path}`;
  };
  
  const sectionImage = getImageUrl(sectionData.image);
  const backgroundColor = sectionData.background_color || '#f9fafb';
  const columns = sectionData.columns || 3;
  // Default features with generated 3D vector illustrations
  const defaultFeatures = [
    {
      image: '/images/discover-1.png',
      icon: 'globe',
      title: t('Boutiques En Ligne & Tunnels de Vente'),
      description: t("Créez des boutiques en ligne captivantes et des tunnels de vente haute conversion pour maximiser vos commandes en quelques clics.")
    },
    {
      image: '/images/discover-2.png',
      icon: 'smartphone',
      title: t('Caisse POS & Mobile Money Intégré'),
      description: t("Encaissez vos clients facilement en ligne et en magasin via Wave, Orange Money, MTN, Moov, cartes bancaires et paiement à la livraison.")
    },
    {
      image: '/images/discover-3.png',
      icon: 'zap',
      title: t('Commandes WhatsApp & Suivi Livraison'),
      description: t("Recevez automatiquement vos commandes sur WhatsApp et gérez vos zones d'expédition et livreurs avec un suivi en temps réel.")
    }
  ];

  const features = sectionData.features_list && sectionData.features_list.length > 0 
    ? sectionData.features_list 
    : defaultFeatures;

  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-slate-50/80" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-10 sm:mb-14 lg:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-black text-[#00b87c] tracking-widest uppercase mb-3">
            <span>DÉCOUVRIR MY STORE ASAP</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {sectionData.title || t('Découvrez les Fonctionnalités Clés de votre Plateforme')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            {sectionData.description || t('Tout ce dont vous avez besoin pour lancer, développer et automatiser vos ventes e-commerce rapidement et sans compétences techniques.')}
          </p>
        </div>

        {sectionImage && (
          <div className="mb-8 sm:mb-12 text-center">
            <img src={sectionImage} alt="Features" className="max-w-full h-auto rounded-xl shadow-lg mx-auto" />
          </div>
        )}
        
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {features.map((feature: any, index: number) => {
            const IconComponent = iconMap[feature.icon] || QrCode;
            const cardImage = feature.image || (index === 0 ? '/images/discover-1.png' : index === 1 ? '/images/discover-2.png' : '/images/discover-3.png');

            return (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
              >
                <div>
                  {/* Card Illustration */}
                  <div className="mb-6 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm aspect-video relative group-hover:scale-[1.03] transition-transform duration-500">
                    <img 
                      src={cardImage} 
                      alt={feature.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight group-hover:text-[#00b87c] transition-colors">
                    {t(feature.title)}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {t(feature.description)}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00b87c]">
                  <span>{t("En savoir plus")}</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
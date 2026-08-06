import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Eye, Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { getStoreThemes } from '@/data/storeThemes';
import { getImageUrl } from '@/utils/image-helper';

interface Template {
  name: string;
  label?: string;
  category?: string;
  image?: string;
  description?: string;
}

interface TemplatesSectionProps {
  settings?: any;
  sectionData: {
    title?: string;
    subtitle?: string;
    background_color?: string;
    layout?: string;
    columns?: number;
    templates_list?: Template[];
    cta_text?: string;
    cta_link?: string;
  };
  brandColor: string;
}

export default function TemplatesSection({ settings, sectionData, brandColor }: TemplatesSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [previewTheme, setPreviewTheme] = useState<any | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const {
    title = 'Explorez nos thèmes de boutiques e-commerce',
    subtitle = 'Choisissez parmi nos thèmes professionnels prêts à l\'emploi, spécialement conçus pour sublimer vos produits et maximiser vos ventes.',
    background_color = '#f8fafc',
    layout = 'grid',
    columns = 3,
    templates_list = [],
    cta_text = 'Créer ma boutique maintenant',
    cta_link = '/register'
  } = sectionData || {};

  const allStoreThemes = getStoreThemes();

  // Combine configured templates_list with storeThemes fallback to ensure 10 real store themes are displayed
  const displayThemes = (templates_list && templates_list.length > 0 ? templates_list : allStoreThemes.map(t => ({
    name: t.id,
    label: t.name,
    category: t.id === 'jewelry' || t.id === 'watches' ? 'Luxe' :
              t.id === 'beauty-cosmetics' || t.id === 'perfume-fragrances' ? 'Beauté' :
              t.id === 'electronics' ? 'High-Tech' :
              t.id === 'fashion' ? 'Mode' :
              t.id === 'furniture-interior' || t.id === 'home-accessories' ? 'Maison' :
              t.id === 'cars-automotive' ? 'Auto' : 'Enfants',
    image: t.imagePath,
    description: t.description
  }))).map(item => {
    const matched = allStoreThemes.find(t => t.id === item.name);
    return {
      id: item.name,
      name: item.label || matched?.name || item.name.replace(/-/g, ' ').toUpperCase(),
      category: item.category || 'E-commerce',
      description: item.description || matched?.description || 'Design moderne et optimisé pour le e-commerce et la vente directe.',
      image: getImageUrl(item.image || matched?.imagePath || matched?.thumbnail || `/storage/placeholder/themes/${item.name}.webp`)
    };
  });

  // Carousel pagination
  const templatesPerSlide = 3;
  const totalSlides = Math.ceil(displayThemes.length / templatesPerSlide);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  }, [currentSlide]);

  const TemplateCard = ({ theme }: { theme: any }) => (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200/80 group flex flex-col h-full">
      {/* Theme Image Container */}
      <div className="relative h-64 bg-slate-100 overflow-hidden">
        <img
          src={theme.image}
          alt={theme.name}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.endsWith('.webp')) {
              target.src = target.src.replace('.webp', '.png');
            } else {
              target.src = `https://placehold.co/600x400?text=${encodeURIComponent(theme.name)}`;
            }
          }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => setPreviewTheme(theme)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold text-xs shadow-lg hover:bg-slate-50 transition-all hover:scale-105"
          >
            <Eye className="h-4 w-4 text-violet-600" />
            Aperçu rapide
          </button>
        </div>

        {/* Category Badge */}
        <span
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md backdrop-blur-md"
          style={{ backgroundColor: brandColor || '#7c3aed' }}
        >
          {theme.category}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
            {theme.name}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {theme.description}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Thème inclus
          </span>
          <button
            onClick={() => setPreviewTheme(theme)}
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
          >
            Découvrir <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section 
      id="templates" 
      className="py-16 md:py-24 relative overflow-hidden"
      style={{ backgroundColor: background_color }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Thèmes Premium
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {title}
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Carousel / Slider Layout */}
        {(layout === 'carousel' || layout === 'slider') && (
          <div className="relative mb-12">
            {totalSlides > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute top-1/2 -left-4 md:-left-6 transform -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-all border border-slate-200"
                  aria-label="Thème précédent"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button 
                  onClick={nextSlide}
                  className="absolute top-1/2 -right-4 md:-right-6 transform -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-all border border-slate-200"
                  aria-label="Thème suivant"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="overflow-hidden rounded-2xl p-1">
              <div 
                ref={sliderRef}
                className="flex transition-transform duration-500 ease-in-out"
                style={{ width: `${totalSlides * 100}%` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div 
                    key={slideIndex} 
                    className="flex-shrink-0"
                    style={{ width: `${100 / totalSlides}%` }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                      {displayThemes
                        .slice(slideIndex * templatesPerSlide, (slideIndex + 1) * templatesPerSlide)
                        .map((theme, index) => (
                          <TemplateCard key={index} theme={theme} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalSlides > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-8 bg-violet-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                    aria-label={`Aller au slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grid Layout */}
        {layout === 'grid' && (
          <div className="mb-12">
            <div className={`grid grid-cols-1 ${
              columns === 1 ? '' : 
              columns === 2 ? 'md:grid-cols-2' : 
              columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 
              'md:grid-cols-2 lg:grid-cols-4'} gap-6 md:gap-8`}
            >
              {displayThemes.map((theme, index) => (
                <TemplateCard key={index} theme={theme} />
              ))}
            </div>
          </div>
        )}

        {/* CTA Banner */}
        {cta_text && (
          <div className="text-center mt-12">
            <Link
              href={cta_link}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
              style={{ backgroundColor: brandColor || '#7c3aed' }}
            >
              {cta_text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        )}
      </div>

      {/* Modal Preview Dialog */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 uppercase tracking-wider">
                  {previewTheme.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{previewTheme.name}</h3>
              </div>
              <button
                onClick={() => setPreviewTheme(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 max-h-[450px]">
                <img
                  src={previewTheme.image}
                  alt={previewTheme.name}
                  className="w-full h-auto object-cover object-top"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.endsWith('.webp')) {
                      target.src = target.src.replace('.webp', '.png');
                    }
                  }}
                />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {previewTheme.description}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setPreviewTheme(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Fermer
              </button>
              <Link
                href={`/register?theme=${previewTheme.id}`}
                className="px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                style={{ backgroundColor: brandColor || '#7c3aed' }}
              >
                Créer ma boutique avec ce thème
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
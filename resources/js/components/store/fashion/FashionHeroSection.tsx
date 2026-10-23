import React from 'react';
import { usePage } from '@inertiajs/react';
import { ArrowRight, Award, Headphones, RefreshCw, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { getImageUrl } from '@/utils/image-helper';
import { generateStoreUrl, formatCustomLink } from '@/utils/store-url-helper';

interface FashionHeroSectionProps {
  content?: any;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  truck: Truck,
  'refresh-cw': RefreshCw,
  award: Award,
  shield: ShieldCheck,
  headphones: Headphones,
};

const DEFAULT_BOXES = [
  { icon: 'truck', title: 'Livraison rapide', description: 'Directement chez vous' },
  { icon: 'shield', title: 'Paiement sécurisé', description: 'Commandez en toute confiance' },
  { icon: 'headphones', title: 'Service client', description: 'Une équipe à votre écoute' },
];

export default function FashionHeroSection({ content }: FashionHeroSectionProps) {
  const { props } = usePage();
  const store = props.store;
  const boxes = Array.isArray(content?.info_boxes) && content.info_boxes.length > 0 ? content.info_boxes : DEFAULT_BOXES;

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        <div className="grid lg:grid-cols-2 items-stretch rounded-3xl bg-slate-50 overflow-hidden">
          <div className="order-2 lg:order-1 flex flex-col justify-center p-8 md:p-12 lg:p-16">
            {content?.badge_text && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                {content.badge_text}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.05]">
              {content?.title || 'Découvrez notre nouvelle collection'}
            </h1>

            <p className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-lg">
              {content?.subtitle || 'Une sélection pensée pour vous, livrée directement chez vous.'}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={formatCustomLink(content?.button_link, store, generateStoreUrl('store.products', store))}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                {content?.button_text || 'Voir la boutique'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              {content?.secondary_button_text && (
                <a
                  href={formatCustomLink(content?.secondary_button_link, store, generateStoreUrl('store.products', store))}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 hover:border-slate-900 transition-colors"
                >
                  {content.secondary_button_text}
                </a>
              )}
            </div>
          </div>

          <div className="order-1 lg:order-2 relative min-h-[280px] sm:min-h-[360px] lg:min-h-[560px] bg-slate-100">
            <img
              src={getImageUrl(content?.image || '/storage/media/4/home-banner-fashion.png')}
              alt={content?.title || 'Collection'}
              className="absolute inset-0 h-full w-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=1200&fit=crop&crop=center';
              }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {boxes.map((box: any, index: number) => {
            const Icon = ICONS[box.icon] || Sparkles;
            return (
              <div key={index} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{box.title}</p>
                  <p className="text-xs text-slate-500">{box.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { FashionProductCard } from './';
import { usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { generateStoreUrl } from '@/utils/store-url-helper';

interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number;
  cover_image?: string;
  slug: string;
  href?: string;
}

interface FashionTrendingProductsSectionProps {
  products?: Product[];
  content?: any;
  storeSettings?: any;
  currencies?: any[];
}

export default function FashionTrendingProductsSection({ products = [], content, storeSettings = {}, currencies = [] }: FashionTrendingProductsSectionProps) {
  const { props } = usePage();
  const store = props.store;

  const items = products.slice(0, 8);

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              {content?.title || 'Nouveautés'}
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-500 max-w-xl">
              {content?.description || 'Les derniers articles ajoutés à la boutique.'}
            </p>
          </div>
          <a
            href={generateStoreUrl('store.products', store)}
            className="hidden sm:inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-900 hover:underline underline-offset-4"
          >
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5">
            {items.map((product) => (
              <FashionProductCard key={product.id} product={product as any} storeSettings={storeSettings} currencies={currencies} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
            <p className="text-slate-500">Aucun produit disponible pour le moment.</p>
          </div>
        )}

        <a
          href={generateStoreUrl('store.products', store)}
          className="mt-8 sm:hidden inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-300 py-3 text-sm font-semibold text-slate-900"
        >
          Voir tout
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

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

interface FashionFeaturedProductsSectionProps {
  products?: Product[];
  content?: any;
  storeSettings?: any;
  currencies?: any[];
}

export default function FashionFeaturedProductsSection({ products = [], content, storeSettings = {}, currencies = [] }: FashionFeaturedProductsSectionProps) {
  const { props } = usePage();
  const store = props.store;

  return (
    <section className="py-14 lg:py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              {content?.title || 'Nos sélections'}
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-500 max-w-xl">
              {content?.description || 'Les articles à ne pas manquer.'}
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

        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5">
            {products.map((product) => (
              <FashionProductCard key={product.id} product={product as any} storeSettings={storeSettings} currencies={currencies} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
            <p className="text-slate-500">Aucun produit disponible pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}

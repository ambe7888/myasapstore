import React from 'react';
import { usePage } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getImageUrl } from '@/utils/image-helper';
import { generateStoreUrl } from '@/utils/store-url-helper';

interface Category {
  id: number;
  name: string;
  slug: string;
  href: string;
  image?: string;
  description?: string;
}

interface FashionCategorySectionProps {
  categories?: Category[];
  content?: any;
}

export default function FashionCategorySection({ categories = [], content }: FashionCategorySectionProps) {
  const { props } = usePage();
  const store = props.store;

  const items = categories.slice(0, 8).map((category) => ({
    ...category,
    image: category.image
      ? getImageUrl(category.image)
      : `https://placehold.co/600x750/f1f5f9/475569?text=${encodeURIComponent(category.name)}`,
  }));

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              {content?.title || 'Acheter par catégorie'}
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-500 max-w-xl">
              {content?.description || 'Parcourez nos catégories et trouvez ce qu\'il vous faut.'}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {items.map((category) => (
              <a
                key={category.id}
                href={category.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/600x750/f1f5f9/475569?text=${encodeURIComponent(category.name)}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">{category.name}</h3>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
            <p className="text-slate-500">Aucune catégorie disponible pour le moment.</p>
          </div>
        )}

        <a
          href={generateStoreUrl('store.products', store)}
          className="mt-6 sm:hidden inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-300 py-3 text-sm font-semibold text-slate-900"
        >
          Voir tout
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

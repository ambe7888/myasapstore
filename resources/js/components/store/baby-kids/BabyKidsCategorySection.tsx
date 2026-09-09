import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { getImageUrl } from '@/utils/image-helper';
import { generateStoreUrl } from '@/utils/store-url-helper';

interface BabyKidsCategorySectionProps {
  categories?: any[];
  content?: any;
}

export default function BabyKidsCategorySection({ categories = [], content }: BabyKidsCategorySectionProps) {
  const { props } = usePage();
  const store = props.store;
  
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            {content?.title || 'Achetez par âge'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {content?.description || "Découvrez notre sélection soigneusement choisie pour vous."}
          </p>
        </div>

        {/* Toy Block Stack Layout */}
        <div className="max-w-8xl mx-auto">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune catégorie disponible pour le moment.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.slice(0, 6).map((category, index) => (
              <Link
                key={category.id}
                href={generateStoreUrl('store.products', store) + '?category=' + category.id}
                className="group block"
              >
                {/* Stacked Block Design */}
                <div className="relative">
                  {/* Shadow Block (Bottom) */}
                  <div className="absolute top-2 left-2 w-full h-full rounded-2xl bg-pink-300 opacity-40"></div>
                  
                  {/* Main Block */}
                  <div className="relative bg-white rounded-2xl shadow-xl border-4 border-pink-400 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
                    {/* Image Area */}
                    <div className="relative h-48 overflow-hidden rounded-t-xl">
                      <img
                        src={category.image ? getImageUrl(category.image) : `https://placehold.co/400x300/${
                          index % 4 === 0 ? 'fce7f3/ec4899' :
                          index % 4 === 1 ? 'dbeafe/3b82f6' :
                          index % 4 === 2 ? 'fef3c7/eab308' :
                          'dcfce7/22c55e'
                        }?text=${encodeURIComponent(category.name)}`}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/400x300/${
                            index % 4 === 0 ? 'fce7f3/ec4899' :
                            index % 4 === 1 ? 'dbeafe/3b82f6' :
                            index % 4 === 2 ? 'fef3c7/eab308' :
                            'dcfce7/22c55e'
                          }?text=${encodeURIComponent(category.name)}`;
                        }}
                      />
                      

                    </div>
                    
                    {/* Content Area */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {category.description || 'Parfait pour les petits'}
                      </p>
                      
                      {/* Arrow Icon */}
                      <div className="flex justify-end">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform duration-300 group-hover:rotate-12 bg-pink-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link
            href={generateStoreUrl('store.products', store)}
            className="inline-flex items-center px-8 py-4 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition-all duration-300 shadow-lg"
          >
            <span>{content?.view_all_text || 'Voir toutes les catégories'}</span>
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
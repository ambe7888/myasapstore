import React, { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import AddToCartButton from '../AddToCartButton';
import { useWishlist } from '@/contexts/WishlistContext';
import { getImageUrl, getProductCoverImage } from '@/utils/image-helper';
import { useCurrencyFormatter } from '@/hooks/use-store-currency';
import { generateStoreUrl } from '@/utils/store-url-helper';
import BuyNowButton from '@/components/store/BuyNowButton';

interface FashionProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    sale_price?: number | null;
    cover_image: string;
    category?: { id: number; name: string };
    stock: number;
    is_active: boolean;
    variants?: Array<{
      name: string;
      values: string[];
    }>;
    [key: string]: any;
  };
  storeSettings?: any;
  currencies?: any[];
}

export default function FashionProductCard({ product }: FashionProductCardProps) {
  const { props } = usePage();
  const store = props.store;
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const format = useCurrencyFormatter();

  const [isFallback, setIsFallback] = useState(!product.cover_image && !product.image);

  const isProductInWishlist = isInWishlist(product.id);
  const price = Number(product.price);
  const salePrice = product.sale_price ? Number(product.sale_price) : null;
  const isOnSale = salePrice !== null && salePrice < price;
  const discount = isOnSale ? Math.round(((price - (salePrice as number)) / price) * 100) : 0;
  const isInStock = product.stock > 0 && product.is_active;
  const rating = Number(product.average_rating || product.rating || 0);
  const hasReviews = (product.total_reviews || product.reviews_count || 0) > 0;
  const productUrl = generateStoreUrl('store.product', store, { id: product.id });

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  return (
    <div className="group flex flex-col">
      <Link href={productUrl} className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={getProductCoverImage(product, store)}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${isFallback ? 'object-contain p-8' : 'object-cover'}`}
          onError={(e) => {
            setIsFallback(true);
            const storeLogo = store?.logo || store?.logo_dark || store?.logo_light;
            (e.target as HTMLImageElement).src = storeLogo ? getImageUrl(storeLogo) : getImageUrl('/images/logos/logo-dark.png');
          }}
        />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {isOnSale && (
            <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white">
              -{discount}%
            </span>
          )}
          {!isInStock && (
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
              Rupture de stock
            </span>
          )}
        </div>

        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={isProductInWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`h-4 w-4 ${isProductInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        {product.category && (
          <Link
            href={generateStoreUrl('store.products', store) + '?category=' + product.category.id}
            className="text-[11px] uppercase tracking-wide text-slate-400 hover:text-slate-700 transition-colors"
          >
            {product.category.name}
          </Link>
        )}

        <Link href={productUrl}>
          <h3 className="mt-1 line-clamp-2 text-sm sm:text-[15px] font-medium text-slate-900 hover:underline underline-offset-2">
            {product.name}
          </h3>
        </Link>

        {hasReviews && (
          <div className="mt-1.5 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-500">{rating.toFixed(1)}</span>
          </div>
        )}

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold text-slate-900">{format(isOnSale ? salePrice : price)}</span>
          {isOnSale && <span className="text-sm text-slate-400 line-through">{format(price)}</span>}
        </div>

        <div className="mt-3 flex gap-2">
          {store?.show_add_to_cart_button !== false && (
            <div className="min-w-0 flex-1">
              <AddToCartButton
                product={product}
                store={store}
                className="flex h-10 w-full items-center justify-center rounded-full px-2 text-[11px] sm:text-xs font-semibold text-white"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <BuyNowButton
              product={product}
              store={store}
              className="flex h-10 w-full items-center justify-center rounded-full px-2 text-[11px] sm:text-xs font-semibold text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

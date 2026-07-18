import React from 'react';
import { ShoppingCart, Settings } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { router } from '@inertiajs/react';
import { generateStoreUrl } from '@/utils/store-url-helper';
import { useTranslation } from 'react-i18next';

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    sale_price?: number;
    cover_image: string;
    variants?: any;
    stock: number;
    is_active: boolean;
  };
  store: any;
  className?: string;
  isShowOption?: boolean;
  quantity?: number;
}

export default function AddToCartButton({ product, store, className = '', isShowOption=true, quantity=1 }: AddToCartButtonProps) {
  const { addToCart, loading } = useCart();
  const { t } = useTranslation();
  
  const hasVariants = product.variants && (
    Array.isArray(product.variants) ? product.variants.length > 0 : 
    Object.keys(product.variants).length > 0
  );
  
  const hasSelectedVariants = product.variants && !Array.isArray(product.variants) && Object.keys(product.variants).length > 0 && Object.values(product.variants).every(v => v !== null && v !== undefined && v !== '');
  
  const isOutOfStock = !product.is_active || product.stock <= 0;

  const handleClick = async () => {
    if (isOutOfStock) return;
    if (hasVariants && !hasSelectedVariants) {
      if (isShowOption) {
        // Redirect to product page to select variants
        router.visit(generateStoreUrl('store.product', store, {id: product.id}));
      } else {
        // On product page, show alert to select variants
        alert(t('Please select product options before adding to cart.'));
      }
      return;
    }
    await addToCart(product, {variants:product.variants}, quantity);
  };

  if (isOutOfStock) {
    return (
      <button 
        disabled 
        className={`bg-gray-300 text-gray-500 cursor-not-allowed ${className}`}
      >
        {t('Out of Stock')}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center ${loading ? 'opacity-50' : ''} hover:brightness-95 transition-all ${className}`}
      style={{ backgroundColor: 'var(--btn-add-to-cart-color)' }}
    >
      {hasVariants && !hasSelectedVariants ? (
        <>
          <Settings className="h-4 w-4 mr-2" />
          {t('Select Options')}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {store?.button_text_add_to_cart || t('Add to Cart')}
        </>
      )}
    </button>
  );
}
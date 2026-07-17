import React, { useState } from 'react';
import { ShoppingBag, Settings } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { router } from '@inertiajs/react';
import { generateStoreUrl } from '@/utils/store-url-helper';

interface BuyNowButtonProps {
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

export default function BuyNowButton({ product, store, className = '', isShowOption=true, quantity=1 }: BuyNowButtonProps) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  
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
        alert('Veuillez sélectionner les options du produit.');
      }
      return;
    }
    
    setLoading(true);
    try {
        await addToCart(product, {variants:product.variants}, quantity);
        // Redirect to checkout immediately
        window.location.href = generateStoreUrl('store.checkout', store);
    } catch (error) {
        console.error('Error placing direct order', error);
        setLoading(false);
    }
  };

  if (isOutOfStock) {
    return (
      <button 
        disabled 
        className={`bg-gray-300 text-gray-500 cursor-not-allowed ${className}`}
      >
        Rupture de stock
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center ${loading ? 'opacity-50' : ''} ${className}`}
    >
      {hasVariants && !hasSelectedVariants ? (
        <>
          <Settings className="h-4 w-4 mr-2" />
          {isShowOption ? 'Sélectionner les options' : 'Sélectionner les options'}
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4 mr-2" />
          {loading ? 'Redirection...' : 'Acheter maintenant'}
        </>
      )}
    </button>
  );
}

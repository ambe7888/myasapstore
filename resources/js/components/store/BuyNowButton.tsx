import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import QuickCheckoutModal from '@/components/store/QuickCheckoutModal';

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
  selectedVariants?: Record<string, string>;
  store: any;
  className?: string;
  isShowOption?: boolean;
  quantity?: number;
}

export default function BuyNowButton({ product, selectedVariants, store, className = '', isShowOption=true, quantity=1 }: BuyNowButtonProps) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isOutOfStock = product.is_active === false || (product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    // Always open Quick Express Order Modal
    // The modal itself handles variant selection
    setIsModalOpen(true);
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
    <>
      <button
        onClick={handleClick}
        className={`flex items-center justify-center hover:brightness-95 transition-all ${className}`}
        style={{ backgroundColor: store?.button_color_buy_now || 'var(--btn-buy-now-color, #16a34a)' }}
      >
        <ShoppingBag className="h-4 w-4 mr-2" />
        {store?.button_text_buy_now || t('Buy Now')}
      </button>

      <QuickCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        selectedVariants={selectedVariants}
        store={store}
        initialQuantity={quantity}
      />
    </>
  );
}


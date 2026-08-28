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
        className={`inline-flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis px-1.5 sm:px-2.5 py-1.5 hover:brightness-95 transition-all text-[11px] sm:text-xs font-semibold leading-none ${className}`}
        style={{ backgroundColor: store?.button_color_buy_now || 'var(--btn-buy-now-color, #ea580c)' }}
      >
        <ShoppingBag className="h-3.5 w-3.5 mr-1 shrink-0" />
        <span className="truncate">{store?.button_text_buy_now || t('Buy Now')}</span>
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


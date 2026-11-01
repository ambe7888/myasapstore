import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import FunnelBlockPreview from '@/components/funnel/FunnelBlockPreview';
import FunnelCheckoutPopup from '@/components/funnel/FunnelCheckoutPopup';

interface Props {
  funnel: {
    id: number;
    seo_title: string;
    seo_description: string;
    favicon: string;
    custom_css: string;
    settings: Record<string, any>;
    blocks: Array<{ id: number; type: string; settings: Record<string, any> }>;
  };
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    sale_price: number | null;
    cover_image: string;
    images: string;
    variants: any[];
    stock: number;
  };
  store: {
    id: number;
    name: string;
    slug: string;
    logo: string;
    primary_color: string;
  };
  storeSettings: any;
  currencies: any[];
  shippingMethods: any[];
  isLoggedIn: boolean;
  customer: any;
}

export default function FunnelPage({
  funnel, product, store, storeSettings, currencies, shippingMethods, isLoggedIn, customer
}: Props) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // Track view
  useEffect(() => {
    fetch(route('store.funnel.track-view', { storeSlug: store.slug, funnelId: funnel.id }), {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' },
    }).catch(() => {});
  }, []);

  const hasInlineForm = funnel.blocks.some(b => b.type === 'order_form');

  // Handle CTA click: scroll to the inline order form when the page has one,
  // otherwise fall back to the checkout popup.
  const handleCta = () => {
    // Track click
    fetch(route('store.funnel.track-click', { storeSlug: store.slug, funnelId: funnel.id }), {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' },
    }).catch(() => {});

    const form = document.getElementById('commander');
    if (hasInlineForm && form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setShowCheckout(true);
  };

  const handleOrderSuccess = (orderNumber: string) => {
    // Track conversion
    fetch(route('store.funnel.track-order', { storeSlug: store.slug, funnelId: funnel.id }), {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' },
    }).catch(() => {});
  };

  const bgColor = funnel.settings?.bg_color || '#ffffff';
  const maxWidth = funnel.settings?.max_width || '800px';

  return (
    <>
      <Head>
        <title>{funnel.seo_title || product.name}</title>
        {funnel.seo_description && <meta name="description" content={funnel.seo_description} />}
        {funnel.favicon && <link rel="icon" href={funnel.favicon} />}
        {funnel.custom_css && <style>{funnel.custom_css}</style>}
      </Head>

      <div style={{ backgroundColor: bgColor, minHeight: '100vh', paddingBottom: hasInlineForm ? '4.5rem' : 0 }}>
        <div style={{ maxWidth, margin: '0 auto' }}>
          {funnel.blocks.map((block) => (
            <div key={block.id} onClick={() => {
              // Any CTA block type triggers checkout
              if (['cta_button', 'hero', 'product_showcase', 'price_table'].includes(block.type)) {
                // Only open if click is on a button element
              }
            }}>
              {/* Intercept CTA clicks within blocks */}
              <BlockWithCtaHandler
                block={block}
                product={product}
                onCtaClick={handleCta}
                orderContext={{
                  store, storeSettings, shippingMethods, customer,
                  funnelId: funnel.id, onSuccess: handleOrderSuccess,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {hasInlineForm && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 backdrop-blur border-t border-slate-200 sm:hidden">
          <button
            type="button"
            onClick={handleCta}
            className="w-full h-12 rounded-xl text-white font-extrabold tracking-wide"
            style={{ backgroundColor: funnel.blocks.find(b => b.type === 'order_form')?.settings?.button_color || '#16a34a' }}
          >
            {funnel.blocks.find(b => b.type === 'order_form')?.settings?.button_text || 'COMMANDER'}
          </button>
        </div>
      )}

      {/* Checkout Popup */}
      {showCheckout && (
        <FunnelCheckoutPopup
          product={product}
          store={store}
          storeSettings={storeSettings}
          currencies={currencies}
          shippingMethods={shippingMethods}
          isLoggedIn={isLoggedIn}
          customer={customer}
          funnelId={funnel.id}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleOrderSuccess}
        />
      )}
    </>
  );
}

// ─── Block wrapper that intercepts CTA button clicks ─────────────────────────

function BlockWithCtaHandler({ block, product, onCtaClick, orderContext }: {
  block: { type: string; settings: Record<string, any> };
  product: any;
  onCtaClick: () => void;
  orderContext: any;
}) {
  return (
    <div className="funnel-block-wrapper" onClick={(e) => {
      // If click target is a button element inside this block, trigger CTA
      const target = e.target as HTMLElement;
      if (block.type === 'order_form') return; // the inline form handles its own buttons
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        e.preventDefault();
        onCtaClick();
      }
    }}>
      <FunnelBlockPreview block={block as any} product={product} isMobile={false} orderContext={orderContext} />
    </div>
  );
}

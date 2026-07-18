import React from 'react';
import { getImageUrl } from '@/utils/image-helper';

interface Block {
  type: string;
  settings: Record<string, any>;
  is_visible: boolean;
}

interface Props {
  block: Block;
  product: any;
  isMobile?: boolean;
}

export default function FunnelBlockPreview({ block, product, isMobile }: Props) {
  const s = block.settings || {};

  switch (block.type) {
    case 'hero':
      return (
        <div style={{ backgroundColor: s.bg_color || '#1a1a2e', padding: s.padding === 'large' ? '4rem 2rem' : '2rem' }}>
          <div className={`flex items-center gap-6 ${s.image_position === 'right' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: s.text_color || '#fff' }}>
                {s.headline || 'Votre titre ici'}
              </h1>
              <p className="text-sm mb-4 opacity-80" style={{ color: s.text_color || '#fff' }}>
                {s.subheadline || 'Sous-titre ici'}
              </p>
              <button
                className="px-5 py-2.5 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: s.cta_color || '#e94560', color: s.cta_text_color || '#fff' }}
              >
                {s.cta_text || 'Commander maintenant'}
              </button>
            </div>
            {s.show_image !== false && product?.cover_image && (
              <div className="flex-shrink-0 w-32 h-32">
                <img src={getImageUrl(product.cover_image)} alt={product?.name} className="w-full h-full object-cover rounded-xl" />
              </div>
            )}
          </div>
        </div>
      );

    case 'product_showcase':
      return (
        <div style={{ backgroundColor: s.bg_color || '#fff', padding: '2rem' }}>
          <div className={`flex gap-6 items-start ${s.layout === 'image-right' ? 'flex-row-reverse' : 'flex-row'}`}>
            {product?.cover_image && (
              <div className="flex-shrink-0 w-40">
                <img src={getImageUrl(product.cover_image)} alt={product?.name} className="w-full rounded-xl shadow-md" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-800 mb-1">{product?.name || 'Nom du produit'}</h2>
              <div className="flex items-center gap-2 mb-3">
                {product?.sale_price ? (
                  <>
                    <span className="text-xl font-bold" style={{ color: s.cta_color || '#e94560' }}>{product.sale_price}</span>
                    <span className="text-sm text-slate-400 line-through">{product.price}</span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-slate-800">{product?.price}</span>
                )}
              </div>
              <button
                className="w-full py-2.5 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: s.cta_color || '#e94560', color: '#fff' }}
              >
                {s.cta_text || 'Ajouter au panier'}
              </button>
            </div>
          </div>
        </div>
      );

    case 'benefits':
      return (
        <div style={{ backgroundColor: s.bg_color || '#f8fafc', padding: '2rem' }}>
          {s.title && <h2 className="text-lg font-bold text-slate-800 text-center mb-4">{s.title}</h2>}
          <div className="space-y-3">
            {(s.items || []).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'testimonials':
      return (
        <div style={{ backgroundColor: s.bg_color || '#fff', padding: '2rem' }}>
          {s.title && <h2 className="text-lg font-bold text-slate-800 text-center mb-4">{s.title}</h2>}
          <div className="space-y-3">
            {(s.items || []).map((item: any, i: number) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex gap-0.5 mb-1">
                  {[...Array(item.rating || 5)].map((_, j) => (
                    <svg key={j} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mb-2">"{item.text}"</p>
                <p className="text-xs font-semibold text-slate-500">— {item.name}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'countdown':
      return (
        <div style={{ backgroundColor: s.bg_color || '#e94560', padding: '2rem', textAlign: 'center' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: s.text_color || '#fff' }}>
            {s.title || 'Offre limitée — se termine dans :'}
          </p>
          <div className="flex justify-center gap-3">
            {['24', '00', '00'].map((val, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-black/20 flex items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: s.text_color || '#fff' }}>{val}</span>
                </div>
                <p className="text-[10px] mt-1 opacity-70" style={{ color: s.text_color || '#fff' }}>
                  {['Heures', 'Min', 'Sec'][i]}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'video':
      return (
        <div style={{ backgroundColor: s.bg_color || '#000', padding: '1rem' }}>
          {s.url ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={s.url.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-slate-800 flex items-center justify-center">
              <svg className="w-12 h-12 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      );

    case 'text_block':
      return (
        <div
          style={{ backgroundColor: s.bg_color || '#fff', color: s.text_color || '#1a1a1a', padding: '2rem', textAlign: s.text_align as any || 'left' }}
          dangerouslySetInnerHTML={{ __html: s.content || '<h2>Votre titre ici</h2><p>Votre texte...</p>' }}
          className="prose prose-sm max-w-none"
        />
      );

    case 'image_block':
      return (
        <div style={{ backgroundColor: s.bg_color || '#fff', padding: s.width === 'full' ? '0' : '1rem' }}>
          {s.image ? (
            <img src={getImageUrl(s.image)} alt={s.alt || ''} className="w-full object-cover" />
          ) : (
            <div className="h-32 bg-slate-100 flex items-center justify-center rounded-xl">
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      );

    case 'faq':
      return (
        <div style={{ backgroundColor: s.bg_color || '#f8fafc', padding: '2rem' }}>
          {s.title && <h2 className="text-lg font-bold text-slate-800 mb-4">{s.title}</h2>}
          <div className="space-y-2">
            {(s.items || []).map((item: any, i: number) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 px-4 py-3">
                <p className="font-semibold text-sm text-slate-800">{item.question}</p>
                <p className="text-xs text-slate-500 mt-1">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'trust_badges':
      return (
        <div style={{ backgroundColor: s.bg_color || '#fff', padding: '1.5rem' }}>
          <div className="flex flex-wrap justify-center gap-4">
            {(s.items || []).map((item: any, i: number) => (
              <div key={i} className="flex flex-col items-center gap-1 text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'guarantee':
      return (
        <div style={{ backgroundColor: s.bg_color || '#f0fdf4', padding: '2rem', borderLeft: `4px solid ${s.border_color || '#86efac'}` }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.border_color || '#86efac' }}>
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base mb-0.5" style={{ color: s.text_color || '#166534' }}>{s.title}</h3>
              <p className="text-sm opacity-80" style={{ color: s.text_color || '#166534' }}>{s.description}</p>
            </div>
          </div>
        </div>
      );

    case 'price_table':
      return (
        <div style={{ backgroundColor: s.bg_color || '#fff', padding: '2rem', textAlign: 'center' }}>
          {s.label && <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{s.label}</p>}
          <div className="flex items-center justify-center gap-3 mb-4">
            {s.original_price && (
              <span className="text-2xl text-slate-400 line-through">{s.original_price} {s.currency_symbol}</span>
            )}
            <span className="text-4xl font-bold text-slate-900">{s.sale_price || '---'} <span className="text-lg">{s.currency_symbol}</span></span>
          </div>
          <button
            className="px-8 py-3 rounded-xl font-bold text-base"
            style={{ backgroundColor: s.cta_color || '#e94560', color: '#fff' }}
          >
            {s.cta_text || "Profiter de l'offre"}
          </button>
        </div>
      );

    case 'cta_button':
      return (
        <div style={{ backgroundColor: s.bg_color || '#fff', padding: s.padding === 'large' ? '2.5rem 2rem' : '1.5rem 2rem', textAlign: 'center' }}>
          <button
            className={`font-bold ${s.size === 'large' ? 'text-lg py-4 px-10' : 'text-base py-3 px-8'} ${s.width === 'full' ? 'w-full' : ''} rounded-xl`}
            style={{ backgroundColor: s.color || '#e94560', color: s.text_color || '#fff' }}
          >
            {s.text || 'Commander maintenant'}
          </button>
          {s.subtext && <p className="text-xs text-slate-400 mt-2">{s.subtext}</p>}
        </div>
      );

    case 'spacer':
      return (
        <div style={{ height: `${s.height || 60}px`, backgroundColor: s.bg_color || '#fff' }} />
      );

    case 'divider':
      return (
        <div style={{ backgroundColor: s.bg_color || '#fff', padding: s.margin === 'medium' ? '1rem 2rem' : '0.5rem 2rem' }}>
          <hr style={{ borderColor: s.color || '#e2e8f0', borderWidth: `${s.thickness || 1}px`, borderStyle: s.style || 'solid' }} />
        </div>
      );

    default:
      return (
        <div className="p-6 bg-slate-100 text-center text-sm text-slate-400">
          Block: {block.type}
        </div>
      );
  }
}

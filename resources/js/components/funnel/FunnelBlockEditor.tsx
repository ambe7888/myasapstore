import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import MediaLibraryButton from '@/components/MediaLibraryButton';
import { getImageUrl } from '@/utils/image-helper';

interface Block {
  type: string;
  settings: Record<string, any>;
}

interface Props {
  block: Block;
  product: any;
  onChange: (settings: Record<string, any>) => void;
}

// ─── Reusable field helpers ───────────────────────────────────────────────────

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-slate-600">{label}</Label>
    {children}
  </div>
);

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <Field label={label}>
    <div className="flex gap-2 items-center">
      <input type="color" className="w-8 h-8 rounded cursor-pointer border-0" value={value || '#ffffff'} onChange={e => onChange(e.target.value)} />
      <Input className="h-8 text-xs font-mono flex-1" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#ffffff" />
    </div>
  </Field>
);

const TextareaField = ({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) => (
  <Field label={label}>
    <textarea
      rows={rows}
      className="w-full text-xs rounded-md border border-slate-200 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-200"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
    />
  </Field>
);

// ─── Main Editor ─────────────────────────────────────────────────────────────

export default function FunnelBlockEditor({ block, product, onChange }: Props) {
  const { t } = useTranslation();
  const s = block.settings || {};

  const set = (key: string, value: any) => onChange({ ...s, [key]: value });
  const setArr = (key: string, arr: any[]) => onChange({ ...s, [key]: arr });

  // ─── Hero ──────────────────────────────────────────────────────────────────
  if (block.type === 'hero') return (
    <div className="p-4 space-y-4">
      <Field label={t('Headline')}>
        <Input className="h-8 text-xs" value={s.headline || ''} onChange={e => set('headline', e.target.value)} />
      </Field>
      <TextareaField label={t('Sub-headline')} value={s.subheadline || ''} onChange={v => set('subheadline', v)} rows={2} />
      <Field label={t('CTA Button Text')}>
        <Input className="h-8 text-xs" value={s.cta_text || ''} onChange={e => set('cta_text', e.target.value)} />
      </Field>
      <ColorField label={t('CTA Color')} value={s.cta_color} onChange={v => set('cta_color', v)} />
      <ColorField label={t('Background Color')} value={s.bg_color} onChange={v => set('bg_color', v)} />
      <ColorField label={t('Text Color')} value={s.text_color} onChange={v => set('text_color', v)} />
      <Field label={t('Image Position')}>
        <select className="w-full h-8 text-xs rounded-md border border-slate-200 px-2" value={s.image_position || 'right'} onChange={e => set('image_position', e.target.value)}>
          <option value="right">{t('Right')}</option>
          <option value="left">{t('Left')}</option>
        </select>
      </Field>
      <Field label={t('Padding')}>
        <select className="w-full h-8 text-xs rounded-md border border-slate-200 px-2" value={s.padding || 'large'} onChange={e => set('padding', e.target.value)}>
          <option value="small">{t('Small')}</option>
          <option value="medium">{t('Medium')}</option>
          <option value="large">{t('Large')}</option>
        </select>
      </Field>
    </div>
  );

  // ─── Product Showcase ──────────────────────────────────────────────────────
  if (block.type === 'product_showcase') return (
    <div className="p-4 space-y-4">
      <Field label={t('CTA Button Text')}>
        <Input className="h-8 text-xs" value={s.cta_text || ''} onChange={e => set('cta_text', e.target.value)} />
      </Field>
      <ColorField label={t('Button Color')} value={s.cta_color} onChange={v => set('cta_color', v)} />
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
      <Field label={t('Layout')}>
        <select className="w-full h-8 text-xs rounded-md border border-slate-200 px-2" value={s.layout || 'image-left'} onChange={e => set('layout', e.target.value)}>
          <option value="image-left">{t('Image Left')}</option>
          <option value="image-right">{t('Image Right')}</option>
        </select>
      </Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="show_price" checked={s.show_price !== false} onChange={e => set('show_price', e.target.checked)} />
        <label htmlFor="show_price" className="text-xs">{t('Show Price')}</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="show_stock" checked={s.show_stock !== false} onChange={e => set('show_stock', e.target.checked)} />
        <label htmlFor="show_stock" className="text-xs">{t('Show Stock')}</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="show_variants" checked={s.show_variants !== false} onChange={e => set('show_variants', e.target.checked)} />
        <label htmlFor="show_variants" className="text-xs">{t('Show Variants')}</label>
      </div>
    </div>
  );

  // ─── Benefits ─────────────────────────────────────────────────────────────
  if (block.type === 'benefits') return (
    <div className="p-4 space-y-4">
      <Field label={t('Section Title')}>
        <Input className="h-8 text-xs" value={s.title || ''} onChange={e => set('title', e.target.value)} />
      </Field>
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
      <div>
        <Label className="text-xs text-slate-600 mb-2 block">{t('Items')}</Label>
        <div className="space-y-3">
          {(s.items || []).map((item: any, i: number) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">{t('Item')} {i + 1}</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                  const newItems = (s.items || []).filter((_: any, j: number) => j !== i);
                  setArr('items', newItems);
                }}>
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              </div>
              <Input className="h-7 text-xs" placeholder={t('Title')} value={item.title || ''} onChange={e => {
                const newItems = [...(s.items || [])];
                newItems[i] = { ...item, title: e.target.value };
                setArr('items', newItems);
              }} />
              <Input className="h-7 text-xs" placeholder={t('Description')} value={item.description || ''} onChange={e => {
                const newItems = [...(s.items || [])];
                newItems[i] = { ...item, description: e.target.value };
                setArr('items', newItems);
              }} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" onClick={() => {
            const newItems = [...(s.items || []), { icon: 'check', title: '', description: '' }];
            setArr('items', newItems);
          }}>
            <Plus className="h-3.5 w-3.5" /> {t('Add Item')}
          </Button>
        </div>
      </div>
    </div>
  );

  // ─── Testimonials ─────────────────────────────────────────────────────────
  if (block.type === 'testimonials') return (
    <div className="p-4 space-y-4">
      <Field label={t('Section Title')}>
        <Input className="h-8 text-xs" value={s.title || ''} onChange={e => set('title', e.target.value)} />
      </Field>
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
      <div>
        <Label className="text-xs text-slate-600 mb-2 block">{t('Testimonials')}</Label>
        <div className="space-y-3">
          {(s.items || []).map((item: any, i: number) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">{t('Review')} {i + 1}</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                  const newItems = (s.items || []).filter((_: any, j: number) => j !== i);
                  setArr('items', newItems);
                }}>
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              </div>
              <Input className="h-7 text-xs" placeholder={t('Name')} value={item.name || ''} onChange={e => {
                const newItems = [...(s.items || [])];
                newItems[i] = { ...item, name: e.target.value };
                setArr('items', newItems);
              }} />
              <textarea rows={2} className="w-full text-xs rounded border border-slate-200 p-2" placeholder={t('Review text')} value={item.text || ''} onChange={e => {
                const newItems = [...(s.items || [])];
                newItems[i] = { ...item, text: e.target.value };
                setArr('items', newItems);
              }} />
              <Field label={t('Rating')}>
                <select className="w-full h-7 text-xs rounded border border-slate-200 px-2" value={item.rating || 5} onChange={e => {
                  const newItems = [...(s.items || [])];
                  newItems[i] = { ...item, rating: Number(e.target.value) };
                  setArr('items', newItems);
                }}>
                  {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} ★</option>)}
                </select>
              </Field>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" onClick={() => {
            setArr('items', [...(s.items || []), { name: '', text: '', rating: 5 }]);
          }}>
            <Plus className="h-3.5 w-3.5" /> {t('Add Testimonial')}
          </Button>
        </div>
      </div>
    </div>
  );

  // ─── Countdown ────────────────────────────────────────────────────────────
  if (block.type === 'countdown') return (
    <div className="p-4 space-y-4">
      <Field label={t('Title')}>
        <Input className="h-8 text-xs" value={s.title || ''} onChange={e => set('title', e.target.value)} />
      </Field>
      <Field label={t('Mode')}>
        <select className="w-full h-8 text-xs rounded-md border border-slate-200 px-2" value={s.mode || 'duration'} onChange={e => set('mode', e.target.value)}>
          <option value="duration">{t('Duration (hours)')}</option>
          <option value="fixed_date">{t('Fixed Date')}</option>
        </select>
      </Field>
      {s.mode === 'fixed_date' ? (
        <Field label={t('End Date & Time')}>
          <Input className="h-8 text-xs" type="datetime-local" value={s.end_date || ''} onChange={e => set('end_date', e.target.value)} />
        </Field>
      ) : (
        <Field label={t('Duration (hours)')}>
          <Input className="h-8 text-xs" type="number" value={s.duration_hours || 24} onChange={e => set('duration_hours', Number(e.target.value))} />
        </Field>
      )}
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
      <ColorField label={t('Text Color')} value={s.text_color} onChange={v => set('text_color', v)} />
    </div>
  );

  // ─── Video ────────────────────────────────────────────────────────────────
  if (block.type === 'video') return (
    <div className="p-4 space-y-4">
      <Field label={t('YouTube / Vimeo URL')}>
        <Input className="h-8 text-xs" placeholder="https://youtube.com/watch?v=..." value={s.url || ''} onChange={e => set('url', e.target.value)} />
      </Field>
      <Field label={t('Title (optional)')}>
        <Input className="h-8 text-xs" value={s.title || ''} onChange={e => set('title', e.target.value)} />
      </Field>
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
    </div>
  );

  // ─── Text Block ───────────────────────────────────────────────────────────
  if (block.type === 'text_block') return (
    <div className="p-4 space-y-4">
      <TextareaField label={t('Content (HTML)')} value={s.content || ''} onChange={v => set('content', v)} rows={8} />
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
      <ColorField label={t('Text Color')} value={s.text_color} onChange={v => set('text_color', v)} />
      <Field label={t('Text Align')}>
        <select className="w-full h-8 text-xs rounded-md border border-slate-200 px-2" value={s.text_align || 'left'} onChange={e => set('text_align', e.target.value)}>
          <option value="left">{t('Left')}</option>
          <option value="center">{t('Center')}</option>
          <option value="right">{t('Right')}</option>
        </select>
      </Field>
    </div>
  );

  // ─── Image Block ──────────────────────────────────────────────────────────
  if (block.type === 'image_block') return (
    <div className="p-4 space-y-4">
      <Field label={t('Image')}>
        <div className="flex gap-2 items-center">
          <MediaLibraryButton
            value={s.image || ''}
            onSelect={(url) => set('image', url)}
            label={t('Choose Image')}
          />
          {s.image && (
            <img src={getImageUrl(s.image)} alt="" className="w-12 h-12 object-cover rounded border" />
          )}
        </div>
      </Field>
      <Field label={t('Alt Text')}>
        <Input className="h-8 text-xs" value={s.alt || ''} onChange={e => set('alt', e.target.value)} />
      </Field>
      <Field label={t('Width')}>
        <select className="w-full h-8 text-xs rounded-md border border-slate-200 px-2" value={s.width || 'full'} onChange={e => set('width', e.target.value)}>
          <option value="full">{t('Full Width')}</option>
          <option value="contained">{t('Contained')}</option>
        </select>
      </Field>
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
    </div>
  );

  // ─── FAQ ──────────────────────────────────────────────────────────────────
  if (block.type === 'faq') return (
    <div className="p-4 space-y-4">
      <Field label={t('Section Title')}>
        <Input className="h-8 text-xs" value={s.title || ''} onChange={e => set('title', e.target.value)} />
      </Field>
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
      <div>
        <Label className="text-xs text-slate-600 mb-2 block">{t('FAQ Items')}</Label>
        <div className="space-y-3">
          {(s.items || []).map((item: any, i: number) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Q{i + 1}</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                  setArr('items', (s.items || []).filter((_: any, j: number) => j !== i));
                }}>
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              </div>
              <Input className="h-7 text-xs" placeholder={t('Question')} value={item.question || ''} onChange={e => {
                const newItems = [...(s.items || [])];
                newItems[i] = { ...item, question: e.target.value };
                setArr('items', newItems);
              }} />
              <textarea rows={2} className="w-full text-xs rounded border border-slate-200 p-2" placeholder={t('Answer')} value={item.answer || ''} onChange={e => {
                const newItems = [...(s.items || [])];
                newItems[i] = { ...item, answer: e.target.value };
                setArr('items', newItems);
              }} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" onClick={() => {
            setArr('items', [...(s.items || []), { question: '', answer: '' }]);
          }}>
            <Plus className="h-3.5 w-3.5" /> {t('Add Question')}
          </Button>
        </div>
      </div>
    </div>
  );

  // ─── Trust Badges ─────────────────────────────────────────────────────────
  if (block.type === 'trust_badges') return (
    <div className="p-4 space-y-4">
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
      <div>
        <Label className="text-xs text-slate-600 mb-2 block">{t('Badges')}</Label>
        <div className="space-y-2">
          {(s.items || []).map((item: any, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <Input className="h-7 text-xs flex-1" placeholder={t('Label')} value={item.label || ''} onChange={e => {
                const newItems = [...(s.items || [])];
                newItems[i] = { ...item, label: e.target.value };
                setArr('items', newItems);
              }} />
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                setArr('items', (s.items || []).filter((_: any, j: number) => j !== i));
              }}>
                <Trash2 className="h-3 w-3 text-red-400" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" onClick={() => {
            setArr('items', [...(s.items || []), { icon: 'shield', label: '' }]);
          }}>
            <Plus className="h-3.5 w-3.5" /> {t('Add Badge')}
          </Button>
        </div>
      </div>
    </div>
  );

  // ─── Guarantee ────────────────────────────────────────────────────────────
  if (block.type === 'guarantee') return (
    <div className="p-4 space-y-4">
      <Field label={t('Title')}>
        <Input className="h-8 text-xs" value={s.title || ''} onChange={e => set('title', e.target.value)} />
      </Field>
      <TextareaField label={t('Description')} value={s.description || ''} onChange={v => set('description', v)} />
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
      <ColorField label={t('Text Color')} value={s.text_color} onChange={v => set('text_color', v)} />
      <ColorField label={t('Border Color')} value={s.border_color} onChange={v => set('border_color', v)} />
    </div>
  );

  // ─── Price Table ──────────────────────────────────────────────────────────
  if (block.type === 'price_table') return (
    <div className="p-4 space-y-4">
      <Field label={t('Label')}>
        <Input className="h-8 text-xs" value={s.label || ''} onChange={e => set('label', e.target.value)} />
      </Field>
      <Field label={t('Original Price (crossed out)')}>
        <Input className="h-8 text-xs" value={s.original_price || ''} onChange={e => set('original_price', e.target.value)} />
      </Field>
      <Field label={t('Sale Price')}>
        <Input className="h-8 text-xs" value={s.sale_price || ''} onChange={e => set('sale_price', e.target.value)} />
      </Field>
      <Field label={t('Currency Symbol')}>
        <Input className="h-8 text-xs" value={s.currency_symbol || 'MAD'} onChange={e => set('currency_symbol', e.target.value)} />
      </Field>
      <Field label={t('CTA Text')}>
        <Input className="h-8 text-xs" value={s.cta_text || ''} onChange={e => set('cta_text', e.target.value)} />
      </Field>
      <ColorField label={t('Button Color')} value={s.cta_color} onChange={v => set('cta_color', v)} />
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
    </div>
  );

  // ─── CTA Button ───────────────────────────────────────────────────────────
  if (block.type === 'cta_button') return (
    <div className="p-4 space-y-4">
      <Field label={t('Button Text')}>
        <Input className="h-8 text-xs" value={s.text || ''} onChange={e => set('text', e.target.value)} />
      </Field>
      <Field label={t('Sub-text (below button)')}>
        <Input className="h-8 text-xs" value={s.subtext || ''} onChange={e => set('subtext', e.target.value)} placeholder={t('e.g. Secure payment · Free shipping')} />
      </Field>
      <ColorField label={t('Button Color')} value={s.color} onChange={v => set('color', v)} />
      <ColorField label={t('Text Color')} value={s.text_color} onChange={v => set('text_color', v)} />
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
      <Field label={t('Button Size')}>
        <select className="w-full h-8 text-xs rounded-md border border-slate-200 px-2" value={s.size || 'large'} onChange={e => set('size', e.target.value)}>
          <option value="medium">{t('Medium')}</option>
          <option value="large">{t('Large')}</option>
        </select>
      </Field>
      <Field label={t('Width')}>
        <select className="w-full h-8 text-xs rounded-md border border-slate-200 px-2" value={s.width || 'full'} onChange={e => set('width', e.target.value)}>
          <option value="full">{t('Full Width')}</option>
          <option value="auto">{t('Auto')}</option>
        </select>
      </Field>
    </div>
  );

  // ─── Spacer ───────────────────────────────────────────────────────────────
  if (block.type === 'spacer') return (
    <div className="p-4 space-y-4">
      <Field label={t('Height (px)')}>
        <Input className="h-8 text-xs" type="number" value={s.height || 60} onChange={e => set('height', Number(e.target.value))} />
      </Field>
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
    </div>
  );

  // ─── Divider ──────────────────────────────────────────────────────────────
  if (block.type === 'divider') return (
    <div className="p-4 space-y-4">
      <Field label={t('Style')}>
        <select className="w-full h-8 text-xs rounded-md border border-slate-200 px-2" value={s.style || 'solid'} onChange={e => set('style', e.target.value)}>
          <option value="solid">{t('Solid')}</option>
          <option value="dashed">{t('Dashed')}</option>
          <option value="dotted">{t('Dotted')}</option>
        </select>
      </Field>
      <ColorField label={t('Line Color')} value={s.color} onChange={v => set('color', v)} />
      <ColorField label={t('Background')} value={s.bg_color} onChange={v => set('bg_color', v)} />
      <Field label={t('Thickness (px)')}>
        <Input className="h-8 text-xs" type="number" min={1} max={10} value={s.thickness || 1} onChange={e => set('thickness', Number(e.target.value))} />
      </Field>
    </div>
  );

  return (
    <div className="p-4 text-sm text-slate-400">{block.type} — no editor defined</div>
  );
}

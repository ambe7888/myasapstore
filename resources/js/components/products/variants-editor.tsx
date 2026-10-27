import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { History, ImageIcon, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { VARIANT_PRESETS, findPresetForName } from '@/data/variant-presets';
import MediaLibraryModal from '@/components/MediaLibraryModal';
import { getImageUrl } from '@/utils/image-helper';

export interface ProductVariant {
  name: string;
  values: string[];
  images?: Record<string, string>;
}

interface VariantsEditorProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

// Variants saved by older versions or imports can have missing/odd fields
// (numeric values, `images: []` from PHP, ...) — normalize before rendering.
function normalizeVariants(raw: any): ProductVariant[] {
  if (!Array.isArray(raw)) return [{ name: '', values: [''] }];
  return raw.map((variant: any) => {
    const rawValues = Array.isArray(variant?.values) ? variant.values : variant?.values != null ? [variant.values] : [];
    const values = rawValues.map((value: any) => String(value ?? ''));
    const images =
      variant?.images && typeof variant.images === 'object' && !Array.isArray(variant.images) ? variant.images : {};
    return { name: String(variant?.name ?? ''), values: values.length > 0 ? values : [''], images };
  });
}

interface ExistingVariant extends ProductVariant {
  count?: number;
}

const normalizeName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const isBlank = (variant: ProductVariant) =>
  variant.name.trim() === '' && variant.values.every((value) => value.trim() === '') && Object.keys(variant.images || {}).length === 0;

export default function VariantsEditor({ variants: rawVariants, onChange }: VariantsEditorProps) {
  const { t } = useTranslation();
  const variants = normalizeVariants(rawVariants);
  const { existingVariants = [] } = usePage().props as { existingVariants?: ExistingVariant[] };
  const [picker, setPicker] = useState<{ variantIndex: number; valueIndex: number } | null>(null);

  const update = (variantIndex: number, patch: (variant: ProductVariant) => ProductVariant) => {
    onChange(variants.map((variant, i) => (i === variantIndex ? patch({ ...variant, values: [...variant.values], images: { ...(variant.images || {}) } }) : variant)));
  };

  const setValue = (variantIndex: number, valueIndex: number, newValue: string) =>
    update(variantIndex, (variant) => {
      const oldValue = variant.values[valueIndex];
      variant.values[valueIndex] = newValue;
      if (oldValue !== newValue && variant.images && oldValue in variant.images) {
        variant.images[newValue] = variant.images[oldValue];
        delete variant.images[oldValue];
      }
      return variant;
    });

  const removeValue = (variantIndex: number, valueIndex: number) =>
    update(variantIndex, (variant) => {
      const [removed] = variant.values.splice(valueIndex, 1);
      if (variant.images) delete variant.images[removed];
      if (variant.values.length === 0) variant.values.push('');
      return variant;
    });

  const setImage = (variantIndex: number, valueIndex: number, url: string) =>
    update(variantIndex, (variant) => {
      const value = variant.values[valueIndex];
      if (!value.trim()) return variant;
      variant.images = { ...(variant.images || {}) };
      if (url) variant.images[value] = url;
      else delete variant.images[value];
      return variant;
    });

  const addVariant = (variant: ProductVariant) => {
    onChange([...variants.filter((item) => !isBlank(item)), variant]);
  };

  const usedNames = variants.map((variant) => normalizeName(variant.name)).filter(Boolean);
  const availablePresets = VARIANT_PRESETS.filter((preset) => !usedNames.includes(normalizeName(preset.name)));
  const reusable = (existingVariants || []).filter(
    (existing) =>
      !variants.some(
        (variant) =>
          normalizeName(variant.name) === normalizeName(existing.name) &&
          JSON.stringify(variant.values.filter(Boolean)) === JSON.stringify((existing.values || []).filter(Boolean))
      )
  );

  const addSuggestedValues = (variantIndex: number, values: string[]) =>
    update(variantIndex, (variant) => {
      const current = variant.values.filter((value) => value.trim() !== '');
      const merged = [...current, ...values.filter((value) => !current.includes(value))];
      variant.values = merged.length > 0 ? merged : [''];
      return variant;
    });

  const toggleSuggestedValue = (variantIndex: number, value: string) =>
    update(variantIndex, (variant) => {
      const current = variant.values.filter((item) => item.trim() !== '');
      if (current.includes(value)) {
        const next = current.filter((item) => item !== value);
        if (variant.images) delete variant.images[value];
        variant.values = next.length > 0 ? next : [''];
      } else {
        variant.values = [...current, value];
      }
      return variant;
    });

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-lg border border-dashed bg-muted/20 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            {t('Ajout rapide')} :
          </span>
          {availablePresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => addVariant({ name: preset.name, values: [''], images: {} })}
              className="rounded-full border bg-background px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary"
            >
              + {preset.name}
            </button>
          ))}
        </div>

        {reusable.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <History className="h-3.5 w-3.5" />
                {t("Réutiliser les variantes d'autres produits")} ({reusable.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[min(28rem,90vw)] p-2">
              <p className="px-2 pb-2 text-xs text-muted-foreground">
                {t('Cliquez pour ajouter la variante telle quelle, vous pourrez ensuite la modifier.')}
              </p>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {reusable.map((existing, index) => (
                  <button
                    key={`${existing.name}-${index}`}
                    type="button"
                    onClick={() =>
                      addVariant({
                        name: existing.name,
                        values: (existing.values || []).map(String),
                        images: existing.images && !Array.isArray(existing.images) ? { ...existing.images } : {},
                      })
                    }
                    className="w-full rounded-md px-2 py-2 text-left hover:bg-muted"
                  >
                    <span className="text-sm font-medium">{existing.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {(existing.values || []).join(', ')}
                      {existing.count ? ` · ${existing.count} ${existing.count > 1 ? t('produits') : t('produit')}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {variants.map((variant, variantIndex) => (
        <div key={variantIndex} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Input
              placeholder={t('Variant name (e.g., Color, Size)')}
              value={variant.name}
              onChange={(e) => update(variantIndex, (v) => ({ ...v, name: e.target.value }))}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(variants.filter((_, i) => i !== variantIndex))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {(() => {
            const preset = findPresetForName(variant.name);
            if (!preset) return null;
            const selectedValues = variant.values.filter((value) => value.trim() !== '');
            const missing = preset.values.filter((value) => !selectedValues.includes(value));
            return (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{t('Suggestions')} :</span>
                {preset.values.map((value) => {
                  const active = selectedValues.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleSuggestedValue(variantIndex, value)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        active ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:border-primary'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
                {missing.length > 0 && (
                  <button
                    type="button"
                    onClick={() => addSuggestedValues(variantIndex, preset.values)}
                    className="rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    {t('Tout ajouter')}
                  </button>
                )}
              </div>
            );
          })()}

          <div className="space-y-2">
            {variant.values.map((value, valueIndex) => {
              const image = variant.images?.[value];
              return (
                <div key={valueIndex} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => value.trim() && setPicker({ variantIndex, valueIndex })}
                    disabled={!value.trim()}
                    title={value.trim() ? t('Image de cette variante') : t("Saisissez d'abord la valeur")}
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30 text-muted-foreground hover:border-primary disabled:opacity-40"
                  >
                    {image ? (
                      <img src={getImageUrl(image)} alt={value} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                  </button>
                  <Input
                    placeholder={t('Variant value')}
                    value={value}
                    onChange={(e) => setValue(variantIndex, valueIndex, e.target.value)}
                  />
                  {image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title={t("Retirer l'image")}
                      onClick={() => setImage(variantIndex, valueIndex, '')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => update(variantIndex, (v) => ({ ...v, values: [...v.values, ''] }))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {variant.values.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeValue(variantIndex, valueIndex)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <MediaLibraryModal
        isOpen={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={(url) => {
          if (picker) {
            const relative = url.startsWith('/storage') ? url : (url.match(/\/storage\/.*$/)?.[0] ?? url);
            setImage(picker.variantIndex, picker.valueIndex, relative);
          }
          setPicker(null);
        }}
      />
    </div>
  );
}

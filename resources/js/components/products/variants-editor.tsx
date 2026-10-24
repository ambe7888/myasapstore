import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageIcon, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function VariantsEditor({ variants, onChange }: VariantsEditorProps) {
  const { t } = useTranslation();
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

  return (
    <div className="space-y-4">
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

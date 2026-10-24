interface RawVariant {
  name?: string;
  values?: any[];
  images?: Record<string, string>;
}

function parseVariants(variants: any): RawVariant[] {
  if (!variants) return [];
  let parsed = variants;
  if (typeof variants === 'string') {
    try {
      parsed = JSON.parse(variants);
    } catch {
      return [];
    }
  }
  return Array.isArray(parsed) ? parsed : [];
}

/** Appends every variant-value image that isn't already part of the gallery. */
export function appendVariantImages<T extends string>(images: T[], variants: any): string[] {
  const result: string[] = [...images];
  for (const variant of parseVariants(variants)) {
    for (const url of Object.values(variant.images || {})) {
      if (url && !result.includes(url)) result.push(url);
    }
  }
  return result;
}

/** Image attached to a variant value (variant identified by name or list index). */
export function getVariantImage(variants: any, variantNameOrIndex: string | number, value: any): string | null {
  const list = parseVariants(variants);
  const variant =
    list.find((v) => v.name === variantNameOrIndex) ??
    (typeof variantNameOrIndex === 'number' || /^\d+$/.test(String(variantNameOrIndex))
      ? list[Number(variantNameOrIndex)]
      : undefined);
  const url = variant?.images?.[String(value)];
  return url || null;
}

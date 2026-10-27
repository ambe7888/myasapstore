import { usePage } from '@inertiajs/react';

/** Products shown per homepage section: the seller's chosen rows x 4 columns. */
export function useHomeProductsLimit(): number {
  const { props } = usePage<any>();
  const rows = Number(props.store?.home_products_rows) || 2;
  return Math.max(1, Math.min(6, rows)) * 4;
}

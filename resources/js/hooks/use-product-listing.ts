import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

export interface ProductListingPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export type ProductListingMode = 'pagination' | 'infinite_scroll';

/**
 * Lets a store's product listing page support both classic pagination and
 * infinite scroll from a single store setting (`store.product_listing_mode`).
 *
 * In 'pagination' mode this is a pass-through: `items` always mirrors the
 * `products` prop the server sent for the current page.
 *
 * In 'infinite_scroll' mode, `loadMore` (auto-triggered via `sentinelRef`)
 * fetches the next page through an Inertia partial reload and appends it to
 * `items` instead of replacing it. Since that partial reload updates the same
 * `products`/`pagination` page props the component receives, we track whether
 * the incoming prop change came from our own `loadMore` call (append) or from
 * something else — a filter/sort/search change (replace, i.e. start over).
 */
export function useProductListing(
  products: any[],
  pagination: ProductListingPagination,
  mode: ProductListingMode,
  requestUrl: string
) {
  const [items, setItems] = useState<any[]>(products);
  const [loadingMore, setLoadingMore] = useState(false);
  const isAppendingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isAppendingRef.current) {
      isAppendingRef.current = false;
      setLoadingMore(false);
      setItems((prev) => {
        const seen = new Set(prev.map((p: any) => p.id));
        return [...prev, ...products.filter((p: any) => !seen.has(p.id))];
      });
    } else {
      setItems(products);
    }
  }, [products]);

  const hasMore = mode === 'infinite_scroll' && pagination.current_page < pagination.last_page;

  const loadMore = useCallback(() => {
    if (mode !== 'infinite_scroll' || loadingMore || !hasMore) return;

    const params = Object.fromEntries(new URLSearchParams(window.location.search));
    params.page = String(pagination.current_page + 1);

    isAppendingRef.current = true;
    setLoadingMore(true);

    router.get(requestUrl, params, {
      only: ['products', 'pagination'],
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onError: () => {
        isAppendingRef.current = false;
        setLoadingMore(false);
      },
    });
  }, [mode, loadingMore, hasMore, requestUrl, pagination.current_page]);

  useEffect(() => {
    if (mode !== 'infinite_scroll') return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [mode, loadMore]);

  return { items, loadingMore, hasMore, sentinelRef };
}

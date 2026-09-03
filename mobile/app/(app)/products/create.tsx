import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { createProduct, type ProductPayload } from '@/api/products';
import { getApiErrorMessage } from '@/api/client';
import { ProductForm } from '@/components/ProductForm';
import { useActiveStore } from '@/lib/active-store';

export default function CreateProductScreen() {
  const { activeStore } = useActiveStore();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: ProductPayload) => {
    if (!activeStore) return;
    setError(null);
    setLoading(true);
    try {
      await createProduct(activeStore.id, payload);
      queryClient.invalidateQueries({ queryKey: ['products', activeStore.id] });
      router.back();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return <ProductForm submitLabel="Créer le produit" loading={loading} error={error} onSubmit={handleSubmit} />;
}

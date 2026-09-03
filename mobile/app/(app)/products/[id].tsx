import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { getApiErrorMessage } from '@/api/client';
import { deleteProduct, fetchProduct, updateProduct, type ProductPayload } from '@/api/products';
import { Button } from '@/components/Button';
import { ProductForm } from '@/components/ProductForm';
import { useActiveStore } from '@/lib/active-store';
import { colors } from '@/theme';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const { activeStore } = useActiveStore();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['products', activeStore?.id] });
    queryClient.invalidateQueries({ queryKey: ['product', productId] });
  };

  const handleUpdate = async (payload: ProductPayload) => {
    setError(null);
    setSaving(true);
    try {
      await updateProduct(productId, payload);
      invalidate();
      router.back();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer ce produit ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteProduct(productId);
          invalidate();
          router.back();
        },
      },
    ]);
  };

  if (isLoading || !product) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProductForm initial={product} submitLabel="Enregistrer" loading={saving} error={error} onSubmit={handleUpdate} />
      <View style={styles.deleteContainer}>
        <Button title="Supprimer le produit" variant="danger" onPress={handleDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  deleteContainer: { paddingHorizontal: 20, paddingBottom: 30 },
});

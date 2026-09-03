import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { fetchProducts } from '@/api/products';
import type { Product } from '@/api/types';
import { useActiveStore } from '@/lib/active-store';
import { colors } from '@/theme';

export default function ProductsScreen() {
  const { activeStore } = useActiveStore();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['products', activeStore?.id],
    queryFn: () => fetchProducts(activeStore!.id),
    enabled: !!activeStore,
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.products ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>Aucun produit pour le moment.</Text> : null
        }
        renderItem={({ item }) => <ProductRow product={item} />}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/(app)/products/create')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

function ProductRow({ product }: { product: Product }) {
  return (
    <Pressable style={styles.row} onPress={() => router.push(`/(app)/products/${product.id}`)}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.rowMeta}>
          {product.price.toFixed(2)} · Stock: {product.stock}
        </Text>
      </View>
      <View style={[styles.badge, product.is_active ? styles.badgeActive : styles.badgeInactive]}>
        <Text style={styles.badgeText}>{product.is_active ? 'Actif' : 'Inactif'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 10 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  rowInfo: { flex: 1, marginRight: 10 },
  rowName: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowMeta: { fontSize: 13, color: colors.muted, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeActive: { backgroundColor: '#dcfce7' },
  badgeInactive: { backgroundColor: '#f1f5f9' },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.text },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});

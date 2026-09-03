import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchOrders } from '@/api/orders';
import type { OrderStatus, OrderSummary } from '@/api/types';
import { useActiveStore } from '@/lib/active-store';
import { colors, statusColors } from '@/theme';

const FILTERS: Array<{ label: string; value: OrderStatus | 'all' }> = [
  { label: 'Toutes', value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'En traitement', value: 'processing' },
  { label: 'Expédiées', value: 'shipped' },
  { label: 'Terminées', value: 'completed' },
  { label: 'Annulées', value: 'cancelled' },
];

export default function OrdersScreen() {
  const { activeStore } = useActiveStore();
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders', activeStore?.id, status],
    queryFn: () => fetchOrders(activeStore!.id, 1, status === 'all' ? undefined : status),
    enabled: !!activeStore,
  });

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
        {FILTERS.map((filter) => (
          <Pressable
            key={filter.value}
            style={[styles.filterChip, status === filter.value && styles.filterChipActive]}
            onPress={() => setStatus(filter.value)}>
            <Text style={[styles.filterChipText, status === filter.value && styles.filterChipTextActive]}>{filter.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={data?.orders ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>Aucune commande.</Text> : null}
        renderItem={({ item }) => <OrderRow order={item} />}
      />
    </View>
  );
}

function OrderRow({ order }: { order: OrderSummary }) {
  return (
    <Pressable style={styles.row} onPress={() => router.push(`/(app)/orders/${order.id}`)}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>#{order.order_number}</Text>
        <Text style={styles.rowMeta}>{order.customer} · {order.items_count} article(s)</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowTotal}>{order.total.toFixed(2)}</Text>
        <View style={[styles.badge, { backgroundColor: `${statusColors[order.status]}20` }]}>
          <Text style={[styles.badgeText, { color: statusColors[order.status] }]}>{order.status}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filters: { flexGrow: 0, marginTop: 12 },
  filtersContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 13, color: colors.text },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
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
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowMeta: { fontSize: 13, color: colors.muted, marginTop: 4 },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  rowTotal: { fontSize: 15, fontWeight: '700', color: colors.text },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
});

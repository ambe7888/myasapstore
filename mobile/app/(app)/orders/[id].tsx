import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchOrder, updateOrderStatus } from '@/api/orders';
import type { OrderStatus } from '@/api/types';
import { colors, statusColors } from '@/theme';

const STATUS_FLOW: OrderStatus[] = ['pending', 'processing', 'shipped', 'completed'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
  });

  const handleStatusChange = async (status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  if (isLoading || !order) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>#{order.order_number}</Text>
        <View style={[styles.badge, { backgroundColor: `${statusColors[order.status]}20` }]}>
          <Text style={[styles.badgeText, { color: statusColors[order.status] }]}>{order.status}</Text>
        </View>
      </View>

      <Section title="Statut de la commande">
        <View style={styles.statusRow}>
          {STATUS_FLOW.map((status) => (
            <Pressable
              key={status}
              style={[styles.statusChip, order.status === status && { backgroundColor: statusColors[status] }]}
              onPress={() => handleStatusChange(status)}>
              <Text style={[styles.statusChipText, order.status === status && styles.statusChipTextActive]}>{status}</Text>
            </Pressable>
          ))}
        </View>
        {order.status !== 'cancelled' && (
          <Pressable style={styles.cancelLink} onPress={() => handleStatusChange('cancelled')}>
            <Text style={styles.cancelLinkText}>Annuler la commande</Text>
          </Pressable>
        )}
      </Section>

      <Section title="Client">
        <Text style={styles.text}>{order.customer.name}</Text>
        <Text style={styles.textMuted}>{order.customer.email}</Text>
        <Text style={styles.textMuted}>{order.customer.phone}</Text>
      </Section>

      <Section title="Articles">
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.text} numberOfLines={1}>{item.name} × {item.quantity}</Text>
            <Text style={styles.text}>{(item.unit_price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </Section>

      <Section title="Résumé">
        <SummaryLine label="Sous-total" value={order.summary.subtotal} />
        <SummaryLine label="Livraison" value={order.summary.shipping} />
        <SummaryLine label="Taxes" value={order.summary.tax} />
        <SummaryLine label="Remise" value={-order.summary.discount} />
        <SummaryLine label="Total" value={order.summary.total} bold />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SummaryLine({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.itemRow}>
      <Text style={[styles.text, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.text, bold && styles.bold]}>{value.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 60 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  orderNumber: { fontSize: 20, fontWeight: '700', color: colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  section: { backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 10, textTransform: 'uppercase' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  statusChipText: { fontSize: 12, color: colors.text, textTransform: 'capitalize' },
  statusChipTextActive: { color: '#fff', fontWeight: '600' },
  cancelLink: { marginTop: 12 },
  cancelLinkText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  text: { fontSize: 14, color: colors.text, flexShrink: 1 },
  textMuted: { fontSize: 13, color: colors.muted, marginTop: 2 },
  bold: { fontWeight: '700' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
});

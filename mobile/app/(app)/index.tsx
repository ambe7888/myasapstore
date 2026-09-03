import { useState } from 'react';
import { router } from 'expo-router';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useActiveStore } from '@/lib/active-store';
import { useSession } from '@/lib/session';
import { colors } from '@/theme';

export default function DashboardScreen() {
  const { user } = useSession();
  const { stores, activeStore, isLoading, setActiveStoreId, refresh } = useActiveStore();
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}>
      <Text style={styles.greeting}>Bonjour, {user?.name.split(' ')[0]} 👋</Text>

      <Pressable style={styles.storeSwitcher} onPress={() => setPickerVisible(true)}>
        <View>
          <Text style={styles.storeSwitcherLabel}>Boutique active</Text>
          <Text style={styles.storeSwitcherName}>{activeStore?.name ?? '—'}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.muted} />
      </Pressable>

      {activeStore && (
        <View style={styles.statsGrid}>
          <StatCard label="Commandes" value={activeStore.total_orders} />
          <StatCard label="Clients" value={activeStore.total_customers} />
          <StatCard label="Revenu" value={`${activeStore.total_revenue.toFixed(2)}`} />
        </View>
      )}

      <View style={styles.quickActions}>
        <QuickAction icon="add-circle" label="Nouveau produit" onPress={() => router.push('/(app)/products/create')} />
        <QuickAction icon="list" label="Voir les commandes" onPress={() => router.push('/(app)/orders')} />
      </View>

      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Choisir une boutique</Text>
            {stores.map((store) => (
              <Pressable
                key={store.id}
                style={styles.modalItem}
                onPress={() => {
                  setActiveStoreId(store.id);
                  setPickerVisible(false);
                }}>
                <Text style={styles.modalItemText}>{store.name}</Text>
                {store.id === activeStore?.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 20 },
  storeSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  storeSwitcherLabel: { fontSize: 12, color: colors.muted },
  storeSwitcherName: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 4 },
  quickActions: { gap: 12 },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionLabel: { fontSize: 15, fontWeight: '500', color: colors.text },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  modalItemText: { fontSize: 15, color: colors.text },
});

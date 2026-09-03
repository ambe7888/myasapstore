import { useQuery } from '@tanstack/react-query';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchPlans, fetchSubscription } from '@/api/subscription';
import { Button } from '@/components/Button';
import { colors } from '@/theme';

const UPGRADE_URL = `${process.env.EXPO_PUBLIC_API_URL ?? ''}/plans`;

export default function SubscriptionScreen() {
  const { data: subscription, isLoading } = useQuery({ queryKey: ['subscription'], queryFn: fetchSubscription });
  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: fetchPlans });

  if (isLoading || !subscription) {
    return <View style={styles.loading} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.currentPlanCard}>
        <Text style={styles.currentPlanLabel}>Plan actuel</Text>
        <Text style={styles.currentPlanName}>{subscription.plan?.name ?? '—'}</Text>
        {subscription.is_trial && <Text style={styles.trialBadge}>Période d'essai</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Utilisation</Text>
        <UsageRow label="Boutiques" used={subscription.usage.stores} limit={subscription.limits.max_stores} />
        <UsageRow label="Produits" used={subscription.usage.products} limit={subscription.limits.max_products_per_store} />
      </View>

      {plans && plans.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Autres plans</Text>
          {plans.map((plan) => (
            <View key={plan.id} style={styles.planRow}>
              <View>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planMeta}>
                  {plan.max_stores} boutiques · {plan.max_products_per_store} produits
                </Text>
              </View>
              <Text style={styles.planPrice}>{plan.price} /mois</Text>
            </View>
          ))}
        </View>
      )}

      <Button title="Gérer mon abonnement" onPress={() => Linking.openURL(UPGRADE_URL)} />
    </ScrollView>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const ratio = limit > 0 ? Math.min(used / limit, 1) : 0;
  return (
    <View style={styles.usageRow}>
      <View style={styles.usageHeader}>
        <Text style={styles.text}>{label}</Text>
        <Text style={styles.textMuted}>{used} / {limit}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 60 },
  loading: { flex: 1, backgroundColor: colors.background },
  currentPlanCard: { backgroundColor: colors.primary, borderRadius: 14, padding: 20, marginBottom: 20 },
  currentPlanLabel: { color: '#e0e7ff', fontSize: 13 },
  currentPlanName: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 4 },
  trialBadge: { color: '#fef08a', fontSize: 12, fontWeight: '600', marginTop: 8 },
  section: { backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 12, textTransform: 'uppercase' },
  usageRow: { marginBottom: 14 },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressTrack: { height: 6, borderRadius: 999, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: colors.primary },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  planName: { fontSize: 14, fontWeight: '600', color: colors.text },
  planMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  planPrice: { fontSize: 14, fontWeight: '700', color: colors.text },
  text: { fontSize: 14, color: colors.text },
  textMuted: { fontSize: 13, color: colors.muted },
});

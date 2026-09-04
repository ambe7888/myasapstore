import { useState } from 'react';
import Constants from 'expo-constants';
import { logout } from '@/api/auth';
import { Button } from '@/components/Button';
import { unregisterCurrentDeviceToken } from '@/lib/push-notifications';
import { useSession } from '@/lib/session';
import { checkForUpdate } from '@/lib/updates';
import { colors } from '@/theme';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function AccountScreen() {
  const { user, signOut } = useSession();
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleCheckForUpdate = async () => {
    setCheckingUpdate(true);
    const result = await checkForUpdate();
    setCheckingUpdate(false);
    if (!result.applied) {
      Alert.alert('Mises à jour', result.message);
    }
  };

  const handleLogout = () => {
    Alert.alert('Se déconnecter', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          try {
            await unregisterCurrentDeviceToken();
            await logout();
          } finally {
            signOut();
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
      </View>

      <Button title="Vérifier les mises à jour" variant="secondary" onPress={handleCheckForUpdate} loading={checkingUpdate} />
      <Button title="Se déconnecter" variant="danger" onPress={handleLogout} />

      <Text style={styles.version}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, gap: 20 },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  email: { fontSize: 14, color: colors.muted, marginTop: 6 },
  phone: { fontSize: 14, color: colors.muted, marginTop: 2 },
  version: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 4 },
});

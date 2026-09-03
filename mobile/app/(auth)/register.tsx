import { useState } from 'react';
import { Link, router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { registerSeller } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useSession } from '@/lib/session';
import { colors } from '@/theme';

export default function RegisterScreen() {
  const { signIn } = useSession();
  const [form, setForm] = useState({
    name: '',
    store_name: '',
    email: '',
    country_code: '+212',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const isValid =
    form.name && form.store_name && form.email && form.phone && form.password && form.password === form.password_confirmation;

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await registerSeller(form);
      signIn(token, user);
      router.replace('/');
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Créer votre boutique</Text>
        <Text style={styles.subtitle}>Quelques infos pour démarrer</Text>

        <TextField label="Votre nom" value={form.name} onChangeText={update('name')} placeholder="Amine Ben Ali" />
        <TextField label="Nom de la boutique" value={form.store_name} onChangeText={update('store_name')} placeholder="Ma Boutique" />
        <TextField
          label="Email"
          value={form.email}
          onChangeText={update('email')}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="vous@exemple.com"
        />
        <View style={styles.row}>
          <View style={styles.rowItemSmall}>
            <TextField label="Indicatif" value={form.country_code} onChangeText={update('country_code')} placeholder="+212" />
          </View>
          <View style={styles.rowItemLarge}>
            <TextField label="Téléphone" value={form.phone} onChangeText={update('phone')} keyboardType="phone-pad" placeholder="600000000" />
          </View>
        </View>
        <TextField label="Mot de passe" value={form.password} onChangeText={update('password')} secureTextEntry />
        <TextField
          label="Confirmer le mot de passe"
          value={form.password_confirmation}
          onChangeText={update('password_confirmation')}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Créer mon compte" onPress={handleRegister} loading={loading} disabled={!isValid} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà inscrit ? </Text>
          <Link href="/(auth)/login" style={styles.link}>
            Se connecter
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 24 },
  row: { flexDirection: 'row', gap: 12 },
  rowItemSmall: { flex: 1 },
  rowItemLarge: { flex: 2 },
  error: { color: colors.danger, marginBottom: 16, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});

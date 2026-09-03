import { useState } from 'react';
import { Link, router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { login } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useSession } from '@/lib/session';
import { colors } from '@/theme';

export default function LoginScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await login(email.trim(), password);
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
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Gérez vos boutiques depuis votre téléphone</Text>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="vous@exemple.com"
        />
        <TextField
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Se connecter" onPress={handleLogin} loading={loading} disabled={!email || !password} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <Link href="/(auth)/register" style={styles.link}>
            Créer une boutique
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 28 },
  error: { color: colors.danger, marginBottom: 16, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});

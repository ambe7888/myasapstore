import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ActiveStoreProvider } from '@/lib/active-store';
import { SessionProvider, useSession } from '@/lib/session';
import { SplashScreenController } from '@/lib/splash';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SessionProvider>
          <SplashScreenController />
          <RootNavigator />
          <StatusBar style="auto" />
        </SessionProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { user } = useSession();

  return (
    <ActiveStoreProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>

        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </ActiveStoreProvider>
  );
}

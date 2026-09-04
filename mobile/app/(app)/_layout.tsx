import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { registerForPushNotifications } from '@/lib/push-notifications';
import { colors } from '@/theme';

export default function AppLayout() {
  useEffect(() => {
    registerForPushNotifications();

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { type?: string; order_id?: number };
      if (data?.type === 'order' && data.order_id) {
        router.push(`/(app)/orders/${data.order_id}`);
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produits',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{ title: 'Abonnement', tabBarIcon: ({ color, size }) => <Ionicons name="card" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Compte', tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }}
      />
    </Tabs>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors } from '@/theme';

export default function AppLayout() {
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

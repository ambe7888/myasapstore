import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Produits' }} />
      <Stack.Screen name="create" options={{ title: 'Nouveau produit', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Produit' }} />
    </Stack>
  );
}

import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import type { ProductPayload } from '@/api/products';
import type { Product } from '@/api/types';
import { colors } from '@/theme';
import { Button } from './Button';
import { TextField } from './TextField';

interface ProductFormProps {
  initial?: Product;
  submitLabel: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (payload: ProductPayload) => void;
}

export function ProductForm({ initial, submitLabel, loading, error, onSubmit }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [salePrice, setSalePrice] = useState(initial?.sale_price ? String(initial.sale_price) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '0');
  const [coverImage, setCoverImage] = useState(initial?.cover_image ?? '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const isValid = name.trim().length > 0 && price.trim().length > 0 && stock.trim().length > 0;

  const handleSubmit = () => {
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : undefined,
      stock: Number(stock),
      cover_image: coverImage.trim() || undefined,
      is_active: isActive,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextField label="Nom du produit" value={name} onChangeText={setName} placeholder="T-shirt coton" />
      <TextField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Description du produit"
        multiline
        numberOfLines={4}
        style={styles.textarea}
      />
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <TextField label="Prix" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" />
        </View>
        <View style={styles.rowItem}>
          <TextField label="Prix promo" value={salePrice} onChangeText={setSalePrice} keyboardType="decimal-pad" placeholder="Optionnel" />
        </View>
      </View>
      <TextField label="Stock" value={stock} onChangeText={setStock} keyboardType="number-pad" placeholder="0" />
      <TextField label="Image (URL)" value={coverImage} onChangeText={setCoverImage} autoCapitalize="none" placeholder="https://..." />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Produit actif</Text>
        <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: colors.primary }} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title={submitLabel} onPress={handleSubmit} loading={loading} disabled={!isValid} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  switchLabel: { fontSize: 15, color: colors.text, fontWeight: '500' },
  error: { color: colors.danger, marginBottom: 16, fontSize: 13 },
});

import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ title, onPress, loading, disabled, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        (disabled || loading) && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, variant === 'secondary' && styles.textSecondary]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  textSecondary: {
    color: colors.text,
  },
});

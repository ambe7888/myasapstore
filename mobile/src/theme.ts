export const colors = {
  primary: '#4f46e5',
  primaryDark: '#3730a3',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  danger: '#dc2626',
  success: '#16a34a',
  warning: '#d97706',
};

export const statusColors: Record<string, string> = {
  pending: colors.warning,
  processing: colors.primary,
  shipped: '#0891b2',
  completed: colors.success,
  cancelled: colors.danger,
};

export const colors = {
  background: {
    50: '#FFFFFF',
    100: '#F8FAFC',
    200: '#F1F5F9',
    300: '#E2E8F0',
  },
  sidebar: {
    DEFAULT: '#0F172A',
    hover: '#1E293B',
    active: '#334155',
    text: '#CBD5E1',
    muted: '#64748B',
  },
  content: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
  },
  border: {
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
  },
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
  },
  success: { 50: '#ECFDF5', 100: '#D1FAE5', 500: '#10B981', 600: '#059669', 700: '#047857' },
  warning: { 50: '#FFFBEB', 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
  danger: { 50: '#FEF2F2', 100: '#FEE2E2', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C' },
  info: { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
  overlay: 'rgb(15 23 42 / 0.5)',
};

export const chartColors = {
  sales: colors.primary[500],
  orders: colors.info[500],
  grid: colors.border[200],
  axis: colors.content.muted,
};

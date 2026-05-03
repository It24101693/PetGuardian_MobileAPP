export const Colors = {
  // Backgrounds
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceAlt: '#f1f5f9',
  card: '#ffffff',
  cardBorder: '#e2e8f0',

  // Primary gradient (Keeping professional Indigo/Violet)
  primary: '#4f46e5',
  primaryLight: '#6366f1',
  primaryDark: '#3730a3',
  secondary: '#7c3aed',

  // Accent
  accent: '#06b6d4',
  accentDark: '#0891b2',

  // Status
  success: '#10b981',
  successBg: '#ecfdf5',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  danger: '#ef4444',
  dangerBg: '#fef2f2',
  info: '#3b82f6',
  infoBg: '#eff6ff',

  // Text
  textPrimary: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textDisabled: '#94a3b8',

  // Inputs
  inputBg: '#ffffff',
  inputBorder: '#e2e8f0',
  inputFocus: '#4f46e5',

  // Tab bar
  tabBarBg: '#ffffff',
  tabBarActive: '#4f46e5',
  tabBarInactive: '#94a3b8',

  // Misc
  divider: '#e2e8f0',
  overlay: 'rgba(0,0,0,0.5)',
  white: '#ffffff',
  black: '#000000',
};

export const Gradients = {
  primary: ['#6366f1', '#8b5cf6'] as const,
  primaryAlt: ['#4f46e5', '#6366f1'] as const,
  accent: ['#22d3ee', '#6366f1'] as const,
  danger: ['#ef4444', '#dc2626'] as const,
  success: ['#10b981', '#059669'] as const,
  dark: ['#1e293b', '#0f172a'] as const,
  header: ['#111827', '#0a0f1e'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 30,
  hero: 36,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
};

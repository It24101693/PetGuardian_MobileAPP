import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, FontSize } from '../../constants/theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Colors.successBg, text: Colors.success },
  warning: { bg: Colors.warningBg, text: Colors.warning },
  danger: { bg: Colors.dangerBg, text: Colors.danger },
  info: { bg: Colors.infoBg, text: Colors.info },
  primary: { bg: '#eef2ff', text: Colors.primary },
  default: { bg: Colors.surfaceAlt, text: Colors.textMuted },
};

export function Badge({ label, variant = 'default', style, size = 'md' }: BadgeProps) {
  const { bg, text } = variantMap[variant];
  const isSmall = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSmall && styles.small, style]}>
      <Text style={[styles.text, { color: text }, isSmall && styles.smallText]}>
        {label}
      </Text>
    </View>
  );
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  switch (status?.toLowerCase()) {
    case 'confirmed':
    case 'completed':
    case 'healthy':
    case 'active':
      return 'success';
    case 'pending':
    case 'vaccine_due':
      return 'warning';
    case 'cancelled':
    case 'sick':
      return 'danger';
    default:
      return 'default';
  }
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  smallText: {
    fontSize: 10,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — StatusBadge
// Píldora estándar de estado (punto o icono + label + color).
// La metadata sale de src/utils/status.ts: así el mismo estado
// se ve idéntico en Home, Carta, Pedidos, Reservas y Cuenta.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View, Text, StyleSheet,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { getStatusMeta } from '../../utils/status';
import type { StatusKind, StatusMeta } from '../../utils/status';

interface StatusBadgeProps {
  /** Familia de estados: order | item | reservation | table | service */
  kind?: StatusKind;
  /** Estado crudo del backend (tolerante a payloads Socket.IO). */
  status?: string;
  /** Metadata explícita — alternativa a kind+status para casos especiales. */
  meta?: StatusMeta;
  /** 'dot' (default) = punto de color; 'icon' = icono del estado. */
  variant?: 'dot' | 'icon';
  /** 'sm' (default) = píldora compacta; 'md' = píldora con más aire. */
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function StatusBadge({
  kind = 'order',
  status = '',
  meta,
  variant = 'dot',
  size = 'sm',
  style,
}: StatusBadgeProps) {
  const info = meta ?? getStatusMeta(kind, status);
  const Icon = info.icon;
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <View
      style={[
        styles.badge,
        size === 'md' && styles.badgeMd,
        { backgroundColor: info.bg },
        style,
      ]}
    >
      {variant === 'icon' ? (
        <Icon size={iconSize} color={info.color} />
      ) : (
        <View style={[styles.dot, size === 'md' && styles.dotMd, { backgroundColor: info.color }]} />
      )}
      <Text
        style={[
          size === 'sm' ? styles.labelSm : styles.labelMd,
          { color: info.color },
        ]}
        numberOfLines={1}
      >
        {info.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection:     'row',
    alignItems:        'center',
    alignSelf:         'flex-start',
    gap:               Spacing.xs,
    borderRadius:      Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical:   3,
  },
  badgeMd: {
    paddingHorizontal: Spacing.smMd,
    paddingVertical:   Spacing.xs + 1,
  },
  dot: {
    width:        6,
    height:       6,
    borderRadius: Radius.full,
  },
  dotMd: {
    width:        8,
    height:       8,
  },
  labelSm: {
    ...Typography.labelSm,
    textTransform: 'none' as const,
  },
  labelMd: {
    ...Typography.labelMd,
  },
});

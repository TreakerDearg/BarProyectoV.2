// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — PedidoActivoBanner
// Banner de seguimiento del pedido activo en la HomeScreen.
// Muestra número de orden, tiempo estimado, thumbnails de items y CTA.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import { Clock, ChevronRight } from 'lucide-react-native';
import { Colors }     from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Elevation }  from '../../theme/elevation';
import type { OrderPublicDTO } from '../../types/api';

interface PedidoActivoBannerProps {
  order:    OrderPublicDTO;
  onPress:  () => void;
  estimatedMinutes?: number;
}

const STATUS_COLOR: Record<string, string> = {
  pending:       Colors.warning,
  'in-progress': Colors.primary,
  completed:     Colors.success,
  cancelled:     Colors.error,
};

const STATUS_LABEL: Record<string, string> = {
  pending:       'Pedido recibido',
  'in-progress': 'En barra',
  completed:     'Listo para servir',
  cancelled:     'Cancelado',
};

export function PedidoActivoBanner({
  order,
  onPress,
  estimatedMinutes = 15,
}: PedidoActivoBannerProps) {
  const accentColor = STATUS_COLOR[order.status] ?? Colors.primary;
  const statusLabel = STATUS_LABEL[order.status] ?? order.status;

  // Primeros 2 items para thumbnails
  const previewItems = order.items?.slice(0, 2) ?? [];
  const extraCount   = (order.items?.length ?? 0) - 2;

  return (
    <TouchableOpacity
      style={[styles.banner, { borderColor: `${accentColor}40` }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Indicator bar superior */}
      <View style={[styles.topBar, { backgroundColor: accentColor }]} />

      <View style={styles.body}>
        {/* Left: info */}
        <View style={styles.leftCol}>
          {/* Order ref + status */}
          <View style={styles.orderRefRow}>
            <Text style={styles.orderRef}>
              Pedido #{order.id.slice(-4).toUpperCase()}
            </Text>
            <View style={[styles.statusChip, { borderColor: `${accentColor}40`, backgroundColor: `${accentColor}15` }]}>
              <Text style={[styles.statusChipText, { color: accentColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Tiempo estimado */}
          {order.status === 'in-progress' && (
            <View style={styles.timeRow}>
              <Clock size={12} color={Colors.onSurfaceVariant} />
              <Text style={styles.timeText}>{estimatedMinutes}–{estimatedMinutes + 5} min</Text>
            </View>
          )}

          {/* Preview de items */}
          {previewItems.length > 0 && (
            <View style={styles.itemsPreview}>
              {previewItems.map((item, idx) => (
                <Text key={idx} style={styles.itemPreviewText} numberOfLines={1}>
                  {item.quantity}× {item.name}
                </Text>
              ))}
              {extraCount > 0 && (
                <Text style={styles.extraText}>+{extraCount} más</Text>
              )}
            </View>
          )}
        </View>

        {/* Right: CTA */}
        <TouchableOpacity style={styles.ctaBtn} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.ctaText}>Seguir</Text>
          <ChevronRight size={16} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.xl,
    borderWidth:     1,
    overflow:        'hidden',
    ...(Elevation.card as object),
  },
  topBar: {
    height: 3,
  },
  body: {
    flexDirection:   'row',
    alignItems:      'center',
    padding:         Spacing.md,
    gap:             Spacing.smMd,
  },
  leftCol: {
    flex: 1,
    gap:  Spacing.xs,
  },
  orderRefRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
    flexWrap:      'wrap',
  },
  orderRef: { ...Typography.labelLg, color: Colors.onSurface },
  statusChip: {
    borderRadius:    Radius.full,
    paddingHorizontal: 8,
    paddingVertical:   2,
    borderWidth:     1,
  },
  statusChipText: { ...Typography.labelSm, textTransform: 'none' as const },
  timeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  timeText: { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  itemsPreview: { gap: 2 },
  itemPreviewText: { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  extraText: { ...Typography.bodySm, color: Colors.outline },

  ctaBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.primaryContainer,
    borderRadius:    Radius.md,
    paddingHorizontal: Spacing.smMd,
    paddingVertical:   Spacing.sm,
    gap:             4,
    ...(Elevation.goldCTA as object),
  },
  ctaText: { ...Typography.labelLg, color: Colors.onPrimary },
});

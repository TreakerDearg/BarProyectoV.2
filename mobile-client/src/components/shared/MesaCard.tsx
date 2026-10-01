// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — MesaCard
// Card de mesa activa en la HomeScreen.
// Muestra mesa, zona, consumo total y acciones rápidas.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { TableProperties, Receipt, PhoneCall } from 'lucide-react-native';
import { Colors }     from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Elevation }  from '../../theme/elevation';

interface MesaCardProps {
  tableNumber:  number;
  zone?:        string;
  status?:      string;
  totalAmount?: number;
  onViewConsumos?: () => void;
  onCallWaiter?:   () => void;
}

export function MesaCard({
  tableNumber,
  zone,
  status = 'activa',
  totalAmount,
  onViewConsumos,
  onCallWaiter,
}: MesaCardProps) {
  return (
    <View style={styles.card}>
      {/* Top row: icono + info + badge */}
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <TableProperties size={20} color={Colors.primary} />
        </View>
        <View style={styles.info}>
          <View style={styles.nameBadgeRow}>
            <Text style={styles.mesaName}>Mesa {tableNumber}</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Mesa {status}</Text>
            </View>
          </View>
          {zone ? (
            <Text style={styles.zone} numberOfLines={1}>{zone}</Text>
          ) : null}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onViewConsumos}
          activeOpacity={0.75}
        >
          <Receipt size={14} color={Colors.onSurfaceVariant} />
          <Text style={styles.actionText}>
            Ver consumos
            {totalAmount != null ? ` ($${totalAmount.toLocaleString('es-AR')})` : ''}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onCallWaiter}
          activeOpacity={0.75}
        >
          <PhoneCall size={14} color={Colors.onSurfaceVariant} />
          <Text style={styles.actionText}>Llamar mozo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.xl,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.08)',
    overflow:        'hidden',
    ...(Elevation.card as object),
  },
  topRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.smMd,
    padding:       Spacing.md,
  },
  iconWrap: {
    width:           40,
    height:          40,
    borderRadius:    Radius.md,
    backgroundColor: Colors.goldMuted,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  info: { flex: 1, gap: 3 },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
    flexWrap:      'wrap',
  },
  mesaName: { ...Typography.headlineSm, color: Colors.onSurface },
  statusBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             5,
    backgroundColor: 'rgba(52, 185, 100, 0.10)',
    borderRadius:    Radius.full,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:     1,
    borderColor:     'rgba(52, 185, 100, 0.25)',
  },
  statusDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  statusText: { ...Typography.labelSm, color: Colors.success, textTransform: 'none' as const },
  zone: { ...Typography.bodySm, color: Colors.onSurfaceVariant },

  divider: {
    height:           1,
    backgroundColor:  'rgba(224, 226, 236, 0.06)',
    marginHorizontal: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm,
  },
  actionBtn: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'center',
    gap:           6,
    paddingVertical: 8,
  },
  actionText: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  actionDivider: {
    width:           1,
    height:          20,
    backgroundColor: 'rgba(224, 226, 236, 0.08)',
  },
});

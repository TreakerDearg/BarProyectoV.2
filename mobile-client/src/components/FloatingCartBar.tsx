// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — FloatingCartBar (Nocturne Gastronomy)
// Barra flotante del carrito, visible cuando hay items.
// Gold fill, haptic feedback, glow effect.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors }    from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation } from '../theme/elevation';
import { useCartStore } from '../stores/useCartStore';

interface FloatingCartBarProps {
  onPress: () => void;
}

export function FloatingCartBar({ onPress }: FloatingCartBarProps) {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  if (totalItems === 0) return null;

  const handlePress = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.bar}
      onPress={handlePress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`Ver pedido: ${totalItems} ${totalItems === 1 ? 'ítem' : 'ítems'}, total $${totalPrice.toLocaleString('es-AR')}`}
    >
      {/* Cantidad de ítems */}
      <View style={styles.badgeWrap}>
        <ShoppingBag size={18} color={Colors.onPrimary} />
        <Text style={styles.itemsText}>
          {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
        </Text>
      </View>

      {/* Total del pedido */}
      <Text style={styles.priceText}>
        ${totalPrice.toLocaleString('es-AR')}
      </Text>

      {/* CTA derecho */}
      <View style={styles.ctaRight}>
        <Text style={styles.ctaText}>Ver pedido</Text>
        <ChevronRight size={16} color={Colors.onPrimary} strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    backgroundColor: Colors.primaryContainer,   // #d4a340
    borderRadius:    Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.smMd,
    ...(Elevation.goldCTA as object),
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  itemsText: {
    ...Typography.labelLg,
    color:         Colors.onPrimary,
    textTransform: 'none' as const,
  },
  priceText: {
    ...Typography.priceLg,
    color: Colors.onPrimary,
  },
  ctaRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           2,
  },
  ctaText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
  },
});

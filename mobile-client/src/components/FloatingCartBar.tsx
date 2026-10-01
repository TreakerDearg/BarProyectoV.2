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
      accessibilityLabel={`Ver carrito: ${totalItems} items, total $${totalPrice.toLocaleString('es-AR')}`}
    >
      {/* Badge izquierdo */}
      <View style={styles.badgeWrap}>
        <ShoppingBag size={18} color={Colors.onPrimary} />
        <View style={styles.countBubble}>
          <Text style={styles.countText}>{totalItems}</Text>
        </View>
      </View>

      {/* Precio central */}
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
  countBubble: {
    backgroundColor: 'rgba(65, 45, 0, 0.25)',
    borderRadius:    Radius.full,
    paddingHorizontal: 7,
    paddingVertical:   2,
    minWidth:          22,
    alignItems:        'center',
  },
  countText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
  },
  priceText: {
    ...Typography.headlineSm,
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

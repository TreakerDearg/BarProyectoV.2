// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — CartItemRow
// Fila horizontal de item del carrito: imagen (expo-image), nombre + notas,
// stepper de cantidad (papelera cuando qty=1).
// ─────────────────────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { Minus, Plus, Trash2, GlassWater } from 'lucide-react-native';

import { Colors, NocturneColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

import type { CartLine } from '../../types/api';

interface CartItemRowProps {
  item:        CartLine;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove:    () => void;
}

export const CartItemRow = memo(function CartItemRow({ item, onIncrement, onDecrement, onRemove }: CartItemRowProps) {
  const handleDecrement = () => {
    if (item.quantity === 1) {
      onRemove();
    } else {
      onDecrement();
    }
  };

  return (
    <View style={styles.row}>
      {/* ── Image ────────────────────────────────────────── */}
      <View style={styles.imageWrap}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <GlassWater size={20} color={Colors.outline} />
          </View>
        )}
      </View>

      {/* ── Middle: name + notes ─────────────────────────── */}
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        {item.notes ? (
          <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text>
        ) : null}
      </View>

      {/* ── Right: stepper ───────────────────────────────── */}
      <View style={styles.stepper}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={handleDecrement}
          hitSlop={{ top: 7, right: 7, bottom: 7, left: 7 }}
        >
          {item.quantity === 1 ? (
            <Trash2 size={14} color={Colors.error} />
          ) : (
            <Minus size={13} color={Colors.onSurface} />
          )}
        </TouchableOpacity>

        <Text style={styles.qty}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.stepBtn}
          onPress={onIncrement}
          hitSlop={{ top: 7, right: 7, bottom: 7, left: 7 }}
        >
          <Plus size={13} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.smMd,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.lg,
    padding:         Spacing.sm,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },

  // ── Image ─────────────────────────────────────────────────────
  imageWrap: {
    width:        56,
    height:       56,
    borderRadius: Radius.md,
    overflow:     'hidden',
    flexShrink:   0,
  },
  image: {
    width:  56,
    height: 56,
  },
  imageFallback: {
    backgroundColor: Colors.surfaceContainerHighest,
    justifyContent:  'center',
    alignItems:      'center',
  },

  // ── Middle ─────────────────────────────────────────────────────
  middle: {
    flex: 1,
    gap:  2,
  },
  name: {
    ...Typography.labelLg,
    color: Colors.onSurface,
  },
  notes: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },

  // ── Stepper ─────────────────────────────────────────────────────
  stepper: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            2,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius:   Radius.md,
    overflow:       'hidden',
  },
  stepBtn: {
    width:          30,
    height:         30,
    justifyContent: 'center',
    alignItems:     'center',
  },
  qty: {
    ...Typography.labelLg,
    color:     Colors.onSurface,
    minWidth:  20,
    textAlign: 'center',
  },
});

export default CartItemRow;

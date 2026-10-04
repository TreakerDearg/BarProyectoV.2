// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — ProductGridCard
// 2-column grid card for menu products with image, heart, qty stepper.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { Heart, Minus, Plus } from 'lucide-react-native';

import { Colors }     from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

import type { ProductPublicDTO } from '../../types/api';

function fmtPrice(n: number) {
  return `$${n.toLocaleString('es-AR')}`;
}

interface ProductGridCardProps {
  product:     ProductPublicDTO;
  isFavorite:  boolean;
  cartQty:     number;
  onAdd:       (p: ProductPublicDTO) => void;
  onRemove:    (p: ProductPublicDTO) => void;
  onFavorite?: (p: ProductPublicDTO) => void;
  onPress?:    (p: ProductPublicDTO) => void;
}

export function ProductGridCard({
  product,
  isFavorite,
  cartQty,
  onAdd,
  onRemove,
  onFavorite,
  onPress,
}: ProductGridCardProps) {
  const minusAnim = useRef(new Animated.Value(1)).current;
  const plusAnim  = useRef(new Animated.Value(1)).current;

  const springPress = (anim: Animated.Value, action: () => void) => {
    Animated.sequence([
      Animated.spring(anim, { toValue: 0.85, friction: 5, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1,    friction: 5, useNativeDriver: true }),
    ]).start();
    action();
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.85 : 1}
      onPress={() => onPress?.(product)}
    >
      {/* ── Image ─────────────────────────────────────────── */}
      <View style={styles.imageWrap}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>🍹</Text>
          </View>
        )}

        {/* Heart button */}
        {onFavorite && (
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => onFavorite(product)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Heart
              size={16}
              color={isFavorite ? Colors.error : Colors.onSurfaceVariant}
              fill={isFavorite ? Colors.error : 'transparent'}
            />
          </TouchableOpacity>
        )}

        {/* Unavailable overlay */}
        {!product.available && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>No disponible</Text>
          </View>
        )}
      </View>

      {/* ── Info ─────────────────────────────────────────── */}
      <View style={styles.infoWrap}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>
          {fmtPrice(product.dynamicPrice ?? product.price)}
        </Text>

        {/* ── Stepper / Add button ─────────────────────── */}
        {cartQty === 0 ? (
          <TouchableOpacity
            style={[styles.addBtn, !product.available && styles.addBtnDisabled]}
            onPress={() => product.available && onAdd(product)}
            activeOpacity={0.8}
            disabled={!product.available}
          >
            <Plus size={14} color={Colors.onPrimary} />
            <Text style={styles.addBtnText}>Agregar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stepper}>
            <Animated.View style={{ transform: [{ scale: minusAnim }] }}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => springPress(minusAnim, () => onRemove(product))}
              >
                <Minus size={13} color={Colors.onSurface} />
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.stepCount}>{cartQty}</Text>

            <Animated.View style={{ transform: [{ scale: plusAnim }] }}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => springPress(plusAnim, () => onAdd(product))}
              >
                <Plus size={13} color={Colors.onSurface} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex:            1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.lg,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     'rgba(224,226,236,0.08)',
  },

  // ── Image ──────────────────────────────────────────────────────
  imageWrap: {
    aspectRatio:  4 / 3,
    width:        '100%',
    position:     'relative',
  },
  image: {
    width:        '100%',
    height:       '100%',
    borderTopLeftRadius:  Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  imagePlaceholder: {
    backgroundColor: Colors.surfaceContainerHighest,
    justifyContent:  'center',
    alignItems:      'center',
  },
  imagePlaceholderText: {
    fontSize: 32,
  },
  heartBtn: {
    position:        'absolute',
    top:             Spacing.xs,
    right:           Spacing.xs,
    width:           28,
    height:          28,
    borderRadius:    Radius.full,
    backgroundColor: Colors.overlayDark,
    justifyContent:  'center',
    alignItems:      'center',
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8,9,12,0.65)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  unavailableText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    textTransform: 'none' as const,
  },

  // ── Info ───────────────────────────────────────────────────────
  infoWrap: {
    padding: Spacing.sm,
    gap:     Spacing.xs,
  },
  productName: {
    ...Typography.labelLg,
    color:      Colors.onSurface,
    lineHeight: 18,
  },
  productPrice: {
    ...Typography.price,
    color:    Colors.primary,
    fontSize: 15,
  },

  // ── Add button ─────────────────────────────────────────────────
  addBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             4,
    backgroundColor: Colors.primaryContainer,
    borderRadius:    Radius.md,
    paddingVertical: 6,
    marginTop:       2,
  },
  addBtnDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
  addBtnText: {
    ...Typography.labelMd,
    color:         Colors.onPrimary,
    textTransform: 'none' as const,
  },

  // ── Stepper ────────────────────────────────────────────────────
  stepper: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius:    Radius.md,
    marginTop:       2,
    overflow:        'hidden',
  },
  stepBtn: {
    width:          34,
    height:         30,
    justifyContent: 'center',
    alignItems:     'center',
  },
  stepCount: {
    ...Typography.labelLg,
    color: Colors.onSurface,
    minWidth: 24,
    textAlign: 'center',
  },
});

export default ProductGridCard;

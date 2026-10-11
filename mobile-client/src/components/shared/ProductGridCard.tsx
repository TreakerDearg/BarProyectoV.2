// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — ProductGridCard
// Card de grilla a 2 columnas: imagen (expo-image), corazón, stepper de
// cantidad, badges NBadge y CTA "Agregar" con gradiente ember.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Minus, Plus, GlassWater } from 'lucide-react-native';

import { Colors, NocturneColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Gradients } from '../../theme/gradients';
import { NBadge } from './NBadge';

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

  // Precio protagonista: descuento explícito cuando dynamicPrice < price
  const currentPrice = product.dynamicPrice ?? product.price;
  const hasDiscount  = currentPrice < product.price;
  const discountPct  = hasDiscount
    ? Math.round((1 - currentPrice / product.price) * 100)
    : 0;

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
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <GlassWater size={32} color={Colors.outline} />
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

        {/* Badges de la tarjeta */}
        <View style={styles.badgesCol} pointerEvents="none">
          {product.featured && <NBadge label="Más pedido" tone="ember" solid />}
          {hasDiscount && <NBadge label={`-${discountPct}%`} tone="error" solid />}
        </View>

        {/* Agotado overlay */}
        {!product.available && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Agotado</Text>
          </View>
        )}
      </View>

      {/* ── Info ─────────────────────────────────────────── */}
      <View style={styles.infoWrap}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{fmtPrice(currentPrice)}</Text>
          {hasDiscount && (
            <Text style={styles.priceOriginal}>{fmtPrice(product.price)}</Text>
          )}
        </View>

        {/* ── Stepper / Add button ─────────────────────── */}
        {cartQty === 0 ? (
          <TouchableOpacity
            style={[styles.addBtn, !product.available && styles.addBtnDisabled]}
            onPress={() => product.available && onAdd(product)}
            activeOpacity={0.8}
            disabled={!product.available}
          >
            {product.available && (
              <LinearGradient
                {...Gradients.emberCTA}
                style={styles.addBtnGradient}
                pointerEvents="none"
              />
            )}
            <Plus
              size={14}
              color={product.available ? Colors.onPrimary : Colors.onSurfaceVariant}
            />
            <Text
              style={[styles.addBtnText, !product.available && styles.addBtnTextDisabled]}
            >
              Agregar
            </Text>
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
    borderColor:     NocturneColors.borderSubtle,
  },

  // ── Image ──────────────────────────────────────────────────────
  imageWrap: {
    aspectRatio:  1,
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
  badgesCol: {
    position:   'absolute',
    top:        Spacing.xs,
    left:       Spacing.xs,
    gap:        4,
    alignItems: 'flex-start',
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: NocturneColors.overlayDark,
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
  priceRow: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap:           6,
  },
  productPrice: {
    ...Typography.priceLg,
    color: Colors.primary,
  },
  priceOriginal: {
    ...Typography.bodySm,
    color:              Colors.outline,
    textDecorationLine: 'line-through',
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
    overflow:        'hidden',
  },
  addBtnGradient: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    bottom:   0,
  },
  addBtnDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
  addBtnText: {
    ...Typography.labelMd,
    color:         Colors.onPrimary,
    textTransform: 'none' as const,
  },
  addBtnTextDisabled: {
    color: Colors.onSurfaceVariant,
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

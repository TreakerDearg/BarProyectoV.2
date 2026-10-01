// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — CompactProductRow
// Fila horizontal compacta para la lista de productos del menú.
// Imagen 80×80 rounded-xl, nombre, descripción, precio gold, botón +.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Plus, Heart, GlassWater, ChefHat } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors }     from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import type { ProductPublicDTO } from '../../types/api';

interface CompactProductRowProps {
  product:     ProductPublicDTO;
  isFavorite?: boolean;
  cartQty?:    number;
  onAdd:       (product: ProductPublicDTO) => void;
  onPress:     (product: ProductPublicDTO) => void;
  onFavorite?: (product: ProductPublicDTO) => void;
}

export function CompactProductRow({
  product,
  isFavorite = false,
  cartQty    = 0,
  onAdd,
  onPress,
  onFavorite,
}: CompactProductRowProps) {
  const price       = product.dynamicPrice ?? product.price;
  const hasDiscount = product.dynamicPrice < product.price;

  const handleAdd = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onAdd(product);
  };

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(product)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${product.name}`}
    >
      {/* ── Imagen ──────────────────────────────────────────── */}
      <View style={styles.imageWrap}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            {product.type === 'drink'
              ? <GlassWater size={24} color={Colors.outline} />
              : <ChefHat    size={24} color={Colors.outline} />}
          </View>
        )}

        {/* Badge de descuento */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{Math.round((1 - price / product.price) * 100)}%</Text>
          </View>
        )}
      </View>

      {/* ── Contenido ───────────────────────────────────────── */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          {product.drinkStyle === 'author' && (
            <View style={styles.authorBadge}>
              <Text style={styles.authorText}>AUTOR</Text>
            </View>
          )}
        </View>

        {product.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${price.toLocaleString('es-AR')}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                ${product.price.toLocaleString('es-AR')}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            {/* Favorito (solo si callback disponible) */}
            {onFavorite && (
              <TouchableOpacity
                onPress={() => { try { Haptics.selectionAsync(); } catch {} onFavorite(product); }}
                hitSlop={{ top: 8, right: 4, bottom: 8, left: 4 }}
                accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart
                  size={16}
                  color={isFavorite ? Colors.error : Colors.outline}
                  fill={isFavorite ? Colors.error : 'transparent'}
                />
              </TouchableOpacity>
            )}

            {/* Botón + con badge de cantidad */}
            <TouchableOpacity
              style={[styles.addBtn, cartQty > 0 && styles.addBtnActive]}
              onPress={handleAdd}
              activeOpacity={0.8}
              accessibilityLabel={`Agregar ${product.name} al carrito`}
            >
              {cartQty > 0 ? (
                <Text style={styles.qtyText}>{cartQty}</Text>
              ) : (
                <Plus size={16} color={Colors.onPrimary} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.06)',
    padding:         Spacing.smMd,
    gap:             Spacing.smMd,
  },

  // ── Imagen ────────────────────────────────────────────────────
  imageWrap: {
    width:           80,
    height:          80,
    borderRadius:    Radius.md,
    overflow:        'hidden',
    backgroundColor: Colors.surfaceContainerHigh,
    flexShrink:      0,
  },
  image: {
    width:  '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width:          '100%',
    height:         '100%',
    justifyContent: 'center',
    alignItems:     'center',
  },
  discountBadge: {
    position:        'absolute',
    top:             4,
    left:            4,
    backgroundColor: Colors.errorContainer,
    borderRadius:    Radius.xs,
    paddingHorizontal: 4,
    paddingVertical:   1,
  },
  discountText: {
    ...Typography.labelSm,
    color:     Colors.error,
    fontSize:  9,
  },

  // ── Contenido ─────────────────────────────────────────────────
  content: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  name: {
    ...Typography.titleMd,
    color: Colors.onSurface,
    flex:  1,
  },
  authorBadge: {
    backgroundColor: Colors.goldMuted,
    borderRadius:    Radius.xs,
    paddingHorizontal: 5,
    paddingVertical:   1,
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  authorText: {
    ...Typography.labelSm,
    color:     Colors.primary,
    fontSize:  9,
  },
  description: {
    ...Typography.bodySm,
    color:      Colors.onSurfaceVariant,
    lineHeight: 16,
  },

  // ── Footer ────────────────────────────────────────────────────
  footer: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap:           6,
  },
  price: {
    ...Typography.labelLg,
    color:    Colors.primary,
    fontSize: 15,
  },
  originalPrice: {
    ...Typography.bodySm,
    color:              Colors.outline,
    textDecorationLine: 'line-through',
  },
  actions: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  addBtn: {
    width:           34,
    height:          34,
    borderRadius:    Radius.full,
    backgroundColor: Colors.primaryContainer,
    justifyContent:  'center',
    alignItems:      'center',
  },
  addBtnActive: {
    backgroundColor: Colors.goldDark,
  },
  qtyText: {
    ...Typography.labelLg,
    color:    Colors.onPrimary,
    fontSize: 13,
  },
});

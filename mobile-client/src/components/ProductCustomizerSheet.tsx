// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — ProductCustomizerSheet
// Full-screen bottom sheet customizer for SommelierCards.
// Hero image + drink options (ice/citrus) + addon upsell + notes + sticky footer.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
} from 'react-native';
import { X, Heart, Plus, Minus, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors }     from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation }  from '../theme/elevation';

import type { ProductPublicDTO } from '../types/api';

interface ProductCustomizerSheetProps {
  visible: boolean;
  product: ProductPublicDTO | null;
  onClose: () => void;
  onConfirm: (product: ProductPublicDTO, quantity: number, notes: string) => void;
}

const ICE_OPTIONS   = ['Normal', 'Poco Hielo', 'Sin Hielo'] as const;
const CITRUS_OPTIONS = ['Limón', 'Naranja', 'Pomelo', 'Sin Cítrico'] as const;
const SUGGESTION_CHIPS = ['Sin azúcar', 'Sin gluten', 'Poco hielo extra'] as const;

const ADDON_OPTIONS = [
  { id: 'papas',   label: 'Papas Rústicas con Alioli', price: 4200 },
  { id: 'pinchos', label: 'Pinchos de Aceitunas',      price: 3800 },
] as const;

export const ProductCustomizerSheet: React.FC<ProductCustomizerSheetProps> = ({
  visible,
  product,
  onClose,
  onConfirm,
}) => {
  const [quantity,       setQuantity]       = useState(1);
  const [iceChoice,      setIceChoice]      = useState<string>('Normal');
  const [citrusChoice,   setCitrusChoice]   = useState<string>('Limón');
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [freeText,       setFreeText]       = useState('');

  if (!product) return null;

  const isDrink = product.type === 'drink';

  // ── Computed notes ───────────────────────────────────────────
  const buildNotes = (): string => {
    const parts: string[] = [];
    if (isDrink) {
      if (iceChoice !== 'Normal') parts.push(iceChoice);
      if (citrusChoice !== 'Limón') parts.push(citrusChoice);
    }
    selectedAddons.forEach((id) => {
      const a = ADDON_OPTIONS.find((o) => o.id === id);
      if (a) {
        const shortName = a.label.split(' con')[0].split(' de ')[0].trim();
        parts.push(`+${shortName}`);
      }
    });
    const bracketContent = parts.filter(Boolean).join(' | ');
    const bracket = bracketContent ? `[${bracketContent}]` : '';
    return [bracket, freeText].filter(Boolean).join(' ');
  };

  // ── Computed price ───────────────────────────────────────────
  const addonTotal = Array.from(selectedAddons).reduce((sum, id) => {
    const a = ADDON_OPTIONS.find((o) => o.id === id);
    return sum + (a?.price ?? 0);
  }, 0);
  const unitPrice  = (product.dynamicPrice ?? product.price ?? 0) + addonTotal;
  const totalPrice = unitPrice * quantity;

  // ── Handlers ─────────────────────────────────────────────────
  const toggleAddon = (id: string) => {
    Haptics.selectionAsync();
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    onConfirm(product, quantity, buildNotes());
    // Reset state
    setQuantity(1);
    setIceChoice('Normal');
    setCitrusChoice('Limón');
    setSelectedAddons(new Set());
    setFreeText('');
    onClose();
  };

  const addSuggestion = (chip: string) => {
    Haptics.selectionAsync();
    setFreeText((prev) => (prev ? `${prev}, ${chip}` : chip));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* ── Hero image ────────────────────────────────── */}
          {product.image ? (
            <View style={styles.heroWrap}>
              <Image
                source={{ uri: product.image }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              {/* Gradient simulation */}
              <View style={styles.heroGradientSolid} />
              <View style={styles.heroGradientFade} />
              {/* Close button */}
              <TouchableOpacity style={styles.heroCloseBtn} onPress={onClose}>
                <X size={20} color={Colors.onSurface} />
              </TouchableOpacity>
              {/* Heart */}
              <TouchableOpacity style={styles.heroHeartBtn}>
                <Heart size={18} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.heroPlaceholder}>
              <TouchableOpacity style={styles.heroCloseBtn} onPress={onClose}>
                <X size={20} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            style={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ── Info area ─────────────────────────────── */}
            <View style={styles.infoArea}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>
                ${(product.dynamicPrice ?? product.price).toLocaleString('es-AR')}
              </Text>
              {product.description ? (
                <Text style={styles.productDesc} numberOfLines={2}>
                  {product.description}
                </Text>
              ) : null}
              {/* Badges */}
              <View style={styles.badgeRow}>
                {isDrink && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>🍸 Trago</Text>
                  </View>
                )}
                {product.drinkStyle === 'author' && (
                  <View style={[styles.badge, styles.badgeAuthor]}>
                    <Text style={[styles.badgeText, { color: '#8B5CF6' }]}>✦ De Autor</Text>
                  </View>
                )}
                {product.dietaryRestrictions?.includes('vegan') && (
                  <View style={[styles.badge, styles.badgeVegan]}>
                    <Text style={[styles.badgeText, { color: Colors.success }]}>🌱 Vegano</Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── Drink options ─────────────────────────── */}
            {isDrink && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Hielo</Text>
                <View style={styles.chipRow}>
                  {ICE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.optChip, iceChoice === opt && styles.optChipSelected]}
                      onPress={() => { Haptics.selectionAsync(); setIceChoice(opt); }}
                    >
                      <Text style={[styles.optChipText, iceChoice === opt && styles.optChipTextSelected]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Cítrico</Text>
                <View style={styles.chipRow}>
                  {CITRUS_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.optChip, citrusChoice === opt && styles.optChipSelected]}
                      onPress={() => { Haptics.selectionAsync(); setCitrusChoice(opt); }}
                    >
                      <Text style={[styles.optChipText, citrusChoice === opt && styles.optChipTextSelected]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* ── Addons ───────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Acompañamientos</Text>
              {ADDON_OPTIONS.map((addon) => {
                const checked = selectedAddons.has(addon.id);
                return (
                  <TouchableOpacity
                    key={addon.id}
                    style={styles.addonRow}
                    onPress={() => toggleAddon(addon.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.addonInfo}>
                      <Text style={styles.addonLabel}>{addon.label}</Text>
                      <View style={styles.addonPriceBadge}>
                        <Text style={styles.addonPrice}>
                          +${addon.price.toLocaleString('es-AR')}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <Check size={14} color={Colors.primary} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Notes ───────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Notas especiales</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Alergias, instrucciones especiales..."
                placeholderTextColor={Colors.outline}
                value={freeText}
                onChangeText={setFreeText}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.suggestionRow}>
                {SUGGESTION_CHIPS.map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={styles.suggestionChip}
                    onPress={() => addSuggestion(chip)}
                  >
                    <Text style={styles.suggestionChipText}>+ {chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* ── Sticky footer ────────────────────────────── */}
          <View style={styles.footer}>
            {/* Stepper */}
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  if (quantity > 1) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setQuantity((q) => q - 1);
                  }
                }}
              >
                <Minus size={16} color={Colors.onSurface} />
              </TouchableOpacity>
              <Text style={styles.stepCount}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setQuantity((q) => q + 1);
                }}
              >
                <Plus size={16} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>

            {/* CTA button */}
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>
                AGREGAR AL PEDIDO · ${totalPrice.toLocaleString('es-AR')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surfaceContainer,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    maxHeight: '92%',
    overflow: 'hidden',
  },

  // ── Hero ────────────────────────────────────────────────────
  heroWrap: {
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradientSolid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#1d2027',
  },
  heroGradientFade: {
    position: 'absolute',
    bottom: '20%' as any,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(29, 32, 39, 0.75)',
  },
  heroCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(16,19,26,0.70)',
    borderRadius: Radius.full,
    padding: 8,
  },
  heroHeartBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(16,19,26,0.70)',
    borderRadius: Radius.full,
    padding: 8,
  },
  heroPlaceholder: {
    height: 60,
    position: 'relative',
    alignItems: 'flex-end',
    paddingTop: 12,
    paddingRight: 12,
  },

  // ── Scroll ───────────────────────────────────────────────────
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },

  // ── Info ─────────────────────────────────────────────────────
  infoArea: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  productName: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
  },
  productPrice: {
    ...Typography.priceLg,
    color: Colors.primary,
  },
  productDesc: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  badge: {
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  badgeAuthor: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderColor: 'rgba(139,92,246,0.30)',
  },
  badgeVegan: {
    backgroundColor: 'rgba(52,185,100,0.12)',
    borderColor: 'rgba(52,185,100,0.30)',
  },
  badgeText: {
    ...Typography.labelSm,
    color: Colors.primary,
    textTransform: 'none' as const,
  },

  // ── Section ──────────────────────────────────────────────────
  section: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.labelMd,
    color: Colors.onSurface,
    marginTop: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optChip: {
    paddingHorizontal: Spacing.smMd,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderColor: Colors.outlineVariant,
  },
  optChipSelected: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.primaryContainer,
  },
  optChipText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
    textTransform: 'none' as const,
  },
  optChipTextSelected: {
    color: Colors.primary,
  },

  // ── Addons ───────────────────────────────────────────────────
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224,226,236,0.06)',
  },
  addonInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  addonLabel: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    flex: 1,
  },
  addonPriceBadge: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  addonPrice: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    textTransform: 'none' as const,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.primaryContainer,
  },

  // ── Notes ────────────────────────────────────────────────────
  notesInput: {
    backgroundColor: Colors.surfaceContainerHigh,
    color: Colors.onSurface,
    borderRadius: Radius.md,
    padding: Spacing.smMd,
    ...Typography.bodyMd,
    minHeight: 60,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestionChip: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.smMd,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  suggestionChipText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
    textTransform: 'none' as const,
  },

  // ── Footer ───────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainer,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 6,
  },
  stepBtn: {
    padding: 10,
  },
  stepCount: {
    ...Typography.titleMd,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.sm,
  },
  ctaBtn: {
    flex: 1,
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    ...(Elevation.goldCTA as object),
  },
  ctaText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
  },
});

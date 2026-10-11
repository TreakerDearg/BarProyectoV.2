// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — ProductCustomizerSheet
// Bottom sheet full de personalización para SommelierCards.
// Hero con imagen (expo-image), opciones de trago (hielo/cítrico), upsell de
// acompañamientos, notas y footer fijo con CTA degradada.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Heart, Plus, Minus, Check, GlassWater, Sparkles, Leaf } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation }  from '../theme/elevation';
import { Gradients } from '../theme/gradients';
import { NBadge } from './shared/NBadge';

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
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
              {/* Overlay: imagen → canvas */}
              <LinearGradient
                {...Gradients.heroOverlay}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              {/* Close button */}
              <TouchableOpacity style={styles.heroCloseBtn} onPress={onClose} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
                <X size={20} color={Colors.onSurface} />
              </TouchableOpacity>
              {/* Heart */}
              <TouchableOpacity style={styles.heroHeartBtn}>
                <Heart size={18} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.heroPlaceholder}>
              <TouchableOpacity style={styles.heroCloseBtn} onPress={onClose} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
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
                  <NBadge
                    label="Trago"
                    tone="ember"
                    icon={<GlassWater size={11} color={Colors.primary} />}
                  />
                )}
                {product.drinkStyle === 'author' && (
                  <NBadge
                    label="De Autor"
                    tone="gold"
                    icon={<Sparkles size={11} color={NocturneColors.vipGold} />}
                  />
                )}
                {product.dietaryRestrictions?.includes('vegan') && (
                  <NBadge
                    label="Vegano"
                    tone="success"
                    icon={<Leaf size={11} color={Colors.success} />}
                  />
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
              <LinearGradient
                {...Gradients.emberCTA}
                style={styles.ctaGradient}
                pointerEvents="none"
              />
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
    backgroundColor: NocturneColors.overlayDark,
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
  heroCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: NocturneColors.overlayDark,
    borderRadius: Radius.full,
    padding: 8,
  },
  heroHeartBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: NocturneColors.overlayDark,
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
    borderColor: NocturneColors.borderSubtle,
  },
  optChipSelected: {
    backgroundColor: NocturneColors.emberMuted,
    borderColor: Colors.primary,
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
    borderBottomColor: NocturneColors.borderSubtle,
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
    borderColor: NocturneColors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: NocturneColors.emberMuted,
    borderColor: Colors.primary,
  },

  // ── Notes ────────────────────────────────────────────────────
  notesInput: {
    backgroundColor: Colors.surfaceContainerLow,
    color: Colors.onSurface,
    borderRadius: Radius.md,
    padding: Spacing.smMd,
    ...Typography.bodyMd,
    minHeight: 60,
    borderWidth: 1,
    borderColor: NocturneColors.borderSubtle,
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
    borderColor: NocturneColors.borderSubtle,
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
    borderTopColor: NocturneColors.borderSubtle,
    backgroundColor: Colors.surfaceContainer,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NocturneColors.borderSubtle,
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
    overflow: 'hidden',
    ...(Elevation.emberCTA as object),
  },
  ctaGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ctaText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — ResultBottomSheet (v1)
// Sheet de resultado con dos snap points: COMPACT (~30%) y EXPANDED (~75%).
// Gesture: Gesture.Pan() de react-native-gesture-handler 2.x + GestureDetector.
// Animaciones: Reanimated 4 worklets.
//
// Snap COMPACT  : drag handle + rarity badge + nombre del trago
// Snap EXPANDED : todo lo anterior + método + receta + acciones + pity + historial
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Martini, RotateCw, Ticket, ChevronDown } from 'lucide-react-native';

import { Colors, NocturneColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { NButton } from '../shared/NButton';
import { RarityIcon, RARITY_ICON_COLOR, RARITY_LABEL } from '../shared/RarityIcon';
import type { RouletteDrinkDTO } from '../../types/api';
import type { SpinHistoryItem, PityStats, SpinState } from '../../types/roulette';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Posición Y del sheet desde el top de la pantalla
const SNAP_HIDDEN   = SCREEN_HEIGHT + 20;
const SNAP_COMPACT  = SCREEN_HEIGHT * 0.70;
const SNAP_EXPANDED = SCREEN_HEIGHT * 0.25;

const SPRING_CFG = { damping: 18, stiffness: 120, mass: 1 } as const;

const RARITY_CONFIG = {
  COMMON:    { border: Colors.outline,         label: Colors.outline,                      glow: 'rgba(158,140,123,0.40)', badgeBg: Colors.surfaceContainerHigh,  badgeText: Colors.outline },
  RARE:      { border: Colors.info,            label: Colors.info,                         glow: 'rgba(90,184,232,0.40)',  badgeBg: NocturneColors.infoMuted,     badgeText: Colors.info },
  EPIC:      { border: Colors.wine,            label: NocturneColors.onSecondaryContainer, glow: NocturneColors.wineGlow, badgeBg: NocturneColors.wineMuted,     badgeText: NocturneColors.onSecondaryContainer },
  LEGENDARY: { border: NocturneColors.vipGold, label: NocturneColors.vipGold,              glow: NocturneColors.vipGoldGlowStrong, badgeBg: NocturneColors.vipGoldMuted, badgeText: NocturneColors.vipGold },
} as const;

const PITY_THRESHOLDS = { RARE: 10, EPIC: 25, LEGENDARY: 50 } as const;
const PITY_NEXT: Record<string, keyof typeof PITY_THRESHOLDS> = {
  COMMON:    'RARE',
  RARE:      'EPIC',
  EPIC:      'LEGENDARY',
  LEGENDARY: 'LEGENDARY',
};

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// ── PityHint ──────────────────────────────────────────────────────────────────
interface PityHintProps {
  pityStats:     PityStats;
  currentRarity: string;
}

function PityHint({ pityStats, currentRarity }: PityHintProps) {
  const nextRarity = PITY_NEXT[currentRarity] ?? 'RARE';
  if (currentRarity === 'LEGENDARY') return null;

  const pityMap: Record<string, number> = {
    RARE:      pityStats.spinsSinceRare,
    EPIC:      pityStats.spinsSinceEpic,
    LEGENDARY: pityStats.spinsSinceLegendary,
  };

  const since     = pityMap[nextRarity] ?? 0;
  const threshold = PITY_THRESHOLDS[nextRarity as keyof typeof PITY_THRESHOLDS] ?? 10;
  const pct       = Math.min(1, since / threshold);
  const remaining = threshold - since;
  const col       = RARITY_ICON_COLOR[nextRarity as keyof typeof RARITY_ICON_COLOR] ?? Colors.outline;

  // Barra animada al montar
  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withTiming(pct * 100, { duration: 800 });
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  return (
    <View style={styles.pityHint}>
      <View style={styles.pityHintHeader}>
        <RarityIcon rarity={nextRarity} size={13} />
        <Text style={[styles.pityHintLabel, pct >= 0.8 && { color: col }]}>
          {remaining <= 0
            ? `¡Próxima tirada puede ser ${nextRarity}!`
            : `Faltan ${remaining} spin${remaining !== 1 ? 's' : ''} para ${nextRarity}`}
        </Text>
      </View>
      <View style={styles.pityTrack}>
        <Animated.View style={[styles.pityBar, { backgroundColor: col }, barStyle]} />
      </View>
      <Text style={styles.pitySubLabel}>{since}/{threshold} tiradas sin {nextRarity}</Text>
    </View>
  );
}

// ── ResultBottomSheet ─────────────────────────────────────────────────────────
interface ResultBottomSheetProps {
  drink:              RouletteDrinkDTO | null;
  spinState:          SpinState;
  onSpin:             () => void;
  onAddToCart:        () => void;
  onGenerateTicket:   () => void;
  isGeneratingTicket: boolean;
  tableId:            string | null;
  history:            SpinHistoryItem[];
  pityStats:          PityStats | null;
}

export const ResultBottomSheet: React.FC<ResultBottomSheetProps> = ({
  drink,
  spinState,
  onSpin,
  onAddToCart,
  onGenerateTicket,
  isGeneratingTicket,
  tableId,
  history,
  pityStats,
}) => {
  const translateY = useSharedValue(SNAP_HIDDEN);

  const [isExpanded,    setIsExpanded]    = useState(false);
  const [isRecipeOpen,  setIsRecipeOpen]  = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // ── Abrir / cerrar según spinState ────────────────────────────────────────
  useEffect(() => {
    if (spinState === 'result') {
      translateY.value = withSpring(SNAP_COMPACT, { damping: 18, stiffness: 120, mass: 1 });
      setIsExpanded(false);
      setIsRecipeOpen(false);
      setIsHistoryOpen(false);
    } else if (spinState === 'idle' || spinState === 'spinning') {
      translateY.value = withSpring(SNAP_HIDDEN, { damping: 18, stiffness: 120, mass: 1 });
      setIsExpanded(false);
    }
  }, [spinState]);

  // ── Helpers para JS callbacks desde worklets ──────────────────────────────
  const setExpandedTrue  = useCallback(() => setIsExpanded(true),  []);
  const setExpandedFalse = useCallback(() => setIsExpanded(false), []);

  // ── Pan gesture ───────────────────────────────────────────────────────────
  const startY  = useSharedValue(0);
  const midPoint = (SNAP_COMPACT + SNAP_EXPANDED) / 2;

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = startY.value + e.translationY;
      translateY.value = Math.max(SNAP_EXPANDED, Math.min(SNAP_COMPACT, next));
    })
    .onEnd((e) => {
      if (e.velocityY < -500 || translateY.value < midPoint) {
        translateY.value = withSpring(SNAP_EXPANDED, { damping: 18, stiffness: 120, mass: 1 });
        runOnJS(setExpandedTrue)();
      } else {
        translateY.value = withSpring(SNAP_COMPACT, { damping: 18, stiffness: 120, mass: 1 });
        runOnJS(setExpandedFalse)();
      }
    });

  // ── Animated styles ───────────────────────────────────────────────────────
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [SNAP_EXPANDED, SNAP_COMPACT, SNAP_HIDDEN],
      [0.4, 0.15, 0],
      Extrapolation.CLAMP,
    ),
  }));

  // ── Derived ───────────────────────────────────────────────────────────────
  const rarityConf = RARITY_CONFIG[(drink?.rarity as keyof typeof RARITY_CONFIG) ?? 'COMMON']
    ?? RARITY_CONFIG.COMMON;
  const isEpicPlus = drink?.rarity === 'EPIC' || drink?.rarity === 'LEGENDARY';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop semitransparente */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        pointerEvents="none"
      />

      {/* Sheet principal */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { borderColor: rarityConf.border, shadowColor: rarityConf.glow },
          ]}
          accessibilityViewIsModal={isExpanded}
        >
          {/* Drag handle */}
          <View
            style={styles.dragHandleWrapper}
            accessibilityRole="adjustable"
            accessibilityLabel="Arrastrá para ver más detalles"
          >
            <View style={styles.dragHandle} />
          </View>

          {/* ── Contenido COMPACT (siempre visible) ── */}
          <View style={styles.compactContent}>
            <View style={[styles.rarityBadge, { backgroundColor: rarityConf.badgeBg }]}>
              <RarityIcon rarity={drink?.rarity ?? 'COMMON'} size={14} color={rarityConf.badgeText} />
              <Text style={[styles.rarityBadgeText, { color: rarityConf.badgeText }]}>
                {RARITY_LABEL[(drink?.rarity as keyof typeof RARITY_LABEL)] ?? drink?.rarity}
              </Text>
            </View>

            <Text
              style={[isEpicPlus ? styles.drinkNameLg : styles.drinkNameSm, { color: rarityConf.label }]}
              numberOfLines={2}
            >
              {drink?.name ?? ''}
            </Text>

            {drink?.recipe?.method && (
              <Text style={styles.drinkMethod} numberOfLines={isExpanded ? undefined : 2}>
                {drink.recipe.method}
              </Text>
            )}
          </View>

          {/* ── Contenido EXPANDED ── */}
          {isExpanded && (
            <ScrollView
              style={styles.expandedScroll}
              contentContainerStyle={styles.expandedContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Receta */}
              {drink?.recipe?.ingredients && drink.recipe.ingredients.length > 0 && (
                <View style={styles.section}>
                  <TouchableOpacity
                    style={styles.accordionToggle}
                    onPress={() => setIsRecipeOpen(v => !v)}
                    accessibilityRole="button"
                    accessibilityLabel="Ver receta del bartender"
                    accessibilityState={{ expanded: isRecipeOpen }}
                  >
                    <Text style={styles.accordionToggleText}>Ver receta del bartender</Text>
                    <ChevronDown
                      size={18}
                      color={Colors.onSurfaceVariant}
                      style={{ transform: [{ rotate: isRecipeOpen ? '180deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>
                  {isRecipeOpen && (
                    <View style={styles.recipeBody}>
                      {drink.recipe.ingredients.map((ing, idx) => (
                        <Text key={idx} style={styles.ingredientText}>
                          {'\u2022'} {ing.name} — {ing.quantity} {ing.unit}
                        </Text>
                      ))}
                      {drink.recipe.drinkStyle && (
                        <View style={styles.drinkStyleBadge}>
                          <Text style={styles.drinkStyleText}>{drink.recipe.drinkStyle}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Acciones */}
              <View style={styles.actionSection}>
                {tableId ? (
                  <>
                    <NButton
                      label="Pedir este trago"
                      icon={<Martini size={18} color={Colors.onPrimary} />}
                      onPress={onAddToCart}
                      fullWidth
                      size="lg"
                    />
                    <NButton
                      label="Volver a tirar"
                      icon={<RotateCw size={18} color={Colors.primary} />}
                      onPress={onSpin}
                      variant="ghost"
                      fullWidth
                    />
                  </>
                ) : (
                  <NButton
                    label="Volver a tirar"
                    icon={<RotateCw size={18} color={Colors.onPrimary} />}
                    onPress={onSpin}
                    fullWidth
                    size="lg"
                  />
                )}
                <NButton
                  label="Generar Ticket VIP"
                  icon={<Ticket size={18} color={Colors.primary} />}
                  onPress={onGenerateTicket}
                  loading={isGeneratingTicket}
                  variant="ghost"
                  fullWidth
                />
              </View>

              {/* Pity hint */}
              {pityStats && drink && (
                <PityHint pityStats={pityStats} currentRarity={drink.rarity} />
              )}

              {/* Historial */}
              {history.length > 0 && (
                <View style={styles.section}>
                  <TouchableOpacity
                    style={styles.accordionToggle}
                    onPress={() => setIsHistoryOpen(v => !v)}
                    accessibilityRole="button"
                    accessibilityLabel="Ver historial de tiradas"
                    accessibilityState={{ expanded: isHistoryOpen }}
                  >
                    <Text style={styles.accordionToggleText}>Historial ({history.length})</Text>
                    <ChevronDown
                      size={16}
                      color={Colors.onSurfaceVariant}
                      style={{ transform: [{ rotate: isHistoryOpen ? '180deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>
                  {isHistoryOpen && history.map((item) => {
                    const rCfg = RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG]
                      ?? RARITY_CONFIG.COMMON;
                    return (
                      <View key={item.id} style={styles.historyItem}>
                        <RarityIcon rarity={item.rarity} size={14} />
                        <Text style={styles.historyItemName} numberOfLines={1}>{item.name}</Text>
                        <View style={[styles.historyRarityBadge, { backgroundColor: rCfg.badgeBg }]}>
                          <Text style={[styles.historyRarityText, { color: rCfg.badgeText }]}>
                            {item.rarity}
                          </Text>
                        </View>
                        <Text style={styles.historyTime}>{fmtTime(item.timestamp)}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          )}

          {/* Hint de expand (solo compact) */}
          {!isExpanded && spinState === 'result' && (
            <View style={styles.expandHint}>
              <ChevronDown size={16} color={Colors.outline} />
              <Text style={styles.expandHintText}>Arrastrá para ver receta y acciones</Text>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </>
  );
};

export default ResultBottomSheet;

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
    zIndex:          10,
  },
  sheet: {
    position:             'absolute',
    left:                  0,
    right:                 0,
    bottom:                0,
    height:                SCREEN_HEIGHT,
    backgroundColor:       Colors.surfaceContainer,
    borderTopLeftRadius:   Radius.xxl,
    borderTopRightRadius:  Radius.xxl,
    borderWidth:           1,
    borderBottomWidth:     0,
    zIndex:                20,
    shadowOffset:          { width: 0, height: -4 },
    shadowOpacity:         0.4,
    shadowRadius:          16,
    elevation:             12,
  },
  dragHandleWrapper: {
    alignItems:    'center',
    paddingTop:    Spacing.smMd,
    paddingBottom: Spacing.sm,
  },
  dragHandle: {
    width:           40,
    height:          4,
    borderRadius:    Radius.full,
    backgroundColor: NocturneColors.outlineVariant,
  },
  compactContent: {
    paddingHorizontal: Spacing.gutter,
    paddingBottom:     Spacing.md,
    gap:               Spacing.sm,
  },
  rarityBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    alignSelf:         'flex-start',
    borderRadius:      Radius.full,
    paddingHorizontal: Spacing.smMd,
    paddingVertical:   Spacing.xs,
  },
  rarityBadgeText: {
    ...Typography.labelMd,
    textTransform: 'none' as const,
  },
  drinkNameLg: {
    ...Typography.displayLg,
  },
  drinkNameSm: {
    ...Typography.displaySm,
  },
  drinkMethod: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  expandHint: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing.xs,
    paddingBottom:  Spacing.md,
    opacity:        0.6,
  },
  expandHintText: {
    ...Typography.labelSm,
    color:         Colors.outline,
    textTransform: 'none' as const,
  },
  expandedScroll: {
    flex: 1,
  },
  expandedContent: {
    paddingHorizontal: Spacing.gutter,
    paddingBottom:     Spacing.xxxl,
    gap:               Spacing.lg,
  },
  // ── Secciones ────────────────────────────────────────────────
  section: {
    borderTopWidth: 1,
    borderTopColor: NocturneColors.borderSubtle,
    paddingTop:     Spacing.sm,
    gap:            Spacing.sm,
  },
  accordionToggle: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingVertical: Spacing.xs,
  },
  accordionToggleText: {
    ...Typography.labelMd,
    color:         Colors.onSurfaceVariant,
    textTransform: 'none' as const,
  },
  recipeBody: {
    gap:             Spacing.xs,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.md,
    padding:         Spacing.smMd,
  },
  ingredientText: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  drinkStyleBadge: {
    alignSelf:         'flex-start',
    backgroundColor:   Colors.emberMuted,
    borderRadius:      Radius.full,
    paddingHorizontal: Spacing.smMd,
    paddingVertical:   3,
    marginTop:         Spacing.xs,
    borderWidth:       1,
    borderColor:       Colors.emberBorder,
  },
  drinkStyleText: {
    ...Typography.labelSm,
    color: Colors.primary,
  },
  // ── Acciones ─────────────────────────────────────────────────
  actionSection: {
    gap: Spacing.sm,
  },
  // ── Pity hint ────────────────────────────────────────────────
  pityHint: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  pityHintHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  pityHintLabel: {
    ...Typography.labelMd,
    color:         Colors.onSurface,
    textTransform: 'none' as const,
    flex:          1,
  },
  pityTrack: {
    height:          6,
    backgroundColor: NocturneColors.surfaceContainerHighest,
    borderRadius:    Radius.full,
    overflow:        'hidden',
  },
  pityBar: {
    height:       '100%',
    borderRadius: Radius.full,
  },
  pitySubLabel: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  // ── Historial ────────────────────────────────────────────────
  historyItem: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth:  1,
    borderTopColor:  NocturneColors.borderSubtle,
  },
  historyItemName: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    flex:  1,
  },
  historyRarityBadge: {
    borderRadius:      Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical:   2,
  },
  historyRarityText: {
    ...Typography.labelSm,
    fontSize:      9,
    textTransform: 'none' as const,
  },
  historyTime: {
    ...Typography.bodySm,
    color: Colors.outline,
  },
});

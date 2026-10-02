// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — RouletteScreen (Phase 2 redesign)
// States: idle → spinning → result
// Rarity: COMMON / RARE / EPIC / LEGENDARY with unique styling
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, RotateCw, ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation } from '../theme/elevation';

import { getPublicRouletteDrinks, spinPublicRoulette } from '../api/rouletteApi';
import { getErrorMessage } from '../api/client';
import { useCartStore } from '../stores/useCartStore';
import { useSessionStore } from '../stores/useSessionStore';
import { NToast } from '../components/shared/NToast';
import { NButton } from '../components/shared/NButton';

import type { RouletteDrinkDTO } from '../types/api';
import type { RootTabParamList } from '../navigation/types';

// ── Types ────────────────────────────────────────────────────────────────────
type SpinState = 'idle' | 'spinning' | 'result';

interface SpinHistoryItem {
  id:        string;
  name:      string;
  rarity:    string;
  timestamp: Date;
}

// ── Rarity config ─────────────────────────────────────────────────────────────
const RARITY_CONFIG = {
  COMMON:    { border: '#9b8f7d', label: Colors.outline,          glow: 'rgba(155,143,125,0.25)', emoji: '⚪', badgeBg: Colors.surfaceContainerHigh, badgeText: Colors.outline    },
  RARE:      { border: '#38BDF8', label: Colors.info,             glow: 'rgba(56,189,248,0.25)',  emoji: '🔵', badgeBg: NocturneColors.infoMuted,     badgeText: Colors.info       },
  EPIC:      { border: '#a855f7', label: '#a855f7',               glow: 'rgba(168,85,247,0.25)',  emoji: '🟣', badgeBg: 'rgba(168,85,247,0.12)',       badgeText: '#a855f7'         },
  LEGENDARY: { border: Colors.primary, label: Colors.primary,     glow: NocturneColors.goldGlowStrong, emoji: '⭐', badgeBg: Colors.goldMuted, badgeText: Colors.primary },
} as const;

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

interface RouletteScreenProps {
  onClose: () => void;
}

export const RouletteScreen: React.FC<RouletteScreenProps> = ({ onClose }) => {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { tableId } = useSessionStore();

  // ── State ─────────────────────────────────────────────────────
  const [spinState,    setSpinState]    = useState<SpinState>('idle');
  const [drinks,       setDrinks]       = useState<RouletteDrinkDTO[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<RouletteDrinkDTO | null>(null);
  const [cyclingName,  setCyclingName]  = useState('');
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [history,      setHistory]      = useState<SpinHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMsg,     setToastMsg]     = useState<string | null>(null);

  // ── Animation refs ────────────────────────────────────────────
  const rotateAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim    = useRef(new Animated.Value(0.7)).current;
  const opacityAnim  = useRef(new Animated.Value(0)).current;
  const chevronAnim  = useRef(new Animated.Value(0)).current;
  const rotLoopRef   = useRef<Animated.CompositeAnimation | null>(null);
  const cycleIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load drinks ───────────────────────────────────────────────
  useEffect(() => {
    getPublicRouletteDrinks()
      .then(setDrinks)
      .catch((e) => console.warn('[Roulette] Error cargando tragos:', e));
  }, []);

  // ── Recipe toggle animation ───────────────────────────────────
  const toggleRecipe = () => {
    const next = !isRecipeOpen;
    setIsRecipeOpen(next);
    Animated.timing(chevronAnim, {
      toValue: next ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // ── Spin handler ──────────────────────────────────────────────
  const handleSpin = async () => {
    if (spinState === 'spinning') return;
    // Reset
    rotateAnim.setValue(0);
    scaleAnim.setValue(0.7);
    opacityAnim.setValue(0);
    setSelectedDrink(null);
    setSpinState('spinning');
    setIsRecipeOpen(false);
    chevronAnim.setValue(0);

    // Haptics
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
    let hapticCount = 0;
    hapticIntervalRef.current = setInterval(() => {
      if (hapticCount >= 20) { clearInterval(hapticIntervalRef.current!); return; }
      hapticCount++;
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    }, 80);

    // Border rotation loop
    rotLoopRef.current = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotLoopRef.current.start();

    // Name cycling
    if (drinks.length > 0) {
      cycleIntervalRef.current = setInterval(() => {
        setCyclingName(drinks[Math.floor(Math.random() * drinks.length)].name);
      }, 80);
    }

    try {
      const res = await spinPublicRoulette();
      // Stop intervals
      rotLoopRef.current?.stop();
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
      if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);

      setSelectedDrink(res.selected);
      setSpinState('result');

      // Reveal animation
      Animated.parallel([
        Animated.spring(scaleAnim,  { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();

      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}

      // Add to history
      setHistory((prev) => [
        { id: res.selected._id + Date.now(), name: res.selected.name, rarity: res.selected.rarity, timestamp: new Date() },
        ...prev,
      ].slice(0, 5));
    } catch (err) {
      rotLoopRef.current?.stop();
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
      if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
      setSpinState('idle');
      Alert.alert('Error en la Ruleta', getErrorMessage(err));
    }
  };

  const handleAddToCart = () => {
    if (!selectedDrink) return;
    if (!tableId) {
      Alert.alert(
        'Conectá tu mesa',
        'Necesitás una mesa para pedir. Podés hacerlo desde Pedidos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir a Pedidos', onPress: () => { onClose(); navigation.navigate('Pedidos'); } },
        ]
      );
      return;
    }
    useCartStore.getState().addToCart({
      productId: selectedDrink._id,
      name:      selectedDrink.name,
      price:     0,
      image:     undefined,
      notes:     `Ruleta Nebula — ${selectedDrink.rarity}`,
      quantity:  1,
    });
    setToastMsg('Agregado al pedido');
    navigation.navigate('Pedidos');
  };

  // ── Derived values ────────────────────────────────────────────
  const rarityConf = selectedDrink
    ? (RARITY_CONFIG[selectedDrink.rarity as keyof typeof RARITY_CONFIG] ?? RARITY_CONFIG.COMMON)
    : RARITY_CONFIG.COMMON;

  const rotateDeg = rotateAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const chevronRot = chevronAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const circleBorderColor = spinState === 'result' ? rarityConf.border : Colors.primary;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <NToast
        visible={!!toastMsg}
        message={toastMsg ?? ''}
        variant="success"
        onHide={() => setToastMsg(null)}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <RotateCw size={20} color={Colors.primary} />
          <Text style={styles.headerTitle}>Ruleta Nebula</Text>
          <View style={styles.prizeHeader}>
            <Text style={styles.prizeHeaderText}>PREMIO AL INSTANTE</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={22} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero circle ───────────────────────────────── */}
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.circleOuter,
              {
                borderColor: circleBorderColor,
                shadowColor: spinState === 'result' ? rarityConf.glow : Colors.goldGlow,
                transform: spinState === 'spinning' ? [{ rotate: rotateDeg }] : [],
              },
            ]}
          >
            <View style={styles.circleInner}>
              <RotateCw
                size={48}
                color={spinState === 'spinning' ? Colors.primary : rarityConf.label}
              />
              <Text style={[styles.circleLabel, { color: rarityConf.label }]}>
                {spinState === 'idle'
                  ? 'NEBULA'
                  : spinState === 'spinning'
                  ? (cyclingName || '...')
                  : (selectedDrink?.name ?? 'NEBULA')}
              </Text>
            </View>
          </Animated.View>

          {/* Pool count */}
          <Text style={styles.poolCount}>
            {drinks.length} tragos en el pool
          </Text>
        </View>

        {/* ── Result card ───────────────────────────────── */}
        {spinState === 'result' && selectedDrink && (
          <Animated.View
            style={[styles.resultCard, {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
              borderColor: rarityConf.border,
              shadowColor: rarityConf.glow,
            }]}
          >
            {/* Rarity badge */}
            <View style={[styles.rarityBadge, { backgroundColor: rarityConf.badgeBg }]}>
              <Text style={[styles.rarityBadgeText, { color: rarityConf.badgeText }]}>
                {rarityConf.emoji} {selectedDrink.rarity}
              </Text>
            </View>

            {/* Drink name */}
            <Text style={[styles.drinkName, { color: rarityConf.label }]}>
              {selectedDrink.name}
            </Text>

            {/* Description */}
            {selectedDrink.recipe?.method && (
              <Text style={styles.drinkDesc}>{selectedDrink.recipe.method}</Text>
            )}

            {/* Recipe toggle */}
            {selectedDrink.recipe?.ingredients && selectedDrink.recipe.ingredients.length > 0 && (
              <View style={styles.recipeSection}>
                <TouchableOpacity style={styles.recipeToggle} onPress={toggleRecipe}>
                  <Text style={styles.recipeToggleText}>Ver receta del bartender</Text>
                  <Animated.View style={{ transform: [{ rotate: chevronRot }] }}>
                    <ChevronDown size={18} color={Colors.onSurfaceVariant} />
                  </Animated.View>
                </TouchableOpacity>
                {isRecipeOpen && (
                  <View style={styles.recipeBody}>
                    {selectedDrink.recipe.ingredients.map((ing, idx) => (
                      <Text key={idx} style={styles.ingredientText}>
                        • {ing.name} — {ing.quantity} {ing.unit}
                      </Text>
                    ))}
                    {selectedDrink.recipe.drinkStyle && (
                      <View style={styles.drinkStyleBadge}>
                        <Text style={styles.drinkStyleText}>{selectedDrink.recipe.drinkStyle}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.resultActions}>
              <NButton
                label="🎲 Volver a tirar"
                onPress={handleSpin}
                fullWidth
                size="lg"
              />
              {tableId && (
                <NButton
                  label="🍸 Pedir este trago"
                  onPress={handleAddToCart}
                  variant="ghost"
                  fullWidth
                />
              )}
              <TouchableOpacity
                style={styles.historyToggleBtn}
                onPress={() => setIsHistoryOpen(!isHistoryOpen)}
              >
                <Text style={styles.historyToggleText}>
                  Ver historial ({history.length})
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* ── History section ───────────────────────────── */}
        {(isHistoryOpen || history.length > 0) && (
          <View style={styles.historySection}>
            <TouchableOpacity
              style={styles.historyHeader}
              onPress={() => setIsHistoryOpen(!isHistoryOpen)}
            >
              <Text style={styles.historyTitle}>Historial de tiradas ({history.length})</Text>
              <ChevronDown size={16} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
            {isHistoryOpen && history.map((item) => {
              const rCfg = RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG] ?? RARITY_CONFIG.COMMON;
              return (
                <View key={item.id} style={styles.historyItem}>
                  <Text style={styles.historyItemName}>{item.name}</Text>
                  <View style={[styles.historyRarityBadge, { backgroundColor: rCfg.badgeBg }]}>
                    <Text style={[styles.historyRarityText, { color: rCfg.badgeText }]}>
                      {rCfg.emoji} {item.rarity}
                    </Text>
                  </View>
                  <Text style={styles.historyTime}>{fmtTime(item.timestamp)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Footer ────────────────────────────────────── */}
      {spinState !== 'result' && (
        <View style={styles.footer}>
          <NButton
            label={spinState === 'spinning' ? 'Girando...' : 'GIRAR AHORA'}
            onPress={handleSpin}
            loading={spinState === 'spinning'}
            fullWidth
            size="lg"
            icon={spinState === 'idle' ? <RotateCw size={20} color={Colors.onPrimary} /> : undefined}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: Spacing.gutter,
    paddingVertical:   Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
    flex:          1,
  },
  headerTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
  },
  prizeHeader: {
    backgroundColor: Colors.goldMuted,
    borderRadius:    Radius.xs,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  prizeHeaderText: {
    ...Typography.labelSm,
    color: Colors.primary,
  },
  closeBtn: { padding: 6 },

  scroll: { flex: 1 },
  scrollContent: {
    padding:    Spacing.gutter,
    gap:        Spacing.lg,
    alignItems: 'center',
    paddingBottom: Spacing.xxxl,
  },

  // ── Hero circle ──────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    gap:        Spacing.md,
    marginTop:  Spacing.md,
  },
  circleOuter: {
    width:        220,
    height:       220,
    borderRadius: 110,
    borderWidth:  2,
    justifyContent: 'center',
    alignItems:   'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation:    10,
    backgroundColor: Colors.surfaceContainer,
  },
  circleInner: {
    alignItems: 'center',
    gap:        Spacing.sm,
  },
  circleLabel: {
    ...Typography.labelMd,
    color:        Colors.primary,
    letterSpacing: 2,
    textAlign:    'center',
    maxWidth:     160,
  },
  poolCount: {
    ...Typography.bodySm,
    color: Colors.outline,
  },

  // ── Result card ──────────────────────────────────────────────
  resultCard: {
    width:           '100%',
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.xl,
    padding:         Spacing.lg,
    borderWidth:     1,
    gap:             Spacing.sm,
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.4,
    shadowRadius:    16,
    elevation:       8,
  },
  rarityBadge: {
    alignSelf:       'flex-start',
    borderRadius:    Radius.full,
    paddingHorizontal: 12,
    paddingVertical:   4,
  },
  rarityBadgeText: {
    ...Typography.labelMd,
    textTransform: 'none' as const,
  },
  drinkName: {
    fontFamily:    'Outfit_600SemiBold',
    fontSize:      26,
    lineHeight:    32,
    letterSpacing: -0.26,
  },
  drinkDesc: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },

  // Recipe
  recipeSection: {
    borderTopWidth:  1,
    borderTopColor:  'rgba(224,226,236,0.08)',
    paddingTop:      Spacing.sm,
    marginTop:       Spacing.xs,
    gap:             Spacing.sm,
  },
  recipeToggle: {
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'space-between',
  },
  recipeToggleText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
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
    alignSelf:       'flex-start',
    backgroundColor: Colors.goldMuted,
    borderRadius:    Radius.full,
    paddingHorizontal: 10,
    paddingVertical:   3,
    marginTop:       Spacing.xs,
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  drinkStyleText: {
    ...Typography.labelSm,
    color: Colors.primary,
  },

  // Result actions
  resultActions: {
    gap:       Spacing.sm,
    marginTop: Spacing.sm,
  },
  historyToggleBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  historyToggleText: {
    ...Typography.labelMd,
    color: Colors.outline,
    textTransform: 'none' as const,
  },

  // History
  historySection: {
    width:           '100%',
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     'rgba(224,226,236,0.06)',
    overflow:        'hidden',
  },
  historyHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        Spacing.smMd,
  },
  historyTitle: {
    ...Typography.labelMd,
    color: Colors.onSurface,
    textTransform: 'none' as const,
  },
  historyItem: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.sm,
    paddingHorizontal: Spacing.smMd,
    paddingVertical:   Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(224,226,236,0.05)',
  },
  historyItemName: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    flex:  1,
  },
  historyRarityBadge: {
    borderRadius:    Radius.full,
    paddingHorizontal: 8,
    paddingVertical:   2,
  },
  historyRarityText: {
    ...Typography.labelSm,
    textTransform: 'none' as const,
  },
  historyTime: {
    ...Typography.bodySm,
    color: Colors.outline,
  },

  // Footer
  footer: {
    padding:        Spacing.gutter,
    paddingBottom:  Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
});

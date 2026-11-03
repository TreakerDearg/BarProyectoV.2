// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — RouletteScreen (v3 — Reanimated + BottomSheet)
//
// Layout:
//   ├── X flotante (posición absoluta top-right)
//   ├── heroSection (rueda protagonista, ocupa ~65% en idle)
//   │   ├── MobileWheel (Reanimated SharedValue)
//   │   ├── rarityCountRow (chips, solo idle)
//   │   └── chip "PREMIO AL INSTANTE" (solo idle)
//   ├── Footer CTA sticky (solo idle/spinning/revealing)
//   ├── ResultBottomSheet (emerge al resultado)
//   ├── RevealExplosion (partículas Reanimated)
//   └── GoldenTicket Modal
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, RotateCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

import {
  getPublicRouletteDrinks,
  spinPublicRoulette,
  generateRouletteTicket,
  getMyRouletteStats,
} from '../api/rouletteApi';
import { getErrorMessage }  from '../api/client';
import { useCartStore }     from '../stores/useCartStore';
import { useSessionStore }  from '../stores/useSessionStore';
import { usePointsStore }   from '../stores/usePointsStore';

import { NToast }             from '../components/shared/NToast';
import { NButton }            from '../components/shared/NButton';
import { RarityIcon, RARITY_ICON_COLOR } from '../components/shared/RarityIcon';
import { MobileWheel }        from '../components/roulette/MobileWheel';
import { GoldenTicket }       from '../components/roulette/GoldenTicket';
import { RevealExplosion }    from '../components/roulette/RevealExplosion';
import { ResultBottomSheet }  from '../components/roulette/ResultBottomSheet';

import { calculateTargetAngle } from '../utils/rouletteAngle';
import type { RouletteDrinkDTO } from '../types/api';
import type { RootTabParamList } from '../navigation/types';
import type { SpinState, SpinHistoryItem, PityStats } from '../types/roulette';

interface RouletteScreenProps { onClose: () => void; }

export const RouletteScreen: React.FC<RouletteScreenProps> = ({ onClose }) => {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { tableId }    = useSessionStore();
  const { height }     = useResponsiveLayout();
  const insets         = useSafeAreaInsets();
  const reduceMotion   = useReducedMotion();

  // ── State ─────────────────────────────────────────────────────────────────
  const [spinState,     setSpinState]     = useState<SpinState>('idle');
  const [drinks,        setDrinks]        = useState<RouletteDrinkDTO[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<RouletteDrinkDTO | null>(null);
  const [history,       setHistory]       = useState<SpinHistoryItem[]>([]);
  const [toastMsg,      setToastMsg]      = useState<string | null>(null);
  const [ticketData,    setTicketData]    = useState<{ ticket: string; expiresAt: number } | null>(null);
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);
  const [countdown,     setCountdown]     = useState<number | null>(null);
  const [showExplosion, setShowExplosion] = useState(false);
  const [pityStats,     setPityStats]     = useState<PityStats | null>(null);
  const [wheelOriginY,  setWheelOriginY]  = useState(height * 0.32);

  // ── Reanimated: spinDeg (SharedValue — crece continuamente) ───────────────
  const spinDeg = useSharedValue(0);

  // ── Reanimated: countdown ─────────────────────────────────────────────────
  const countdownScale   = useSharedValue(0.5);
  const countdownOpacity = useSharedValue(0);

  // ── Reanimated: bg tint EPIC/LEGENDARY ───────────────────────────────────
  const bgTintOpacity = useSharedValue(0);

  const bgTintStyle = useAnimatedStyle(() => ({
    opacity: bgTintOpacity.value,
  }));

  const countdownAnimStyle = useAnimatedStyle(() => ({
    opacity:   countdownOpacity.value,
    transform: [{ scale: countdownScale.value }],
  }));

  // ── Refs para loops y timers ───────────────────────────────────────────────
  const isIdleRunning   = useRef(false);
  const isSpinRunning   = useRef(false);
  const countdownRefs   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hapticRefs      = useRef<ReturnType<typeof setInterval>[]>([]);
  const hapticTimeouts  = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Wheel size responsivo ─────────────────────────────────────────────────
  const wheelSize = Math.min(340, height * 0.42);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    getPublicRouletteDrinks().then(setDrinks).catch(console.warn);
    getMyRouletteStats().then(setPityStats).catch(() => {});
  }, []);

  // ── Idle rotation (Reanimated) ────────────────────────────────────────────
  const runIdleLoop = () => {
    if (!isIdleRunning.current) return;
    spinDeg.value = withTiming(
      spinDeg.value + 360,
      { duration: 14000, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(runIdleLoop)();
      },
    );
  };

  useEffect(() => {
    if (spinState === 'idle' && !reduceMotion) {
      isIdleRunning.current = true;
      runIdleLoop();
    } else {
      isIdleRunning.current = false;
    }
  }, [spinState, reduceMotion]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isIdleRunning.current = false;
      isSpinRunning.current = false;
      countdownRefs.current.forEach(clearTimeout);
      hapticRefs.current.forEach(clearInterval);
      hapticTimeouts.current.forEach(clearTimeout);
    };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const animateCountdownIn = () => {
    countdownScale.value   = 0.5;
    countdownOpacity.value = 0;
    countdownScale.value   = withSpring(1.0, { damping: 6, mass: 0.8, stiffness: 200 });
    countdownOpacity.value = withTiming(1, { duration: 150 });
  };

  const stopHaptics = () => {
    hapticRefs.current.forEach(clearInterval);
    hapticTimeouts.current.forEach(clearTimeout);
    hapticRefs.current    = [];
    hapticTimeouts.current = [];
  };

  const startProgressiveHaptics = () => {
    stopHaptics();
    const i1 = setInterval(() => { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {} }, 60);
    hapticRefs.current.push(i1);
    const t1 = setTimeout(() => {
      clearInterval(i1);
      const i2 = setInterval(() => { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {} }, 120);
      hapticRefs.current.push(i2);
      const t2 = setTimeout(() => {
        clearInterval(i2);
        const i3 = setInterval(() => { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {} }, 220);
        hapticRefs.current.push(i3);
        const t3 = setTimeout(() => clearInterval(i3), 800);
        hapticTimeouts.current.push(t3);
      }, 1200);
      hapticTimeouts.current.push(t2);
    }, 1000);
    hapticTimeouts.current.push(t1);
  };

  // ── Spin loop (Reanimated) ─────────────────────────────────────────────────
  const runSpinLoop = () => {
    if (!isSpinRunning.current) return;
    spinDeg.value = withTiming(
      spinDeg.value + 360,
      { duration: 900, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(runSpinLoop)();
      },
    );
  };

  // ── Reveal ────────────────────────────────────────────────────────────────
  const triggerReveal = (result: RouletteDrinkDTO) => {
    setSpinState('revealing');
    setSelectedDrink(result);
    isSpinRunning.current = false;

    const targetAngle = calculateTargetAngle(drinks, result._id, spinDeg.value);
    spinDeg.value = withTiming(targetAngle, {
      duration: 3800,
      easing:   Easing.out(Easing.cubic),
    });

    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}

    setTimeout(() => {
      setSpinState('result');
      setShowExplosion(true);
      setTimeout(() => setShowExplosion(false), 2800);

      if (result.rarity === 'EPIC' || result.rarity === 'LEGENDARY') {
        bgTintOpacity.value = withSequence(
          withTiming(0.18, { duration: 400 }),
          withTiming(0,    { duration: 600 }),
        );
      }

      if (result.rarity === 'LEGENDARY') {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      } else {
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
      }
    }, 500);
  };

  // ── Spin ──────────────────────────────────────────────────────────────────
  const handleSpin = () => {
    if (spinState === 'spinning' || spinState === 'revealing') return;

    isIdleRunning.current = false;
    isSpinRunning.current = false;
    setSelectedDrink(null);
    setTicketData(null);
    bgTintOpacity.value = 0;

    setCountdown(3);
    animateCountdownIn();
    countdownRefs.current.forEach(clearTimeout);
    countdownRefs.current = [
      setTimeout(() => { setCountdown(2); animateCountdownIn(); }, 900),
      setTimeout(() => { setCountdown(1); animateCountdownIn(); }, 1800),
      setTimeout(() => {
        setCountdown(null);
        setSpinState('spinning');

        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
        startProgressiveHaptics();

        isSpinRunning.current = true;
        runSpinLoop();

        spinPublicRoulette()
          .then((res) => {
            stopHaptics();
            isSpinRunning.current = false;

            setHistory(prev => [
              {
                id: res.selected._id + Date.now(),
                name: res.selected.name,
                rarity: res.selected.rarity,
                timestamp: new Date(),
              },
              ...prev,
            ].slice(0, 8));

            triggerReveal(res.selected);

            try {
              if (res.pointsEarned > 0) {
                usePointsStore.getState().addLocal(res.pointsEarned, `Ruleta: ${res.selected.name}`);
                setToastMsg(`+${res.pointsEarned} pts ganados`);
              }
            } catch {}
          })
          .catch((err) => {
            stopHaptics();
            isSpinRunning.current = false;
            setSpinState('idle');
            Alert.alert('Error en la Ruleta', getErrorMessage(err));
          });
      }, 2700),
    ];
  };

  const handleAddToCart = () => {
    if (!selectedDrink) return;
    if (!tableId) {
      Alert.alert('Conectá tu mesa', 'Necesitás una mesa para pedir.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ir a Pedidos', onPress: () => { onClose(); navigation.navigate('Pedidos'); } },
      ]);
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

  const handleGenerateTicket = async () => {
    if (!selectedDrink) return;
    setIsGeneratingTicket(true);
    try {
      const data = await generateRouletteTicket({
        drinkId:  selectedDrink._id,
        rarity:   selectedDrink.rarity,
        drinkName: selectedDrink.name,
        tableId:  tableId ?? null,
      });
      setTicketData(data);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const rarityBgColor = selectedDrink
    ? ({
        EPIC:      Colors.wine,
        LEGENDARY: NocturneColors.vipGold,
      } as Record<string, string>)[selectedDrink.rarity] ?? 'transparent'
    : 'transparent';

  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of drinks) counts[d.rarity] = (counts[d.rarity] ?? 0) + 1;
    return counts;
  }, [drinks]);

  const gradColors: [string, string, string] = ['#0C0A0D', '#131014', '#1A1619'];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Tint flash EPIC/LEGENDARY */}
      {(selectedDrink?.rarity === 'EPIC' || selectedDrink?.rarity === 'LEGENDARY') && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: rarityBgColor, zIndex: 3 },
            bgTintStyle,
          ]}
        />
      )}

      <NToast
        visible={!!toastMsg}
        message={toastMsg ?? ''}
        variant="success"
        onHide={() => setToastMsg(null)}
      />

      <RevealExplosion
        rarity={selectedDrink?.rarity ?? 'COMMON'}
        visible={showExplosion}
        originY={wheelOriginY + 150}
      />

      {/* GoldenTicket con guard */}
      {ticketData && ticketData.ticket && ticketData.ticket.trim() !== '' && selectedDrink && (
        <GoldenTicket
          ticket={ticketData.ticket}
          expiresAt={ticketData.expiresAt}
          drinkName={selectedDrink.name}
          rarity={selectedDrink.rarity}
          onClose={() => setTicketData(null)}
        />
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <View style={[StyleSheet.absoluteFill, styles.countdownOverlay]}>
          <LinearGradient
            colors={['rgba(12,10,13,0.95)', 'rgba(12,10,13,0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <Animated.Text style={[styles.countdownNumber, countdownAnimStyle]}>
            {countdown}
          </Animated.Text>
        </View>
      )}

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* ── Close button flotante ── */}
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeBtn, { top: insets.top + 12 }]}
          accessibilityRole="button"
          accessibilityLabel="Cerrar ruleta"
        >
          <X size={22} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>

        {/* ── Hero: rueda protagonista ── */}
        <View
          style={styles.heroSection}
          onLayout={(e) => setWheelOriginY(e.nativeEvent.layout.y + e.nativeEvent.layout.height / 2)}
        >
          <LinearGradient
            colors={[NocturneColors.casinoBackground, NocturneColors.casinoPurple, 'transparent']}
            style={styles.heroBg}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          <MobileWheel
            drinks={drinks}
            spinAnim={spinDeg}
            phase={spinState}
            resultRarity={selectedDrink?.rarity ?? 'COMMON'}
            size={wheelSize}
          />

          {spinState === 'revealing' && (
            <View style={styles.revealingOverlay}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.revealingText}>Revelando resultado</Text>
            </View>
          )}

          {/* Rarity count chips — solo idle */}
          {drinks.length > 0 && spinState === 'idle' && (
            <View style={styles.rarityCountRow}>
              {(['COMMON','RARE','EPIC','LEGENDARY'] as const)
                .filter(r => rarityCounts[r] > 0)
                .map(r => (
                  <View key={r} style={styles.rarityCountChip}>
                    <RarityIcon rarity={r} size={11} />
                    <Text style={[styles.rarityCountText, { color: RARITY_ICON_COLOR[r] }]}>
                      {rarityCounts[r]}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          {/* Chip "PREMIO AL INSTANTE" — solo idle */}
          {spinState === 'idle' && (
            <View style={styles.prizeChip} accessibilityRole="text">
              <Text style={styles.prizeChipText}>PREMIO AL INSTANTE</Text>
            </View>
          )}
        </View>

        {/* ── Footer CTA sticky — oculto en result ── */}
        {spinState !== 'result' && (
          <View style={styles.footer}>
            <LinearGradient
              colors={['transparent', 'rgba(12,10,13,0.98)']}
              style={styles.footerGradient}
            />
            <NButton
              label={
                countdown !== null       ? `${countdown}...`   :
                spinState === 'spinning' ? 'Girando...'        :
                spinState === 'revealing'? 'Revelando...'      :
                'GIRAR AHORA'
              }
              onPress={handleSpin}
              loading={spinState === 'spinning' || spinState === 'revealing'}
              fullWidth
              size="lg"
              icon={spinState === 'idle' && countdown === null
                ? <RotateCw size={20} color={Colors.onPrimary} />
                : undefined
              }
            />
          </View>
        )}
      </SafeAreaView>

      {/* ── ResultBottomSheet (fuera del SafeAreaView para posicionamiento absoluto correcto) ── */}
      <ResultBottomSheet
        drink={selectedDrink}
        spinState={spinState}
        onSpin={handleSpin}
        onAddToCart={handleAddToCart}
        onGenerateTicket={handleGenerateTicket}
        isGeneratingTicket={isGeneratingTicket}
        tableId={tableId}
        history={history}
        pityStats={pityStats}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: NocturneColors.casinoBackground },
  safe:             { flex: 1 },

  // ── Close button flotante ──────────────────────────────────────
  closeBtn: {
    position:        'absolute',
    right:           Spacing.md,
    zIndex:          50,
    backgroundColor: NocturneColors.surfaceContainerHigh,
    borderRadius:    Radius.full,
    padding:         8,
    borderWidth:     1,
    borderColor:     NocturneColors.outlineVariant,
  },

  // ── Hero ───────────────────────────────────────────────────────
  heroSection: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     Spacing.xl,
    paddingBottom:  Spacing.md,
    position:       'relative',
    gap:            Spacing.sm,
  },
  heroBg: {
    position:                  'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    borderBottomLeftRadius:    Radius.xxl,
    borderBottomRightRadius:   Radius.xxl,
  },
  revealingOverlay: {
    position:        'absolute',
    bottom:          Spacing.xl,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: NocturneColors.overlayDark,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius:    Radius.full,
  },
  revealingText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  rarityCountRow: {
    flexDirection: 'row',
    gap:           Spacing.sm,
    alignItems:    'center',
  },
  rarityCountChip: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            4,
    backgroundColor: NocturneColors.surfaceContainerLow,
    borderRadius:   Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderWidth:    1,
    borderColor:    NocturneColors.borderSubtle,
  },
  rarityCountText: {
    ...Typography.labelSm,
    fontSize: 10,
  },
  prizeChip: {
    backgroundColor: Colors.emberMuted,
    borderRadius:    Radius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderWidth:     1,
    borderColor:     Colors.emberBorder,
  },
  prizeChipText: {
    ...Typography.labelSm,
    color: Colors.primary,
  },

  // ── Footer ────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: Spacing.gutter,
    paddingBottom:     Spacing.md,
    paddingTop:        Spacing.sm,
    position:          'relative',
  },
  footerGradient: {
    position: 'absolute',
    top:      -Spacing.xl,
    left:     0,
    right:    0,
    height:   Spacing.xl,
  },

  // ── Countdown ────────────────────────────────────────────────
  countdownOverlay: {
    zIndex:         20,
    justifyContent: 'center',
    alignItems:     'center',
  },
  countdownNumber: {
    ...Typography.orderNumber,
    color:      Colors.onSurface,
    fontSize:   120,
    lineHeight: 130,
    zIndex:     21,
  },
});

export default RouletteScreen;

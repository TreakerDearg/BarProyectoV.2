// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — RouletteScreen (v2)
// Sin reanimated — usa Animated de RN. Compatible con Expo Go arquitectura vieja.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useMemo, useReducer } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator,
  Animated, Easing, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, RotateCw, ChevronDown, Martini, Ticket } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';

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

import { NToast }          from '../components/shared/NToast';
import { NButton }         from '../components/shared/NButton';
import { RarityIcon, RARITY_ICON_COLOR, RARITY_LABEL } from '../components/shared/RarityIcon';
import { MobileWheel }     from '../components/roulette/MobileWheel';
import { GoldenTicket }    from '../components/roulette/GoldenTicket';
import { RevealExplosion } from '../components/roulette/RevealExplosion';

import { calculateTargetAngle } from '../utils/rouletteAngle';
import type { RouletteDrinkDTO } from '../types/api';
import type { RootTabParamList } from '../navigation/types';

const { width: SW, height: SH } = Dimensions.get('window');

type SpinState = 'idle' | 'spinning' | 'revealing' | 'result';

interface SpinHistoryItem {
  id: string; name: string; rarity: string; timestamp: Date;
}
interface PityStats {
  spinsSinceRare: number; spinsSinceEpic: number; spinsSinceLegendary: number;
}

const RARITY_CONFIG = {
  COMMON:    { border: Colors.outline,         label: Colors.outline,                      glow: 'rgba(158,140,123,0.40)', badgeBg: Colors.surfaceContainerHigh,  badgeText: Colors.outline,                      bgColor: Colors.outline },
  RARE:      { border: Colors.info,            label: Colors.info,                         glow: 'rgba(90,184,232,0.40)',  badgeBg: NocturneColors.infoMuted,     badgeText: Colors.info,                         bgColor: Colors.info },
  EPIC:      { border: Colors.wine,            label: NocturneColors.onSecondaryContainer, glow: NocturneColors.wineGlow, badgeBg: NocturneColors.wineMuted,     badgeText: NocturneColors.onSecondaryContainer, bgColor: Colors.wine },
  LEGENDARY: { border: NocturneColors.vipGold, label: NocturneColors.vipGold,              glow: NocturneColors.vipGoldGlowStrong, badgeBg: NocturneColors.vipGoldMuted, badgeText: NocturneColors.vipGold, bgColor: NocturneColors.vipGold },
} as const;

const PITY_THRESHOLDS = { RARE: 10, EPIC: 25, LEGENDARY: 50 };

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

interface RouletteScreenProps { onClose: () => void; }

export const RouletteScreen: React.FC<RouletteScreenProps> = ({ onClose }) => {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { tableId } = useSessionStore();

  // ── State ─────────────────────────────────────────────────────────────────
  const [spinState,     setSpinState]     = useState<SpinState>('idle');
  const [drinks,        setDrinks]        = useState<RouletteDrinkDTO[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<RouletteDrinkDTO | null>(null);
  const [isRecipeOpen,  setIsRecipeOpen]  = useState(false);
  const [history,       setHistory]       = useState<SpinHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMsg,      setToastMsg]      = useState<string | null>(null);
  const [ticketData,    setTicketData]    = useState<{ ticket: string; expiresAt: number } | null>(null);
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);
  const [countdown,     setCountdown]     = useState<number | null>(null);
  const [showExplosion, setShowExplosion] = useState(false);
  const [pityStats,     setPityStats]     = useState<PityStats | null>(null);
  const [wheelOriginY,  setWheelOriginY]  = useState(SH * 0.32);

  // ── Animated values ───────────────────────────────────────────────────────
  // spinDeg: grados absolutos del wheel (aumenta continuamente)
  const spinDeg       = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultTranslY = useRef(new Animated.Value(40)).current;
  const bgTintOpacity = useRef(new Animated.Value(0)).current;
  const chevronRot    = useRef(new Animated.Value(0)).current;
  const countdownScale  = useRef(new Animated.Value(0.5)).current;
  const countdownOpacity = useRef(new Animated.Value(0)).current;

  // Refs para controlar loops
  const idleLoopRef    = useRef<Animated.CompositeAnimation | null>(null);
  const spinLoopRef    = useRef<Animated.CompositeAnimation | null>(null);
  const countdownRefs  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hapticRefs     = useRef<ReturnType<typeof setInterval>[]>([]);
  const hapticTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Valor actual de spinDeg (para calcular targetAngle)
  const spinDegValueRef = useRef(0);
  useEffect(() => {
    const id = spinDeg.addListener(({ value }) => { spinDegValueRef.current = value; });
    return () => spinDeg.removeListener(id);
  }, []);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    getPublicRouletteDrinks().then(setDrinks).catch(console.warn);
    getMyRouletteStats().then(setPityStats).catch(() => {});
  }, []);

  // ── Idle rotation ─────────────────────────────────────────────────────────
  const startIdleRotation = () => {
    idleLoopRef.current?.stop();
    idleLoopRef.current = Animated.loop(
      Animated.timing(spinDeg, {
        toValue:         spinDegValueRef.current + 360,
        duration:        14000,
        easing:          Easing.linear,
        useNativeDriver: true,
      }),
    );
    idleLoopRef.current.start();
  };

  useEffect(() => {
    if (spinState === 'idle') {
      startIdleRotation();
    }
    return () => { if (spinState !== 'idle') idleLoopRef.current?.stop(); };
  }, [spinState]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      idleLoopRef.current?.stop();
      spinLoopRef.current?.stop();
      countdownRefs.current.forEach(clearTimeout);
      hapticRefs.current.forEach(clearInterval);
      hapticTimeouts.current.forEach(clearTimeout);
    };
  }, []);

  // ── Derived animated styles ───────────────────────────────────────────────
  const resultCardStyle = {
    opacity:   resultOpacity,
    transform: [{ translateY: resultTranslY }],
  };

  const countdownAnimStyle = {
    opacity:   countdownOpacity,
    transform: [{ scale: countdownScale }],
  };

  const chevronRotDeg = chevronRot.interpolate({ inputRange: [0,1], outputRange: ['0deg','180deg'] });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggleRecipe = () => {
    const next = !isRecipeOpen;
    setIsRecipeOpen(next);
    Animated.timing(chevronRot, { toValue: next ? 1 : 0, duration: 250, useNativeDriver: true }).start();
  };

  const animateCountdownIn = () => {
    countdownScale.setValue(0.5);
    countdownOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(countdownScale,   { toValue: 1.0, friction: 6, useNativeDriver: true }),
      Animated.timing(countdownOpacity, { toValue: 1,   duration: 150, useNativeDriver: true }),
    ]).start();
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

  // ── Reveal ────────────────────────────────────────────────────────────────
  const triggerReveal = (result: RouletteDrinkDTO) => {
    setSpinState('revealing');
    setSelectedDrink(result);

    spinLoopRef.current?.stop();

    const targetAngle = calculateTargetAngle(drinks, result._id, spinDegValueRef.current);
    Animated.timing(spinDeg, {
      toValue:         targetAngle,
      duration:        3800,
      easing:          Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}

    setTimeout(() => {
      setSpinState('result');
      setShowExplosion(true);
      setTimeout(() => setShowExplosion(false), 2800);

      resultOpacity.setValue(0);
      resultTranslY.setValue(40);
      Animated.parallel([
        Animated.timing(resultOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(resultTranslY, { toValue: 0, friction: 14, tension: 180, useNativeDriver: true }),
      ]).start();

      if (result.rarity === 'EPIC' || result.rarity === 'LEGENDARY') {
        bgTintOpacity.setValue(0);
        Animated.sequence([
          Animated.timing(bgTintOpacity, { toValue: 0.18, duration: 400, useNativeDriver: false }),
          Animated.timing(bgTintOpacity, { toValue: 0,    duration: 600, useNativeDriver: false }),
        ]).start();
      }

      if (result.rarity === 'LEGENDARY') {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      } else {
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
      }
    }, 500);
  };

  // ── Spin ──────────────────────────────────────────────────────────────────
  const handleSpin = async () => {
    if (spinState === 'spinning' || spinState === 'revealing') return;

    idleLoopRef.current?.stop();
    spinLoopRef.current?.stop();
    setSelectedDrink(null);
    setIsRecipeOpen(false);
    chevronRot.setValue(0);
    setTicketData(null);
    resultOpacity.setValue(0);
    resultTranslY.setValue(40);
    bgTintOpacity.setValue(0);

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

        spinLoopRef.current = Animated.loop(
          Animated.timing(spinDeg, {
            toValue:         spinDegValueRef.current + 360,
            duration:        900,
            easing:          Easing.linear,
            useNativeDriver: true,
          }),
        );
        spinLoopRef.current.start();

        spinPublicRoulette()
          .then((res) => {
            stopHaptics();
            spinLoopRef.current?.stop();

            setHistory(prev => [
              { id: res.selected._id + Date.now(), name: res.selected.name, rarity: res.selected.rarity, timestamp: new Date() },
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
            spinLoopRef.current?.stop();
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
      productId: selectedDrink._id, name: selectedDrink.name,
      price: 0, image: undefined,
      notes: `Ruleta Nebula — ${selectedDrink.rarity}`, quantity: 1,
    });
    setToastMsg('Agregado al pedido');
    navigation.navigate('Pedidos');
  };

  const handleGenerateTicket = async () => {
    if (!selectedDrink) return;
    setIsGeneratingTicket(true);
    try {
      const data = await generateRouletteTicket({
        drinkId: selectedDrink._id, rarity: selectedDrink.rarity,
        drinkName: selectedDrink.name, tableId: tableId ?? null,
      });
      setTicketData(data);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const rarityConf  = RARITY_CONFIG[(selectedDrink?.rarity as keyof typeof RARITY_CONFIG) ?? 'COMMON'] ?? RARITY_CONFIG.COMMON;
  const isLegendary = selectedDrink?.rarity === 'LEGENDARY';
  const isEpicPlus  = selectedDrink?.rarity === 'EPIC' || isLegendary;

  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of drinks) counts[d.rarity] = (counts[d.rarity] ?? 0) + 1;
    return counts;
  }, [drinks]);

  const gradColors: [string, string, string] = ['#0C0A0D', '#131014', '#1A1619'];

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradColors} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />

      {/* Tint flash */}
      {isEpicPlus && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: rarityConf.bgColor, zIndex: 3, opacity: bgTintOpacity }]} />
      )}

      <NToast visible={!!toastMsg} message={toastMsg ?? ''} variant="success" onHide={() => setToastMsg(null)} />

      <RevealExplosion rarity={selectedDrink?.rarity ?? 'COMMON'} visible={showExplosion} originY={wheelOriginY + 150} />

      {ticketData && selectedDrink && (
        <GoldenTicket ticket={ticketData.ticket} expiresAt={ticketData.expiresAt} drinkName={selectedDrink.name} rarity={selectedDrink.rarity} onClose={() => setTicketData(null)} />
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <View style={[StyleSheet.absoluteFill, styles.countdownOverlay]}>
          <LinearGradient colors={['rgba(12,10,13,0.95)', 'rgba(12,10,13,0.85)']} style={StyleSheet.absoluteFill} />
          <Animated.Text style={[styles.countdownNumber, countdownAnimStyle]}>{countdown}</Animated.Text>
        </View>
      )}

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <RotateCw size={20} color={Colors.primary} />
            <Text style={styles.headerTitle}>Ruleta Nebula</Text>
            <View style={styles.prizeChip}>
              <Text style={styles.prizeChipText}>PREMIO AL INSTANTE</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Hero (wheel fijo) */}
        <View style={styles.heroSection} onLayout={(e) => setWheelOriginY(e.nativeEvent.layout.y)}>
          <LinearGradient colors={[NocturneColors.casinoBackground, NocturneColors.casinoPurple, 'transparent']} style={styles.heroBg} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />

          <MobileWheel drinks={drinks} spinAnim={spinDeg} phase={spinState} resultRarity={selectedDrink?.rarity ?? 'COMMON'} size={300} />

          {spinState === 'revealing' && (
            <View style={styles.revealingOverlay}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.revealingText}>Revelando resultado</Text>
            </View>
          )}

          {drinks.length > 0 && spinState === 'idle' && (
            <View style={styles.rarityCountRow}>
              {(['COMMON','RARE','EPIC','LEGENDARY'] as const).filter(r => rarityCounts[r] > 0).map(r => (
                <View key={r} style={styles.rarityCountChip}>
                  <RarityIcon rarity={r} size={11} />
                  <Text style={[styles.rarityCountText, { color: RARITY_ICON_COLOR[r] }]}>{rarityCounts[r]}</Text>
                </View>
              ))}
            </View>
          )}

          {pityStats && spinState === 'idle' && (
            <View style={styles.pityRow}>
              {([
                { rarity: 'RARE',      since: pityStats.spinsSinceRare,      threshold: PITY_THRESHOLDS.RARE      },
                { rarity: 'EPIC',      since: pityStats.spinsSinceEpic,      threshold: PITY_THRESHOLDS.EPIC      },
                { rarity: 'LEGENDARY', since: pityStats.spinsSinceLegendary, threshold: PITY_THRESHOLDS.LEGENDARY },
              ] as const).filter(({ since, threshold }) => since / threshold > 0.5).map(({ rarity, since, threshold }) => {
                const pct = Math.min(1, since / threshold);
                const col = RARITY_ICON_COLOR[rarity];
                return (
                  <View key={rarity} style={styles.pityItem}>
                    <View style={styles.pityTrack}>
                      <View style={[styles.pityBar, { width: `${pct * 100}%` as any, backgroundColor: col }]} />
                    </View>
                    <Text style={[styles.pityLabel, pct >= 0.8 && { color: col }]}>{since}/{threshold} {rarity}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Scroll: resultado + historial */}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {spinState === 'result' && selectedDrink && (
            <Animated.View style={[styles.resultCard, { borderColor: rarityConf.border, shadowColor: rarityConf.glow }, resultCardStyle]}>
              <View style={[styles.rarityBadge, { backgroundColor: rarityConf.badgeBg }]}>
                <RarityIcon rarity={selectedDrink.rarity} size={14} color={rarityConf.badgeText} />
                <Text style={[styles.rarityBadgeText, { color: rarityConf.badgeText }]}>
                  {RARITY_LABEL[selectedDrink.rarity as keyof typeof RARITY_LABEL] ?? selectedDrink.rarity}
                </Text>
              </View>

              <Text style={[isEpicPlus ? styles.drinkNameLg : styles.drinkNameSm, { color: rarityConf.label }]}>
                {selectedDrink.name}
              </Text>

              {selectedDrink.recipe?.method && (
                <Text style={styles.drinkDesc}>{selectedDrink.recipe.method}</Text>
              )}

              {selectedDrink.recipe?.ingredients && selectedDrink.recipe.ingredients.length > 0 && (
                <View style={styles.recipeSection}>
                  <TouchableOpacity style={styles.recipeToggle} onPress={toggleRecipe}>
                    <Text style={styles.recipeToggleText}>Ver receta del bartender</Text>
                    <Animated.View style={{ transform: [{ rotate: chevronRotDeg }] }}>
                      <ChevronDown size={18} color={Colors.onSurfaceVariant} />
                    </Animated.View>
                  </TouchableOpacity>
                  {isRecipeOpen && (
                    <View style={styles.recipeBody}>
                      {selectedDrink.recipe.ingredients.map((ing, idx) => (
                        <Text key={idx} style={styles.ingredientText}>{'\u2022'} {ing.name} — {ing.quantity} {ing.unit}</Text>
                      ))}
                      {selectedDrink.recipe.drinkStyle && (
                        <View style={styles.drinkStyleBadge}><Text style={styles.drinkStyleText}>{selectedDrink.recipe.drinkStyle}</Text></View>
                      )}
                    </View>
                  )}
                </View>
              )}

              <View style={styles.resultActions}>
                {tableId ? (
                  <>
                    <NButton label="Pedir este trago" icon={<Martini size={18} color={Colors.onPrimary} />} onPress={handleAddToCart} fullWidth size="lg" />
                    <NButton label="Volver a tirar"   icon={<RotateCw size={18} color={Colors.primary} />} onPress={handleSpin} variant="ghost" fullWidth />
                  </>
                ) : (
                  <NButton label="Volver a tirar" icon={<RotateCw size={18} color={Colors.onPrimary} />} onPress={handleSpin} fullWidth size="lg" />
                )}
                <NButton label="Generar Ticket VIP" icon={<Ticket size={18} color={Colors.primary} />} onPress={handleGenerateTicket} loading={isGeneratingTicket} variant="ghost" fullWidth />
                {history.length > 0 && (
                  <TouchableOpacity style={styles.historyToggleBtn} onPress={() => setIsHistoryOpen(!isHistoryOpen)}>
                    <Text style={styles.historyToggleText}>Ver historial ({history.length})</Text>
                    <Animated.View style={{ transform: [{ rotate: chevronRotDeg }] }}>
                      <ChevronDown size={14} color={Colors.outline} />
                    </Animated.View>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}

          {history.length > 0 && (
            <View style={styles.historySection}>
              <TouchableOpacity style={styles.historyHeader} onPress={() => setIsHistoryOpen(!isHistoryOpen)}>
                <Text style={styles.historyTitle}>Historial ({history.length})</Text>
                <ChevronDown size={16} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
              {isHistoryOpen && history.map((item) => {
                const rCfg = RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG] ?? RARITY_CONFIG.COMMON;
                return (
                  <View key={item.id} style={styles.historyItem}>
                    <RarityIcon rarity={item.rarity} size={14} />
                    <Text style={styles.historyItemName} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.historyRarityBadge, { backgroundColor: rCfg.badgeBg }]}>
                      <Text style={[styles.historyRarityText, { color: rCfg.badgeText }]}>{item.rarity}</Text>
                    </View>
                    <Text style={styles.historyTime}>{fmtTime(item.timestamp)}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        {(spinState === 'idle' || spinState === 'spinning' || spinState === 'revealing') && (
          <View style={styles.footer}>
            <LinearGradient colors={['transparent','rgba(12,10,13,0.98)']} style={styles.footerGradient} />
            <NButton
              label={
                countdown !== null       ? `${countdown}...`  :
                spinState === 'spinning' ? 'Girando...'       :
                spinState === 'revealing'? 'Revelando...'     :
                'GIRAR AHORA'
              }
              onPress={handleSpin}
              loading={spinState === 'spinning' || spinState === 'revealing'}
              fullWidth size="lg"
              icon={spinState === 'idle' && countdown === null ? <RotateCw size={20} color={Colors.onPrimary} /> : undefined}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root:              { flex: 1, backgroundColor: NocturneColors.casinoBackground },
  safe:              { flex: 1 },
  header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.gutter, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: NocturneColors.outlineVariant },
  headerLeft:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  headerTitle:       { ...Typography.headlineSm, color: Colors.onSurface },
  prizeChip:         { backgroundColor: Colors.emberMuted, borderRadius: Radius.xs, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderWidth: 1, borderColor: Colors.emberBorder },
  prizeChipText:     { ...Typography.labelSm, color: Colors.primary },
  closeBtn:          { padding: 6 },
  heroSection:       { alignItems: 'center', paddingTop: Spacing.md, paddingBottom: Spacing.sm, position: 'relative' },
  heroBg:            { ...StyleSheet.absoluteFillObject, borderBottomLeftRadius: Radius.xxl, borderBottomRightRadius: Radius.xxl },
  revealingOverlay:  { position: 'absolute', bottom: Spacing.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: NocturneColors.overlayDark, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  revealingText:     { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  rarityCountRow:    { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, alignItems: 'center' },
  rarityCountChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: NocturneColors.surfaceContainerLow, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderWidth: 1, borderColor: NocturneColors.borderSubtle },
  rarityCountText:   { ...Typography.labelSm, fontSize: 10 },
  pityRow:           { width: '100%', paddingHorizontal: Spacing.gutter, gap: Spacing.sm, marginTop: Spacing.sm },
  pityItem:          { gap: 3 },
  pityTrack:         { height: 4, backgroundColor: NocturneColors.surfaceContainerHigh, borderRadius: Radius.full, overflow: 'hidden' },
  pityBar:           { height: '100%', borderRadius: Radius.full },
  pityLabel:         { ...Typography.labelSm, color: Colors.onSurfaceVariant, fontSize: 9 },
  countdownOverlay:  { zIndex: 20, justifyContent: 'center', alignItems: 'center' },
  countdownNumber:   { ...Typography.orderNumber, color: Colors.onSurface, fontSize: 120, lineHeight: 130, zIndex: 21 },
  scroll:            { flex: 1 },
  scrollContent:     { padding: Spacing.gutter, gap: Spacing.lg, alignItems: 'center', paddingBottom: Spacing.xxxl + Spacing.lg },
  resultCard:        { width: '100%', backgroundColor: Colors.surfaceContainer, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, gap: Spacing.sm, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  rarityBadge:       { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: Spacing.smMd, paddingVertical: Spacing.xs },
  rarityBadgeText:   { ...Typography.labelMd, textTransform: 'none' as const },
  drinkNameLg:       { ...Typography.displayLg },
  drinkNameSm:       { ...Typography.displaySm },
  drinkDesc:         { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  recipeSection:     { borderTopWidth: 1, borderTopColor: NocturneColors.borderSubtle, paddingTop: Spacing.sm, marginTop: Spacing.xs, gap: Spacing.sm },
  recipeToggle:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recipeToggleText:  { ...Typography.labelMd, color: Colors.onSurfaceVariant, textTransform: 'none' as const },
  recipeBody:        { gap: Spacing.xs, backgroundColor: Colors.surfaceContainerHigh, borderRadius: Radius.md, padding: Spacing.smMd },
  ingredientText:    { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  drinkStyleBadge:   { alignSelf: 'flex-start', backgroundColor: Colors.emberMuted, borderRadius: Radius.full, paddingHorizontal: Spacing.smMd, paddingVertical: 3, marginTop: Spacing.xs, borderWidth: 1, borderColor: Colors.emberBorder },
  drinkStyleText:    { ...Typography.labelSm, color: Colors.primary },
  resultActions:     { gap: Spacing.sm, marginTop: Spacing.sm },
  historyToggleBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  historyToggleText: { ...Typography.labelMd, color: Colors.outline, textTransform: 'none' as const },
  historySection:    { width: '100%', backgroundColor: Colors.surfaceContainer, borderRadius: Radius.lg, borderWidth: 1, borderColor: NocturneColors.borderSubtle, overflow: 'hidden' },
  historyHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.smMd },
  historyTitle:      { ...Typography.labelMd, color: Colors.onSurface, textTransform: 'none' as const },
  historyItem:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.smMd, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: NocturneColors.borderSubtle },
  historyItemName:   { ...Typography.bodyMd, color: Colors.onSurface, flex: 1 },
  historyRarityBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  historyRarityText: { ...Typography.labelSm, fontSize: 9, textTransform: 'none' as const },
  historyTime:       { ...Typography.bodySm, color: Colors.outline },
  footer:            { paddingHorizontal: Spacing.gutter, paddingBottom: Spacing.md, paddingTop: Spacing.sm, position: 'relative' },
  footerGradient:    { position: 'absolute', top: -Spacing.xl, left: 0, right: 0, height: Spacing.xl },
});

export default RouletteScreen;

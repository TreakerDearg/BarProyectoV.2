// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — LoyaltyCard
// Card de fidelidad full-width (Bronze/Silver/Gold/Platinum), barra de
// progreso animada, número de tarjeta y overlay decorativo diagonal.
// Contexto VIP: el oro queda reservado para niveles y sellos premium.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

import { Colors, NocturneColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');
// Account for horizontal padding in parent scroll (2 * Spacing.gutter)
const CARD_WIDTH = screenWidth - Spacing.gutter * 2;

// ── Level thresholds (exportado: AccountScreen usa getLevel para el anillo) ──
type Level = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface LevelConfig {
  label:    Level;
  emoji:    string;
  color:    string;
  min:      number;
  max:      number | null; // null = top tier
}

const LEVELS: LevelConfig[] = [
  { label: 'Bronze',   emoji: '🥉', color: NocturneColors.fidelityBronze,   min: 0,    max: 499   },
  { label: 'Silver',   emoji: '🥈', color: NocturneColors.fidelitySilver,   min: 500,  max: 1999  },
  { label: 'Gold',     emoji: '🥇', color: NocturneColors.vipGold,          min: 2000, max: 4999  },
  { label: 'Platinum', emoji: '💎', color: NocturneColors.fidelityPlatinum, min: 5000, max: null  },
];

export function getLevel(balance: number): LevelConfig {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (balance >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

function getLevelProgress(balance: number, level: LevelConfig): number {
  if (level.max === null) return 1;
  const range = level.max - level.min + 1;
  const progress = (balance - level.min) / range;
  return Math.max(0, Math.min(1, progress));
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface LoyaltyCardProps {
  balance:     number;
  totalEarned: number;
  userId:      string;
}

export function LoyaltyCard({ balance, totalEarned, userId }: LoyaltyCardProps) {
  const level    = getLevel(balance);
  const progress = getLevelProgress(balance, level);

  // Animated progress bar width
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue:         progress,
      duration:        800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Next threshold label
  const nextLevel = LEVELS.find((l) => l.min > balance);
  const pointsToNext = nextLevel ? nextLevel.min - balance : 0;

  // Masked card number: •••• •••• + last 4 chars of userId
  const last4 = userId.slice(-4).toUpperCase();

  return (
    <View style={styles.card}>
      {/* ── Diagonal overlay (decorative) ───────────────── */}
      <View style={styles.diagonalOverlay} />

      {/* ── Header row ────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.cardLabel}>NEBULA REWARDS</Text>
          <Text style={[styles.levelName, { color: level.color }]}>
            {level.emoji} {level.label}
          </Text>
        </View>
        <View style={[styles.levelBadge, { borderColor: `${level.color}55` }]}>
          <Text style={[styles.levelBadgeText, { color: level.color }]}>
            {level.label.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* ── Balance ───────────────────────────────────── */}
      <View style={styles.balanceRow}>
        <Text style={styles.balanceNumber}>{balance.toLocaleString('es-AR')}</Text>
        <Text style={styles.balanceUnit}>pts</Text>
      </View>
      <Text style={styles.totalEarned}>
        {totalEarned.toLocaleString('es-AR')} pts acumulados en total
      </Text>

      {/* ── Progress bar ─────────────────────────────── */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange:  [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: level.color,
              },
            ]}
          />
        </View>
        {nextLevel ? (
          <Text style={styles.progressLabel}>
            {pointsToNext.toLocaleString('es-AR')} pts para {nextLevel.label}
          </Text>
        ) : (
          <Text style={styles.progressLabel}>Nivel máximo alcanzado 🎉</Text>
        )}
      </View>

      {/* ── Card number row ───────────────────────────── */}
      <View style={styles.cardNumberRow}>
        <Text style={styles.cardNumber}>{'•••• •••• ' + last4}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width:           '100%',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.xl,
    overflow:        'hidden',
    padding:         Spacing.md,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     NocturneColors.vipGoldBorder,
  },

  // ── Decorative diagonal overlay ─────────────────────────────────
  diagonalOverlay: {
    position:        'absolute',
    width:           200,
    height:          200,
    backgroundColor: NocturneColors.vipGoldSubtle,
    transform:       [{ rotate: '-15deg' }],
    top:             -40,
    right:           -40,
  },

  // ── Header ─────────────────────────────────────────────────────
  headerRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  cardLabel: {
    ...Typography.labelSm,
    color:         Colors.onSurfaceVariant,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  levelName: {
    ...Typography.headlineSm,
    marginTop: 2,
  },
  levelBadge: {
    borderRadius:      Radius.full,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderWidth:       1,
    backgroundColor:   NocturneColors.vipGoldSubtle,
  },
  levelBadgeText: {
    ...Typography.labelSm,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },

  // ── Balance ─────────────────────────────────────────────────────
  balanceRow: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap:           4,
  },
  balanceNumber: {
    ...Typography.displayLg,
    color: Colors.onSurface,
  },
  balanceUnit: {
    ...Typography.titleMd,
    color: Colors.onSurfaceVariant,
  },
  totalEarned: {
    ...Typography.bodySm,
    color:     Colors.onSurfaceVariant,
    marginTop: -Spacing.xs,
  },

  // ── Progress ────────────────────────────────────────────────────
  progressSection: {
    gap: 4,
  },
  progressTrack: {
    height:          6,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius:    Radius.full,
    overflow:        'hidden',
  },
  progressBar: {
    height:       '100%',
    borderRadius: Radius.full,
  },
  progressLabel: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },

  // ── Card number ─────────────────────────────────────────────────
  cardNumberRow: {
    borderTopWidth:  1,
    borderTopColor:  NocturneColors.borderSubtle,
    paddingTop:      Spacing.sm,
    marginTop:       Spacing.xs,
  },
  cardNumber: {
    fontFamily:    'monospace',
    fontSize:      14,
    color:         Colors.onSurfaceVariant,
    letterSpacing: 3,
  },
});

export default LoyaltyCard;

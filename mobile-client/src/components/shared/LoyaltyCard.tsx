// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — LoyaltyCard (v2)
// Card de fidelidad full-width (Bronze/Silver/Gold/Platinum), barra de
// progreso animada, número de tarjeta y overlay decorativo diagonal.
// Sin emojis — iconos de lucide-react-native para cada nivel.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Award, Medal, Trophy, Gem } from 'lucide-react-native';

import { Colors, NocturneColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - Spacing.gutter * 2;

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Level = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface LevelConfig {
  label: Level;
  color: string;
  min:   number;
  max:   number | null;
}

const LEVELS: LevelConfig[] = [
  { label: 'Bronze',   color: NocturneColors.fidelityBronze,   min: 0,    max: 499   },
  { label: 'Silver',   color: NocturneColors.fidelitySilver,   min: 500,  max: 1999  },
  { label: 'Gold',     color: NocturneColors.vipGold,          min: 2000, max: 4999  },
  { label: 'Platinum', color: NocturneColors.fidelityPlatinum, min: 5000, max: null  },
];

// Icono por nivel (sin emojis)
function LevelIcon({ level, size = 22 }: { level: Level; size?: number }) {
  const color = LEVELS.find(l => l.label === level)?.color ?? Colors.primary;
  switch (level) {
    case 'Bronze':   return <Award   size={size} color={color} />;
    case 'Silver':   return <Medal   size={size} color={color} />;
    case 'Gold':     return <Trophy  size={size} color={color} />;
    case 'Platinum': return <Gem     size={size} color={color} />;
  }
}

export function getLevel(balance: number): LevelConfig {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (balance >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

function getLevelProgress(balance: number, level: LevelConfig): number {
  if (level.max === null) return 1;
  const range    = level.max - level.min + 1;
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

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue:         progress,
      duration:        800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const nextLevel     = LEVELS.find((l) => l.min > balance);
  const pointsToNext  = nextLevel ? nextLevel.min - balance : 0;
  const last4         = userId.slice(-4).toUpperCase();

  return (
    <View style={styles.card}>
      {/* Overlay decorativo diagonal */}
      <View style={styles.diagonalOverlay} />

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.cardLabel}>NEBULA REWARDS</Text>
          <View style={styles.levelNameRow}>
            <LevelIcon level={level.label} size={20} />
            <Text style={[styles.levelName, { color: level.color }]}>
              {level.label}
            </Text>
          </View>
        </View>
        <View style={[styles.levelBadge, { borderColor: `${level.color}55` }]}>
          <LevelIcon level={level.label} size={14} />
          <Text style={[styles.levelBadgeText, { color: level.color }]}>
            {level.label.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Balance */}
      <View style={styles.balanceRow}>
        <Text style={styles.balanceNumber}>{balance.toLocaleString('es-AR')}</Text>
        <Text style={styles.balanceUnit}>pts</Text>
      </View>
      <Text style={styles.totalEarned}>
        {totalEarned.toLocaleString('es-AR')} pts acumulados en total
      </Text>

      {/* Barra de progreso */}
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
          <Text style={styles.progressLabel}>Nivel máximo alcanzado</Text>
        )}
      </View>

      {/* Número de tarjeta */}
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
  diagonalOverlay: {
    position:        'absolute',
    width:           200,
    height:          200,
    backgroundColor: NocturneColors.vipGoldSubtle,
    transform:       [{ rotate: '-15deg' }],
    top:             -40,
    right:           -40,
  },

  // Header
  headerRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  headerLeft: {
    gap: 4,
  },
  cardLabel: {
    ...Typography.labelSm,
    color:         Colors.onSurfaceVariant,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  levelNameRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.xs,
    marginTop:     2,
  },
  levelName: {
    ...Typography.headlineSm,
  },
  levelBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    borderRadius:      Radius.full,
    paddingHorizontal: Spacing.smMd,
    paddingVertical:   Spacing.xs,
    borderWidth:       1,
    backgroundColor:   NocturneColors.vipGoldSubtle,
  },
  levelBadgeText: {
    ...Typography.labelSm,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },

  // Balance
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

  // Progress
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

  // Card number
  cardNumberRow: {
    borderTopWidth: 1,
    borderTopColor: NocturneColors.borderSubtle,
    paddingTop:     Spacing.sm,
    marginTop:      Spacing.xs,
  },
  cardNumber: {
    fontFamily:    'monospace',
    fontSize:      14,
    color:         Colors.onSurfaceVariant,
    letterSpacing: 3,
  },
});

export default LoyaltyCard;

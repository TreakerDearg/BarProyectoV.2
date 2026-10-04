// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — CategoryHeroRow
// Horizontal scrollable pill row for product categories + Ruleta pill.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { RotateCw } from 'lucide-react-native';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';

// ── Category emoji map ────────────────────────────────────────────────────────
const CATEGORY_EMOJI: Record<string, string> = {
  cocktail:      '🍹',
  vino:          '🍷',
  cerveza:       '🍺',
  comida:        '🍔',
  'sin alcohol': '🥤',
  shot:          '🥃',
  general:       '✨',
  todos:         '🌟',
  all:           '🌟',
};

// ── Category background color map ─────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  cocktail:      'rgba(168,85,247,0.15)',
  vino:          'rgba(239,68,68,0.15)',
  cerveza:       'rgba(245,158,11,0.15)',
  comida:        'rgba(52,185,100,0.15)',
  'sin alcohol': 'rgba(56,189,248,0.15)',
  shot:          'rgba(249,115,22,0.15)',
  general:       NocturneColors.goldMuted,
};

function getCategoryColor(name: string): string {
  const key = name.toLowerCase();
  return CATEGORY_COLORS[key] ?? Colors.surfaceContainerHigh;
}

function getCategoryEmoji(name: string): string {
  const key = name.toLowerCase();
  return CATEGORY_EMOJI[key] ?? '🍽️';
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface CategoryHeroRowProps {
  categories:     Array<{ id: string; name: string }>;
  activeCategory: string;
  onSelect:       (id: string) => void;
  onRuletaPress:  () => void;
}

// ── Single pill ───────────────────────────────────────────────────────────────
function CategoryPill({
  category,
  isActive,
  onPress,
}: {
  category:  { id: string; name: string };
  isActive:  boolean;
  onPress:   () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.08 : 1)).current;

  const handlePress = () => {
    Animated.spring(scaleAnim, {
      toValue:         1.08,
      friction:        6,
      useNativeDriver: true,
    }).start();
    onPress();
  };

  // When deactivated, spring back to 1
  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue:         isActive ? 1.08 : 1,
      friction:        6,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  const bg = getCategoryColor(category.name);
  const emoji = getCategoryEmoji(category.name);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          styles.pill,
          { backgroundColor: bg },
          isActive && styles.pillActive,
        ]}
      >
        <Text style={styles.pillEmoji}>{emoji}</Text>
        <Text style={[styles.pillLabel, isActive && styles.pillLabelActive]} numberOfLines={1}>
          {category.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Ruleta pill ───────────────────────────────────────────────────────────────
function RuletaPill({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.pill, styles.ruletaPill]}
    >
      <RotateCw size={20} color={Colors.primary} />
      <Text style={[styles.pillLabel, styles.ruletaLabel]}>Ruleta</Text>
    </TouchableOpacity>
  );
}

// ── CategoryHeroRow ───────────────────────────────────────────────────────────
export function CategoryHeroRow({
  categories,
  activeCategory,
  onSelect,
  onRuletaPress,
}: CategoryHeroRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {categories.map((cat) => (
        <CategoryPill
          key={cat.id}
          category={cat}
          isActive={activeCategory === cat.id}
          onPress={() => onSelect(cat.id)}
        />
      ))}
      <RuletaPill onPress={onRuletaPress} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap:              Spacing.sm,
    paddingHorizontal: Spacing.gutter,
    paddingVertical:  Spacing.xs,
  },
  pill: {
    width:          Spacing.categoryPillSize,
    height:         Spacing.categoryPillSize,
    borderRadius:   Radius.full,
    justifyContent: 'center',
    alignItems:     'center',
    gap:            3,
    borderWidth:    1,
    borderColor:    'transparent',
  },
  pillActive: {
    borderWidth: 2,
    borderColor: Colors.cardBorderActive,
  },
  pillEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  pillLabel: {
    ...Typography.labelSm,
    color:          Colors.onSurfaceVariant,
    textTransform:  'none' as const,
    fontSize:       9,
    letterSpacing:  0,
    textAlign:      'center',
    paddingHorizontal: 4,
  },
  pillLabelActive: {
    color: Colors.primary,
  },
  ruletaPill: {
    backgroundColor: Colors.casinoGold,
    borderColor:     Colors.goldBorder,
    borderWidth:     1,
  },
  ruletaLabel: {
    color: Colors.primary,
  },
});

export default CategoryHeroRow;

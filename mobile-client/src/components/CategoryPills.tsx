// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — CategoryPills (NEBULA EMBER)
// Chips horizontales de filtro de categorías.
// Resting: surfaceContainerLow + borde sutil
// Selected: surfaceContainerHighest + borde ember + texto crema + dot
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';

export interface CategoryItem {
  id:    string;
  name:  string;
  icon?: string;
}

interface CategoryPillsProps {
  categories:       CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryPills({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  const { width }   = useWindowDimensions();
  const scrollRef   = useRef<ScrollView>(null);
  const pillLayouts = useRef<Record<string, { x: number; w: number }>>({});

  // Auto-centrado de la pill activa (taps y scroll-spy)
  useEffect(() => {
    const info = pillLayouts.current[selectedCategory];
    if (!info || !scrollRef.current) return;
    const x = Math.max(info.x - (width / 2 - info.w / 2), 0);
    scrollRef.current.scrollTo({ x, animated: true });
  }, [selectedCategory, width]);

  const handlePress = (id: string) => {
    try { Haptics.selectionAsync(); } catch {}
    onSelectCategory(id);
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onLayout={(e) => {
                pillLayouts.current[cat.id] = {
                  x: e.nativeEvent.layout.x,
                  w: e.nativeEvent.layout.width,
                };
              }}
              style={[styles.pill, isSelected && styles.pillActive]}
              onPress={() => handlePress(cat.id)}
              activeOpacity={0.75}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Categoría ${cat.name}`}
            >
              {isSelected && <View style={styles.dot} />}
              <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: Spacing.sm, paddingHorizontal: Spacing.gutter },

  pill: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             5,
    minHeight:       44,
    paddingHorizontal: 14,
    paddingVertical:   9,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius:    Radius.full,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  pillActive: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor:     Colors.primary,
  },
  dot: {
    width: 5, height: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  pillText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
  pillTextActive: {
    color:      Colors.onSurface,
    fontWeight: '600' as const,
  },
});

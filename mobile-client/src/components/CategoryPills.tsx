// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — CategoryPills (Nocturne Gastronomy)
// Chips horizontales de filtro de categorías.
// Resting: surfaceContainerLow + borde sutil
// Selected: surfaceContainerHighest + borde gold + texto dorado + dot
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors }     from '../theme/colors';
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
  const handlePress = (id: string) => {
    try { Haptics.selectionAsync(); } catch {}
    onSelectCategory(id);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
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
  container: { marginVertical: Spacing.sm },
  scroll:    { gap: Spacing.sm, paddingRight: Spacing.gutter },

  pill: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             5,
    paddingHorizontal: 14,
    paddingVertical:   9,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius:    Radius.full,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.08)',
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

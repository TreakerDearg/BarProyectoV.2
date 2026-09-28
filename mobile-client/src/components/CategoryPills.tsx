import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Colors } from "../theme/colors";

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string;
}

interface CategoryPillsProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isSelected && styles.pillActive]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scroll: {
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  pillTextActive: {
    color: Colors.textInverse,
    fontWeight: "800",
  },
});

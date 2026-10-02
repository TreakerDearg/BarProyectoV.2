import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { Plus, GlassWater, Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { Typography, Spacing, Radius } from "../theme/";
import type { ProductPublicDTO } from "../types/api";

interface ProductCardProps {
  product: ProductPublicDTO;
  onPress: (product: ProductPublicDTO) => void;
  onQuickAdd: (product: ProductPublicDTO) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onQuickAdd,
}) => {
  const hasDiscount = product.dynamicPrice < product.price;

  const handleQuickAdd = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onQuickAdd(product);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(product)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <GlassWater size={32} color={Colors.primary} />
          </View>
        )}

        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Sparkles size={10} color="#FFF" />
            <Text style={styles.discountBadgeText}>OFERTA</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {product.name}
          </Text>
          {product.drinkStyle === "author" && (
            <View style={styles.authorBadge}>
              <Text style={styles.authorBadgeText}>AUTOR</Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {product.description || "Ingredientes seleccionados por nuestro bartender."}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ${(product.dynamicPrice || product.price).toLocaleString("es-AR")}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                ${product.price.toLocaleString("es-AR")}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleQuickAdd}
            activeOpacity={0.7}
          >
            <Plus size={18} color={Colors.onPrimary} strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: Spacing.smMd,
    flexDirection: "row",
    overflow: "hidden",
  },
  imageContainer: {
    width: 110,
    height: 110,
    backgroundColor: Colors.surfaceContainerHigh,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  discountBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.errorContainer,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.20)',
  },
  discountBadgeText: {
    ...Typography.labelSm,
    color: Colors.error,
  },
  infoContainer: {
    flex: 1,
    padding: Spacing.smMd,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  title: {
    ...Typography.titleMd,
    color: Colors.onSurface,
    flex: 1,
  },
  authorBadge: {
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  authorBadgeText: {
    ...Typography.labelSm,
    color: Colors.primary,
  },
  description: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  price: {
    ...Typography.price,
    color: Colors.primary,
  },
  originalPrice: {
    ...Typography.bodySm,
    color: Colors.outline,
    textDecorationLine: "line-through" as const,
  },
  addButton: {
    backgroundColor: Colors.primaryContainer,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
});

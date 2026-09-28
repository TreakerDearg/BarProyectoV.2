import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { Plus, GlassWater, Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
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
            <Plus size={18} color={Colors.textInverse} strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    flexDirection: "row",
    overflow: "hidden",
  },
  imageContainer: {
    width: 110,
    height: 110,
    backgroundColor: Colors.cardSecondary,
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
    top: 8,
    left: 8,
    backgroundColor: Colors.dealRed,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  discountBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  authorBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  authorBadgeText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: "800",
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
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
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  originalPrice: {
    color: Colors.textMuted,
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

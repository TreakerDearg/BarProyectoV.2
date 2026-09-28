import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ShoppingBag } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { useCartStore } from "../stores/useCartStore";

interface FloatingCartBarProps {
  onPress: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ onPress }) => {
  const { getTotalItems, getTotalPrice } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (totalItems === 0) return null;

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onPress();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.bar} onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.leftInfo}>
          <View style={styles.badge}>
            <ShoppingBag size={18} color="#000" />
            <Text style={styles.badgeCount}>{totalItems}</Text>
          </View>
          <Text style={styles.totalText}>${totalPrice.toLocaleString("es-AR")}</Text>
        </View>

        <View style={styles.rightAction}>
          <Text style={styles.actionText}>Ver Pedido</Text>
          <Text style={styles.arrow}>➔</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 22,
    left: 16,
    right: 16,
  },
  bar: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: 12,
    gap: 4,
  },
  badgeCount: {
    color: Colors.textInverse,
    fontWeight: "900",
    fontSize: 14,
  },
  totalText: {
    color: Colors.textInverse,
    fontWeight: "900",
    fontSize: 17,
  },
  rightAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    color: Colors.textInverse,
    fontWeight: "900",
    fontSize: 15,
  },
  arrow: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: "900",
  },
});

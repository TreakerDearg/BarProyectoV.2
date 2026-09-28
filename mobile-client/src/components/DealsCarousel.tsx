import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Sparkles, Gift, Tag } from "lucide-react-native";
import { Colors } from "../theme/colors";
import { getPublicPromotions } from "../api/promoApi";
import type { PromotionPublicDTO } from "../types/api";

interface DealsCarouselProps {
  onSelectPromo?: (promo: PromotionPublicDTO) => void;
}

export const DealsCarousel: React.FC<DealsCarouselProps> = ({ onSelectPromo }) => {
  const [promotions, setPromotions] = useState<PromotionPublicDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicPromotions()
      .then((data) => setPromotions(data.filter((p) => p.active)))
      .catch((err) => console.warn("[DealsCarousel] Error cargando ofertas:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  if (promotions.length === 0) {
    // Si no hay promociones dinámicas en backend, mostramos la oferta estándar de bienvenida
    return (
      <View style={styles.singleBanner}>
        <View style={styles.dealBadge}>
          <Sparkles size={13} color="#FFF" />
          <Text style={styles.dealBadgeText}>EXCLUSIVO APP</Text>
        </View>
        <Text style={styles.dealTitle}>Happy Hour 2×1 en Tragos de Autor</Text>
        <Text style={styles.dealSubtitle}>
          Pide desde tu mesa y recibe la ronda en minutos.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Tag size={16} color={Colors.primary} />
        <Text style={styles.sectionTitle}>Beneficios & Promociones</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {promotions.map((promo) => {
          const badgeText =
            promo.type === "2X1"
              ? "2×1"
              : promo.type === "PERCENT"
              ? `-${promo.value}%`
              : promo.type === "FLAT"
              ? `-$${promo.value}`
              : "OFERTA";

          return (
            <TouchableOpacity
              key={promo.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => onSelectPromo?.(promo)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.dealBadge}>
                  <Sparkles size={11} color="#FFF" />
                  <Text style={styles.dealBadgeText}>{badgeText}</Text>
                </View>
                <Text style={styles.appOnlyText}>En App</Text>
              </View>

              <Text style={styles.cardTitle} numberOfLines={2}>
                {promo.name}
              </Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {promo.description || "Aprovecha esta promoción especial hoy en tu mesa."}
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
    marginVertical: 14,
  },
  loadingContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  scrollContent: {
    gap: 12,
  },
  card: {
    width: 250,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dealBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dealRed,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  dealBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  appOnlyText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  singleBanner: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 12,
  },
  dealTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 2,
  },
  dealSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});

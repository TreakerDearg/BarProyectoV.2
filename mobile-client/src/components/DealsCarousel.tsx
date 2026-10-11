import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Sparkles, Tag } from "lucide-react-native";
import { Colors, NocturneColors } from "../theme/colors";
import { Typography, Spacing, Radius } from "../theme/";
import { NBadge } from "./shared/NBadge";
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
    return (
      <View style={styles.singleBanner}>
        <NBadge
          label="EXCLUSIVO APP"
          tone="ember"
          solid
          icon={<Sparkles size={12} color={Colors.onPrimary} />}
        />
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
                <NBadge
                  label={badgeText}
                  tone="error"
                  icon={<Sparkles size={11} color={Colors.error} />}
                />
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
    marginVertical: Spacing.smMd,
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
    ...Typography.headlineSm,
    color: Colors.onSurface,
    letterSpacing: 0.3,
  },
  scrollContent: {
    gap: Spacing.smMd,
  },
  card: {
    width: 250,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: NocturneColors.borderSubtle,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  appOnlyText: {
    ...Typography.labelSm,
    color: Colors.outline,
  },
  cardTitle: {
    ...Typography.titleMd,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  cardDesc: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  singleBanner: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: NocturneColors.borderSubtle,
    marginVertical: Spacing.smMd,
  },
  dealTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
    marginTop: 6,
    marginBottom: 2,
  },
  dealSubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
});

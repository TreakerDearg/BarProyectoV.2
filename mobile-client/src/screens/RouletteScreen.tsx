import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { X, Sparkles, Gift, RotateCw, Flame } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { getPublicRouletteDrinks, spinPublicRoulette } from "../api/rouletteApi";
import { getErrorMessage } from "../api/client";
import type { RouletteDrinkDTO } from "../types/api";

interface RouletteScreenProps {
  onClose: () => void;
}

export const RouletteScreen: React.FC<RouletteScreenProps> = ({ onClose }) => {
  const [drinks, setDrinks] = useState<RouletteDrinkDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<RouletteDrinkDTO | null>(null);

  useEffect(() => {
    getPublicRouletteDrinks()
      .then(setDrinks)
      .catch((e) => console.warn("[Roulette] Error cargando tragos:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleSpin = async () => {
    if (spinning) return;

    setSpinning(true);
    setSelectedDrink(null);

    // Efecto háptico de inicio de giro
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    // Simular rotación háptica durante 2.5 segundos
    const interval = setInterval(() => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }, 180);

    try {
      const res = await spinPublicRoulette();

      setTimeout(() => {
        clearInterval(interval);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        setSelectedDrink(res.selected);
        setSpinning(false);
      }, 2400);
    } catch (err) {
      clearInterval(interval);
      setSpinning(false);
      Alert.alert("Error en la Ruleta", getErrorMessage(err));
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Gift size={20} color={Colors.dealGreen} />
          <Text style={styles.headerTitle}>Ruleta Nebula</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.badgeRow}>
          <View style={styles.rewardBadge}>
            <Sparkles size={12} color="#000" />
            <Text style={styles.rewardBadgeText}>PREMIO AL INSTANTE</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Gira y Descubre tu Cóctel de la Noche</Text>
        <Text style={styles.heroSub}>
          Prueba tu suerte con cócteles exclusivos seleccionados por nuestros bartenders con ingredientes de autor.
        </Text>

        {/* RUEDA / CONTENEDOR VISUAL */}
        <View style={styles.wheelArea}>
          <View style={[styles.wheelCircle, spinning && styles.wheelSpinning]}>
            <Sparkles size={56} color={Colors.primary} />
            <Text style={styles.wheelBrand}>NEBULA</Text>
          </View>
        </View>

        {/* RESULTADO GANADOR */}
        {selectedDrink && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Flame size={18} color={Colors.dealRed} />
              <Text style={styles.resultRarity}>{selectedDrink.rarity}</Text>
            </View>
            <Text style={styles.resultName}>{selectedDrink.name}</Text>

            {selectedDrink.recipe?.ingredients && (
              <View style={styles.ingredientsBox}>
                <Text style={styles.ingredientsTitle}>Ingredientes de la receta:</Text>
                {selectedDrink.recipe.ingredients.map((ing, idx) => (
                  <Text key={idx} style={styles.ingredientText}>
                    • {ing.name} ({ing.quantity} {ing.unit})
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.claimNotice}>
              Muestra este resultado a tu bartender o pídelo en tu comanda de mesa.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FOOTER BOTÓN GIRAR */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.spinButton, spinning && { opacity: 0.7 }]}
          onPress={handleSpin}
          disabled={spinning || loading}
          activeOpacity={0.85}
        >
          {spinning ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <RotateCw size={20} color="#000" />
              <Text style={styles.spinButtonText}>GIRAR RULETA AHORA</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  badgeRow: {
    marginBottom: 10,
  },
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dealGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  rewardBadgeText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 320,
    marginBottom: 24,
  },
  wheelArea: {
    marginVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: Colors.card,
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  wheelSpinning: {
    borderColor: Colors.dealGreen,
    shadowColor: Colors.dealGreen,
  },
  wheelBrand: {
    color: Colors.primary,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 2,
    marginTop: 6,
  },
  resultCard: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 20,
    gap: 8,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultRarity: {
    color: Colors.dealRed,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  resultName: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
  },
  ingredientsBox: {
    backgroundColor: Colors.cardSecondary,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    gap: 4,
  },
  ingredientsTitle: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 2,
  },
  ingredientText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  claimNotice: {
    color: Colors.textMuted,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 6,
  },
  footer: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  spinButton: {
    backgroundColor: Colors.dealGreen,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  spinButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});

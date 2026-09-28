import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { QrCode, Sparkles } from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useSessionStore } from "../stores/useSessionStore";

interface HeaderContextProps {
  onOpenScanner: () => void;
}

export const HeaderContext: React.FC<HeaderContextProps> = ({ onOpenScanner }) => {
  const { tableNumber, tableCode } = useSessionStore();

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brandTitle}>NEBULA BAR</Text>
        <View style={styles.contextBadge}>
          <View style={[styles.pulseDot, !tableNumber ? { backgroundColor: Colors.primary } : undefined]} />
          <Text style={styles.contextText}>
            {tableNumber
              ? `Mesa #${tableNumber} · Código ${tableCode}`
              : "Retiro en Barra · Toca para mesa"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.qrButton, tableNumber ? styles.qrButtonActive : undefined]}
        onPress={onOpenScanner}
        activeOpacity={0.8}
      >
        <QrCode size={18} color={tableNumber ? Colors.dealGreen : Colors.primary} />
        <Text style={[styles.qrButtonText, tableNumber ? { color: Colors.dealGreen } : undefined]}>
          {tableNumber ? "Mesa Conectada" : "Escanear Mesa"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  contextBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dealGreen,
    marginRight: 6,
  },
  contextText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrButtonActive: {
    borderColor: "rgba(16, 185, 129, 0.4)",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  qrButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
});

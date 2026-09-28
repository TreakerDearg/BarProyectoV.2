import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { X, QrCode, Hash, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { lookupTableByCode } from "../api/tableApi";
import { useSessionStore } from "../stores/useSessionStore";
import { getErrorMessage } from "../api/client";

interface QRScannerScreenProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ onClose, onSuccess }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const setTableSession = useSessionStore((s) => s.setTableSession);

  const handleValidateCode = async (codeToTest?: string) => {
    const finalCode = (codeToTest || code).trim();
    if (finalCode.length !== 3) {
      Alert.alert("Código inválido", "El código de mesa debe tener 3 dígitos.");
      return;
    }

    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const res = await lookupTableByCode(finalCode);

      // Asociar sesión en store
      setTableSession(res.tableId, res.sessionId, res.tableNumber, res.tableCode);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("¡Mesa Conectada!", `Te has vinculado a la Mesa #${res.tableNumber}. Ya puedes pedir directo a barra.`);
      onSuccess();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error de conexión", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (code.length < 3) {
      Haptics.selectionAsync();
      const newCode = code + num;
      setCode(newCode);
      if (newCode.length === 3) {
        handleValidateCode(newCode);
      }
    }
  };

  const handleBackspace = () => {
    Haptics.selectionAsync();
    setCode((prev) => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <QrCode size={22} color={Colors.primary} />
          <Text style={styles.headerTitle}>Conectar Mesa</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.instructions}>
          Ingresa el código numérico de 3 dígitos visible en el posavasos o pantalla del camarero.
        </Text>

        {/* DISPLAY DEL CÓDIGO */}
        <View style={styles.codeDisplay}>
          {[0, 1, 2].map((idx) => (
            <View key={idx} style={[styles.codeBox, code[idx] ? styles.codeBoxFilled : null]}>
              <Text style={styles.codeText}>{code[idx] || "—"}</Text>
            </View>
          ))}
        </View>

        {loading && <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />}

        {/* TECLADO NUMÉRICO RÁPIDO */}
        <View style={styles.keypad}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"].map((key) => {
            const isAction = key === "C" || key === "OK";

            return (
              <TouchableOpacity
                key={key}
                style={[styles.key, isAction && styles.actionKey]}
                onPress={() => {
                  if (key === "C") handleBackspace();
                  else if (key === "OK") handleValidateCode();
                  else handleKeyPress(key);
                }}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={[styles.keyText, isAction && styles.actionKeyText]}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    paddingVertical: 18,
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
    padding: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  instructions: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 10,
  },
  codeDisplay: {
    flexDirection: "row",
    gap: 16,
    marginVertical: 20,
  },
  codeBox: {
    width: 65,
    height: 75,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  codeBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardSecondary,
  },
  codeText: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: "900",
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    maxWidth: 320,
    justifyContent: "center",
    gap: 14,
    marginBottom: 20,
  },
  key: {
    width: 80,
    height: 65,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  actionKey: {
    backgroundColor: Colors.cardSecondary,
  },
  actionKeyText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "800",
  },
});

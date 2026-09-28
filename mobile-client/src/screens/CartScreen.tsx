import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { X, Minus, Plus, Trash2, Send, ShoppingBag, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { useCartStore } from "../stores/useCartStore";
import { useSessionStore } from "../stores/useSessionStore";
import { createOrder } from "../api/orderApi";
import { getErrorMessage } from "../api/client";
import type { OrderPublicDTO } from "../types/api";

interface CartScreenProps {
  onClose: () => void;
  onOrderSuccess: (order: OrderPublicDTO) => void;
  onOpenTableConnect: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onClose,
  onOrderSuccess,
  onOpenTableConnect,
}) => {
  const { cart, removeFromCart, setLineQty, clearCart, getTotalPrice } = useCartStore();
  const { tableId, sessionId, tableNumber, tableCode } = useSessionStore();
  const [submitting, setSubmitting] = useState(false);
  const [tipPercent, setTipPercent] = useState<number>(10);

  const subtotal = getTotalPrice();
  const tipAmount = Math.round((subtotal * tipPercent) / 100);
  const total = subtotal + tipAmount;

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;

    if (!tableId || !sessionId) {
      Alert.alert(
        "Mesa no conectada",
        "Por favor ingresa el código de tu mesa para que el personal sepa a dónde llevar tu orden.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Conectar Mesa", onPress: onOpenTableConnect },
        ]
      );
      return;
    }

    setSubmitting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const payload = {
        table: tableId,
        sessionId,
        items: cart.map((line) => ({
          product: line.productId,
          quantity: line.quantity,
          notes: line.notes || undefined,
        })),
        notes: tipPercent > 0 ? `Propina sugerida: ${tipPercent}% ($${tipAmount})` : "",
      };

      const order = await createOrder(payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      clearCart();
      onOrderSuccess(order);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error al enviar comanda", getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <ShoppingBag size={20} color={Colors.primary} />
          <Text style={styles.headerTitle}>Tu Pedido</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* MESA INDICATOR */}
      <View style={[styles.tableBar, !tableNumber && styles.tableBarWarning]}>
        <View style={styles.tableBarInfo}>
          {tableNumber ? (
            <>
              <Text style={styles.tableBarTitle}>Mesa #{tableNumber}</Text>
              <Text style={styles.tableBarSub}>Código de sesión: {tableCode}</Text>
            </>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <AlertCircle size={18} color={Colors.dealRed} />
              <Text style={styles.tableBarWarningText}>Sin mesa conectada</Text>
            </View>
          )}
        </View>

        {!tableNumber && (
          <TouchableOpacity style={styles.connectBtn} onPress={onOpenTableConnect}>
            <Text style={styles.connectBtnText}>Conectar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ITEMS LIST */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {cart.map((item) => (
          <View key={item.productId} style={styles.itemCard}>
            <View style={styles.itemTopRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                ${(item.price * item.quantity).toLocaleString("es-AR")}
              </Text>
            </View>

            {item.notes ? (
              <Text style={styles.itemNotes}>Nota: "{item.notes}"</Text>
            ) : null}

            <View style={styles.itemControlsRow}>
              <TouchableOpacity
                onPress={() => removeFromCart(item.productId)}
                style={styles.deleteBtn}
              >
                <Trash2 size={16} color={Colors.dealRed} />
                <Text style={styles.deleteText}>Quitar</Text>
              </TouchableOpacity>

              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setLineQty(item.productId, item.quantity - 1)}
                >
                  <Minus size={14} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.stepCount}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setLineQty(item.productId, item.quantity + 1)}
                >
                  <Plus size={14} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* PROPINA OPCIONAL ESTILO FAST FOOD */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Propina para la barra/servicio</Text>
          <View style={styles.tipRow}>
            {[0, 10, 15, 20].map((pct) => (
              <TouchableOpacity
                key={pct}
                style={[styles.tipChip, tipPercent === pct && styles.tipChipActive]}
                onPress={() => setTipPercent(pct)}
              >
                <Text style={[styles.tipChipText, tipPercent === pct && styles.tipChipTextActive]}>
                  {pct === 0 ? "Sin propina" : `${pct}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RESUMEN DE TOTALES */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toLocaleString("es-AR")}</Text>
          </View>
          {tipPercent > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Propina ({tipPercent}%)</Text>
              <Text style={styles.summaryValue}>${tipAmount.toLocaleString("es-AR")}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalValue}>${total.toLocaleString("es-AR")}</Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER SUBMIT */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          onPress={handleSubmitOrder}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Send size={18} color="#000" />
              <Text style={styles.submitButtonText}>
                Enviar a Barra · ${total.toLocaleString("es-AR")}
              </Text>
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
  tableBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableBarWarning: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderBottomColor: "rgba(239, 68, 68, 0.3)",
  },
  tableBarInfo: {
    flex: 1,
  },
  tableBarTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  tableBarSub: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  tableBarWarningText: {
    color: Colors.dealRed,
    fontSize: 13,
    fontWeight: "700",
  },
  connectBtn: {
    backgroundColor: Colors.dealRed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  connectBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 18,
    gap: 12,
  },
  itemCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  itemPrice: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  itemNotes: {
    color: Colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 10,
  },
  itemControlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deleteText: {
    color: Colors.dealRed,
    fontSize: 12,
    fontWeight: "600",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 4,
  },
  stepBtn: {
    padding: 8,
  },
  stepCount: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    paddingHorizontal: 6,
  },
  tipCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  tipTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: "row",
    gap: 8,
  },
  tipChip: {
    flex: 1,
    backgroundColor: Colors.cardSecondary,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  tipChipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  tipChipTextActive: {
    color: Colors.primary,
    fontWeight: "800",
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 6,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  totalValue: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  footer: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  submitButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: "800",
  },
});

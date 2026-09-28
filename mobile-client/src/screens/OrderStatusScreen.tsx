import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { X, CheckCircle, Clock, GlassWater, Sparkles, Receipt, RefreshCw } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { socketService } from "../socket/socketService";
import { getOrderById } from "../api/orderApi";
import { getTableDetails } from "../api/tableApi";
import type { OrderPublicDTO, TablePublicDTO } from "../types/api";

interface OrderStatusScreenProps {
  initialOrder: OrderPublicDTO;
  onClose: () => void;
}

export const OrderStatusScreen: React.FC<OrderStatusScreenProps> = ({
  initialOrder,
  onClose,
}) => {
  const [order, setOrder] = useState<OrderPublicDTO>(initialOrder);
  const [tableSummary, setTableSummary] = useState<TablePublicDTO | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Escuchar eventos en vivo desde Socket.IO
  useEffect(() => {
    // 1. Escuchar actualizaciones de la orden
    const unsubscribeOrder = socketService.onOrderUpdate((updatedOrder) => {
      if (updatedOrder?.id === order.id || updatedOrder?._id === order.id) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setOrder((prev) => ({ ...prev, ...updatedOrder }));
      }
    });

    // 2. Escuchar aviso cuando un ítem específico esté listo
    const unsubscribeItem = socketService.onItemReady((data) => {
      if (data?.orderId === order.id) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Recargar orden para refrescar estados de ítems
        reloadOrder();
      }
    });

    // 3. Cargar detalle de la mesa (balanceDue)
    if (order.table) {
      getTableDetails(order.table)
        .then(setTableSummary)
        .catch((e) => console.warn("[OrderStatus] Error cargando mesa:", e));
    }

    return () => {
      unsubscribeOrder();
      unsubscribeItem();
    };
  }, [order.id]);

  const reloadOrder = async () => {
    setRefreshing(true);
    try {
      const fresh = await getOrderById(order.id);
      setOrder(fresh);
      if (order.table) {
        const table = await getTableDetails(order.table);
        setTableSummary(table);
      }
    } catch (e) {
      console.warn("[OrderStatus] Error refrescando orden:", e);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusStep = () => {
    if (order.status === "completed") return 3;
    if (order.status === "in-progress") return 2;
    return 1; // pending
  };

  const step = getStatusStep();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Clock size={20} color={Colors.primary} />
          <Text style={styles.headerTitle}>Estado de Comanda</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* TIMELINE VISUAL ESTILO DOMINO'S / MCDONALD'S */}
        <View style={styles.timelineCard}>
          <Text style={styles.orderNumber}>Orden #{order.id.slice(-5).toUpperCase()}</Text>

          {/* BARRA DE PROGRESO */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" },
              ]}
            />
          </View>

          {/* PASOS */}
          <View style={styles.stepsRow}>
            <View style={styles.stepCol}>
              <View style={[styles.stepIconBox, step >= 1 && styles.stepIconBoxActive]}>
                <CheckCircle size={18} color={step >= 1 ? Colors.textInverse : Colors.textMuted} />
              </View>
              <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Recibido</Text>
            </View>

            <View style={styles.stepCol}>
              <View style={[styles.stepIconBox, step >= 2 && styles.stepIconBoxActive]}>
                <GlassWater size={18} color={step >= 2 ? Colors.textInverse : Colors.textMuted} />
              </View>
              <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>En Barra</Text>
            </View>

            <View style={styles.stepCol}>
              <View style={[styles.stepIconBox, step >= 3 && styles.stepIconBoxActive]}>
                <Sparkles size={18} color={step >= 3 ? Colors.textInverse : Colors.textMuted} />
              </View>
              <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>Servido</Text>
            </View>
          </View>

          {/* MENSAJE DE ESTADO */}
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>
              {step === 1 && "Tu comanda fue recibida por el personal. Pronto comenzará la preparación."}
              {step === 2 && "El bartender está preparando tus bebidas con recetas oficiales."}
              {step === 3 && "¡Tu pedido fue servido en tu mesa! ¡Que disfrutes la experiencia!"}
            </Text>
          </View>
        </View>

        {/* ITEMS EN LA COMANDA */}
        <View style={styles.itemsCard}>
          <Text style={styles.cardHeaderTitle}>Detalle de la Ronda</Text>
          {order.items?.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemBullet}>
                <Text style={styles.itemQty}>{item.quantity}×</Text>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                {item.notes ? <Text style={styles.itemSubNotes}>{item.notes}</Text> : null}
              </View>
              <View style={[styles.itemBadge, item.status === "ready" && styles.itemBadgeReady]}>
                <Text style={styles.itemBadgeText}>
                  {item.status === "ready" ? "Listo" : item.status === "preparing" ? "Preparando" : "En cola"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* RESUMEN DE CUENTA TOTAL DE LA MESA */}
        {tableSummary && (
          <View style={styles.checkCard}>
            <View style={styles.checkHeader}>
              <Receipt size={18} color={Colors.primary} />
              <Text style={styles.checkTitle}>Cuenta Total de la Mesa #{tableSummary.number}</Text>
            </View>
            <View style={styles.checkRow}>
              <Text style={styles.checkLabel}>Total consumido</Text>
              <Text style={styles.checkValue}>${(tableSummary.totalAmount || 0).toLocaleString("es-AR")}</Text>
            </View>
            <View style={styles.checkRow}>
              <Text style={styles.checkLabel}>Saldo pendiente de cobro</Text>
              <Text style={[styles.checkValue, { color: Colors.dealRed }]}>
                ${(tableSummary.balanceDue || 0).toLocaleString("es-AR")}
              </Text>
            </View>
            <Text style={styles.checkNotice}>
              Puedes pedir la cuenta al camarero o pagar en la caja del salón con cualquier medio de pago.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FOOTER REFRESH */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={reloadOrder}
          disabled={refreshing}
          activeOpacity={0.8}
        >
          <RefreshCw size={16} color={Colors.primary} />
          <Text style={styles.refreshBtnText}>
            {refreshing ? "Actualizando estado..." : "Actualizar Estado"}
          </Text>
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
    padding: 18,
    gap: 16,
  },
  timelineCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderNumber: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepCol: {
    alignItems: "center",
    gap: 6,
  },
  stepIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardSecondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepIconBoxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  stepLabelActive: {
    color: Colors.textPrimary,
    fontWeight: "800",
  },
  statusBanner: {
    backgroundColor: Colors.cardSecondary,
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  statusBannerText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  itemsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  cardHeaderTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  itemBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  itemQty: {
    color: Colors.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  itemSubNotes: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  itemBadge: {
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemBadgeReady: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  itemBadgeText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  checkCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  checkHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  checkTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  checkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  checkValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  checkNotice: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  refreshBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.cardSecondary,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refreshBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});

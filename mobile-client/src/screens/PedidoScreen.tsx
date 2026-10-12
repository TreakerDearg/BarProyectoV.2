// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — PedidoScreen
// Orquesta 3 estados:
//   "empty"    → sin items en carrito → empty state con CTA a Carta
//   "cart"     → items para revisar → CartView embebida + gate de mesa
//   "tracking" → orden enviada → timeline tiempo real con Socket.IO
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import {
  ShoppingBag, Send,
  CheckCircle2, Flame, Sparkles,
  AlertCircle, RefreshCw, QrCode,
  UtensilsCrossed, Receipt, ChefHat, PhoneCall, TicketPercent,
  Clock, Martini,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation }  from '../theme/elevation';

import { useCartStore }    from '../stores/useCartStore';
import { useSessionStore } from '../stores/useSessionStore';
import { useAuthStore }    from '../stores/useAuthStore';
import { usePointsStore }  from '../stores/usePointsStore';
import { createOrder, getOrderById } from '../api/orderApi';
import { getTableDetails }           from '../api/tableApi';
import { getErrorMessage }           from '../api/client';
import { socketService }             from '../socket/socketService';
import {
  ORDER_STATUS_STEPS, getOrderStepIndex, getOrderEtaMinutes,
  getOrderStatusMessage, getOrderStatusMeta, SERVICE_MODE_META,
} from '../utils/status';

import { NEmptyState } from '../components/shared/NEmptyState';
import { NButton }     from '../components/shared/NButton';
import { NToast }      from '../components/shared/NToast';
import { CartItemRow } from '../components/shared/CartItemRow';
import { StatusBadge } from '../components/shared/StatusBadge';
import { FulfillmentSheet } from '../components/shared/FulfillmentSheet';
import { QRScannerScreen } from './QRScannerScreen';

import { getPublicProducts } from '../api/menuApi';

import type { OrderPublicDTO, TablePublicDTO, ProductPublicDTO } from '../types/api';
import type { RootTabParamList } from '../navigation/types';

type PedidoNav = BottomTabNavigationProp<RootTabParamList, 'Pedidos'>;
type ScreenState = 'empty' | 'cart' | 'tracking';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtPrice(n: number) {
  return `$${n.toLocaleString('es-AR')}`;
}

// ── Notes renderer ────────────────────────────────────────────────────────────
function renderNotes(notes: string | undefined): React.ReactNode {
  if (!notes) return null;
  const bracketMatch = notes.match(/\[(.+?)\]/);
  if (bracketMatch) {
    const parts = bracketMatch[1].split(' | ').filter(Boolean);
    const remainder = notes.replace(/\[.+?\]\s*/, '').trim();
    return (
      <View style={subStyles.notesRow}>
        {parts.map((p, i) => (
          <View key={i} style={subStyles.noteBadge}>
            <Text style={subStyles.noteBadgeText}>{p}</Text>
          </View>
        ))}
        {remainder ? <Text style={subStyles.itemNotes}>{remainder}</Text> : null}
      </View>
    );
  }
  return <Text style={subStyles.itemNotes}>"{notes}"</Text>;
}

// ── Sub-views ──────────────────────────────────────────────────────────────────

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyCartView({ onGoToCarta }: { onGoToCarta: () => void }) {
  return (
    <View style={subStyles.emptyWrap}>
      <NEmptyState
        icon={<ShoppingBag size={32} color={Colors.outline} />}
        title="Tu pedido está vacío"
        subtitle="Explorá la carta y agregá productos para hacer tu comanda."
        action={{ label: 'Ver carta', onPress: onGoToCarta }}
      />
    </View>
  );
}

// ─── Mesa Gate ────────────────────────────────────────────────────────────────
// Respaldo cuando el destino elegido es "Mesa" pero todavía no hay mesa
// conectada. Mismo lenguaje que FulfillmentSheet.
function MesaGate({
  onOpenScanner,
  onSkip,
}: {
  onOpenScanner: () => void;
  onSkip: () => void;
}) {
  return (
    <View style={subStyles.gateCard}>
      <View style={subStyles.gateIcon}>
        <QrCode size={24} color={Colors.primary} />
      </View>
      <View style={subStyles.gateText}>
        <Text style={subStyles.gateTitle}>Conectá tu mesa</Text>
        <Text style={subStyles.gateSub}>
          Escaneá el QR de la mesa o ingresá el código de 3 dígitos para que sepamos adónde llevar tu pedido.
        </Text>
      </View>
      <View style={subStyles.gateActions}>
        <NButton
          label="Escanear QR de mesa"
          onPress={onOpenScanner}
          variant="primary"
          size="sm"
          fullWidth
          icon={<QrCode size={16} color={Colors.onPrimary} />}
        />
        <NButton
          label="Prefiero retiro en barra"
          onPress={onSkip}
          variant="text"
          size="sm"
          fullWidth
        />
      </View>
    </View>
  );
}

// ─── Cart View ────────────────────────────────────────────────────────────────
function CartView({
  onSubmitSuccess,
  onOpenScanner,
  onChangeDestination,
}: {
  onSubmitSuccess:     (order: OrderPublicDTO) => void;
  onOpenScanner:       () => void;
  onChangeDestination: () => void;
}) {
  const {
    cart, addToCart, removeFromCart, setLineQty, clearCart,
    appliedCoupon,
    tipPercent, setTipPercent,
    getSubtotal, getDiscountAmount, getTipAmount, getTotalWithTipAndDiscount,
  } = useCartStore();
  const { tableId, sessionId, tableNumber, tableCode, serviceMode, setServiceMode } = useSessionStore();
  const { token }                                       = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  // UpsellRow: featured products
  const [upsellProducts, setUpsellProducts] = useState<ProductPublicDTO[]>([]);
  useEffect(() => {
    getPublicProducts()
      .then((all) =>
        setUpsellProducts(all.filter((p) => p.featured && p.available).slice(0, 3))
      )
      .catch(() => {});
  }, []);

  const subtotal       = getSubtotal();
  const discountAmount = getDiscountAmount();
  const tipAmount      = getTipAmount();
  const total          = getTotalWithTipAndDiscount();
  const hasMesa        = !!tableId && !!sessionId;
  const usingTable     = hasMesa && serviceMode === 'table';
  const showGate       = serviceMode === 'table' && !hasMesa;

  // Destino del pedido: siempre visible y cambiable
  const destMeta  = usingTable ? SERVICE_MODE_META.table : SERVICE_MODE_META.bar;
  const DestIcon  = destMeta.icon;
  const destValue = usingTable
    ? `Mesa #${tableNumber}${tableCode ? ` · Código ${tableCode}` : ''}`
    : SERVICE_MODE_META.bar.label;

  const handleSubmit = async () => {
    if (serviceMode === 'table' && !hasMesa) {
      onOpenScanner();
      return;
    }
    setSubmitting(true);
    try {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
      const order = await createOrder({
        table:     usingTable ? (tableId ?? '') : '',
        sessionId: usingTable ? (sessionId ?? '') : '',
        items:     cart.map((l) => ({
          product:  l.productId,
          quantity: l.quantity,
          notes:    l.notes || undefined,
        })),
        notes: tipPercent > 0 ? `Propina sugerida: ${tipPercent}% ($${tipAmount})` : '',
      });
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      const itemCount = cart.length;
      clearCart();
      usePointsStore.getState().addLocal(itemCount * 5, `Pedido enviado (${itemCount} items)`);
      onSubmitSuccess(order);
    } catch (err) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      Alert.alert('Error al enviar comanda', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={subStyles.cartScroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Destino del pedido — siempre visible y cambiable */}
      <View style={subStyles.destinationCard}>
        <View style={[subStyles.destinationIcon, { backgroundColor: destMeta.bg }]}>
          <DestIcon size={18} color={destMeta.color} />
        </View>
        <View style={subStyles.destinationText}>
          <Text style={subStyles.destinationLabel}>Recibís en</Text>
          <Text style={subStyles.destinationValue}>{destValue}</Text>
        </View>
        <TouchableOpacity
          onPress={onChangeDestination}
          style={subStyles.changeBtn}
          accessibilityLabel="Cambiar forma de entrega"
        >
          <Text style={subStyles.changeBtnText}>Cambiar</Text>
        </TouchableOpacity>
      </View>

      {/* Estimated time badge */}
      <View style={subStyles.estimateBadge}>
        <Clock size={16} color={Colors.info} />
        <Text style={subStyles.estimateBadgeText}>~15 min · Entrega estimada</Text>
      </View>

      {/* Gate de mesa (respaldo si el destino Mesa no está conectado) */}
      {showGate && (
        <MesaGate
          onOpenScanner={onOpenScanner}
          onSkip={() => setServiceMode('bar')}
        />
      )}

      {/* Items del carrito — CartItemRow */}
      {cart.map((item) => (
        <CartItemRow
          key={item.productId}
          item={item}
          onIncrement={() => setLineQty(item.productId, item.quantity + 1)}
          onDecrement={() => setLineQty(item.productId, item.quantity - 1)}
          onRemove={() => removeFromCart(item.productId)}
        />
      ))}

      {/* UpsellRow — compact horizontal FlatList */}
      {upsellProducts.length > 0 && (
        <View style={subStyles.upsellSection}>
          <Text style={subStyles.upsellTitle}>También te puede gustar</Text>
          <FlatList
            data={upsellProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <View style={subStyles.upsellCard}>
                {item.image ? (
                  <ExpoImage
                    source={{ uri: item.image }}
                    style={subStyles.upsellImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={150}
                  />
                ) : (
                  <View style={[subStyles.upsellImage, subStyles.upsellImageFallback]}>
                    <Martini size={22} color={Colors.outline} />
                  </View>
                )}
                <Text style={subStyles.upsellName} numberOfLines={2}>{item.name}</Text>
                <TouchableOpacity
                  style={subStyles.upsellAdd}
                  onPress={() =>
                    addToCart({
                      productId: item.id,
                      name:      item.name,
                      price:     item.dynamicPrice ?? item.price,
                      image:     item.image,
                      notes:     '',
                      quantity:  1,
                    })
                  }
                >
                  <Text style={subStyles.upsellAddText}>+ Agregar</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {/* Selector de propina */}
      <View style={subStyles.tipCard}>
        <Text style={subStyles.tipTitle}>Propina para el servicio</Text>
        <View style={subStyles.tipRow}>
          {[0, 5, 10, 15, 20].map((pct) => (
            <TouchableOpacity
              key={pct}
              style={[subStyles.tipChip, tipPercent === pct && subStyles.tipChipActive]}
              onPress={() => setTipPercent(pct)}
            >
              <Text style={[subStyles.tipChipText, tipPercent === pct && subStyles.tipChipTextActive]}>
                {pct === 0 ? 'Sin' : `${pct}%`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Resumen de totales */}
      <View style={subStyles.summaryCard}>
        <View style={subStyles.summaryRow}>
          <Text style={subStyles.summaryLabel}>Subtotal</Text>
          <Text style={subStyles.summaryValue}>{fmtPrice(subtotal)}</Text>
        </View>
        {appliedCoupon && (
          <View style={subStyles.couponRow}>
            <View style={subStyles.couponBadge}>
              <TicketPercent size={13} color={Colors.success} />
              <Text style={subStyles.couponCode}>{appliedCoupon.code}</Text>
            </View>
            <Text style={subStyles.couponSaving}>
              Ahorrás {fmtPrice(discountAmount)}
            </Text>
          </View>
        )}
        {tipPercent > 0 && (
          <View style={subStyles.summaryRow}>
            <Text style={subStyles.summaryLabel}>Propina ({tipPercent}%)</Text>
            <Text style={subStyles.summaryValue}>{fmtPrice(tipAmount)}</Text>
          </View>
        )}
        <View style={[subStyles.summaryRow, subStyles.totalRow]}>
          <Text style={subStyles.totalLabel}>Total</Text>
          <Text style={subStyles.totalValue}>{fmtPrice(total)}</Text>
        </View>
      </View>

      {/* Botón enviar */}
      <NButton
        label={submitting ? 'Enviando...' : `Confirmar pedido · ${fmtPrice(total)}`}
        onPress={handleSubmit}
        loading={submitting}
        fullWidth
        size="lg"
        icon={<Send size={18} color={Colors.onPrimary} />}
      />
    </ScrollView>
  );
}

// ─── Tracking View ────────────────────────────────────────────────────────────
function TrackingView({
  order,
  onReorder,
}: {
  order:     OrderPublicDTO;
  onReorder: (order: OrderPublicDTO) => void;
}) {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [currentOrder, setCurrentOrder] = useState<OrderPublicDTO>(order);
  const [tableSummary, setTableSummary] = useState<TablePublicDTO | null>(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const [toastMsg,     setToastMsg]     = useState<string | null>(null);

  const stepIndex  = getOrderStepIndex(currentOrder.status);
  const statusMeta = getOrderStatusMeta(currentOrder.status);
  const StatusIcon = statusMeta.icon;

  // Animated progress bar
  const progressAnim = useRef(
    new Animated.Value(stepIndex >= 0 ? (stepIndex + 1) / ORDER_STATUS_STEPS.length : 0.33)
  ).current;

  // Step circle scale springs
  const stepScaleAnims = useRef(
    ORDER_STATUS_STEPS.map((_, i) => new Animated.Value(i <= stepIndex ? 1 : 0))
  ).current;

  const animateProgress = (newStepIdx: number) => {
    Animated.timing(progressAnim, {
      toValue: (newStepIdx + 1) / ORDER_STATUS_STEPS.length,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    ORDER_STATUS_STEPS.forEach((_, i) => {
      if (i <= newStepIdx) {
        Animated.spring(stepScaleAnims[i], {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  // Socket.IO listeners
  useEffect(() => {
    animateProgress(stepIndex);
    const unsubOrder = socketService.onOrderUpdate((updated) => {
      if (updated?.id === currentOrder.id || updated?._id === currentOrder.id) {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        setCurrentOrder((prev) => {
          const merged = { ...prev, ...updated };
          animateProgress(getOrderStepIndex(merged.status));
          return merged;
        });
      }
    });
    const unsubItem = socketService.onItemReady((data) => {
      if (data?.orderId === currentOrder.id) {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        reloadOrder();
      }
    });
    if (currentOrder.table) {
      getTableDetails(currentOrder.table)
        .then(setTableSummary)
        .catch(() => {});
    }
    return () => { unsubOrder(); unsubItem(); };
  }, [currentOrder.id]);

  const reloadOrder = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await getOrderById(currentOrder.id);
      setCurrentOrder(fresh);
      animateProgress(getOrderStepIndex(fresh.status));
      if (currentOrder.table) {
        const tbl = await getTableDetails(currentOrder.table);
        setTableSummary(tbl);
      }
    } catch {}
    finally { setRefreshing(false); }
  }, [currentOrder.id, currentOrder.table]);

  const handleCallWaiter = () => {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    setToastMsg('Se notificó al personal. En breve se acercan a tu mesa.');
  };

  const isCancelled = currentOrder.status === 'cancelled';
  const showEstimate = currentOrder.status === 'pending' || currentOrder.status === 'in-progress';

  return (
    <ScrollView
      contentContainerStyle={subStyles.trackingScroll}
      showsVerticalScrollIndicator={false}
    >
      <NToast
        visible={!!toastMsg}
        message={toastMsg ?? ''}
        variant="info"
        onHide={() => setToastMsg(null)}
      />

      {/* Timeline card */}
      <View style={subStyles.timelineCard}>
        <Text style={subStyles.orderNumLabel}>Pedido</Text>
        <Text style={subStyles.orderNumber}>
          #{currentOrder.id.slice(-3).toUpperCase()}
        </Text>

        {/* Fase actual — protagonista */}
        <View style={subStyles.statusHero}>
          <View style={[subStyles.statusHeroIcon, { backgroundColor: statusMeta.bg }]}>
            <StatusIcon size={22} color={statusMeta.color} />
          </View>
          <Text style={[subStyles.statusHeroLabel, { color: statusMeta.color }]}>
            {statusMeta.label}
          </Text>
          <Text style={subStyles.statusHeroMsg}>
            {getOrderStatusMessage(currentOrder.status)}
          </Text>
          {showEstimate && (
            <View style={subStyles.etaChip}>
              <Clock size={14} color={Colors.info} />
              <Text style={subStyles.etaChipText}>
                Listo en ~{getOrderEtaMinutes(currentOrder.status)} min
              </Text>
            </View>
          )}
        </View>


        {/* Barra de progreso animada */}
        {!isCancelled && (
          <View style={subStyles.progressTrack}>
            <Animated.View
              style={[
                subStyles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        )}

        {/* Pasos */}
        {!isCancelled && (
          <View style={subStyles.stepsRow}>
            {ORDER_STATUS_STEPS.map((step, idx) => {
              const done   = idx < stepIndex;
              const active = idx === stepIndex;
              const StepIcon = idx === 0 ? CheckCircle2 : idx === 1 ? Flame : Sparkles;
              return (
                <View key={step} style={subStyles.stepCol}>
                  <Animated.View style={[
                    subStyles.stepIconBox,
                    (done || active) && subStyles.stepIconBoxActive,
                    { transform: [{ scale: stepScaleAnims[idx] }] },
                  ]}>
                    <StepIcon
                      size={16}
                      color={(done || active) ? Colors.onPrimary : Colors.outline}
                    />
                  </Animated.View>
                  <Text style={[
                    subStyles.stepLabel,
                    (done || active) && subStyles.stepLabelActive,
                  ]}>
                    {getOrderStatusMeta(step).label}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

      </View>

      {/* Items de la comanda */}
      <View style={subStyles.itemsCard}>
        <Text style={subStyles.cardSectionTitle}>Detalle de la comanda</Text>
        {currentOrder.items?.map((item, idx) => (
          <View key={idx} style={subStyles.trackItemRow}>
            <View style={subStyles.trackItemBullet}>
              <Text style={subStyles.trackItemQty}>{item.quantity}×</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={subStyles.trackItemName}>{item.name}</Text>
              {item.notes ? (
                <Text style={subStyles.trackItemNotes}>{item.notes}</Text>
              ) : null}
            </View>
            <StatusBadge kind="item" status={item.status ?? 'pending'} />
          </View>
        ))}
      </View>

      {/* Cuenta de la mesa */}
      {tableSummary && (
        <View style={subStyles.checkCard}>
          <View style={subStyles.checkHeader}>
            <Receipt size={16} color={Colors.primary} />
            <Text style={subStyles.checkTitle}>
              Cuenta — Mesa #{tableSummary.number}
            </Text>
          </View>
          <View style={subStyles.checkRow}>
            <Text style={subStyles.checkLabel}>Total consumido</Text>
            <Text style={subStyles.checkValue}>
              {fmtPrice(tableSummary.totalAmount ?? 0)}
            </Text>
          </View>
          <View style={subStyles.checkRow}>
            <Text style={subStyles.checkLabel}>Saldo pendiente</Text>
            <Text style={[subStyles.checkValue, { color: Colors.error }]}>
              {fmtPrice(tableSummary.balanceDue ?? 0)}
            </Text>
          </View>
          <Text style={subStyles.checkNotice}>
            Pedí la cuenta al camarero o pagá en caja.
          </Text>
        </View>
      )}

      {/* Botones de acción (tracking) */}
      <View style={subStyles.trackingActions}>
        <NButton
          label={refreshing ? 'Actualizando...' : 'Actualizar estado'}
          onPress={reloadOrder}
          loading={refreshing}
          variant="ghost"
          fullWidth
          icon={<RefreshCw size={16} color={Colors.primary} />}
        />
        {(currentOrder.status === 'completed' || currentOrder.status === 'cancelled') && (
          <NButton
            label="Pedir de nuevo"
            onPress={() => onReorder(currentOrder)}
            variant="primary"
            fullWidth
            icon={<RefreshCw size={16} color={Colors.onPrimary} />}
          />
        )}
        {/* Always-visible quick actions */}
        <NButton
          label="Pedir algo más"
          variant="ghost"
          icon={<ChefHat size={16} color={Colors.primary} />}
          onPress={() => navigation.navigate('Carta')}
          fullWidth
        />
        <NButton
          label="Llamar al Mozo"
          variant="ghost"
          icon={<PhoneCall size={16} color={Colors.primary} />}
          onPress={handleCallWaiter}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

// ── PedidoScreen principal ────────────────────────────────────────────────────
export default function PedidoScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation   = useNavigation<PedidoNav>();

  const cart = useCartStore((s) => s.cart);
  const [screenState,     setScreenState]     = useState<ScreenState>('empty');
  const [activeOrder,     setActiveOrder]     = useState<OrderPublicDTO | null>(null);
  const [showQR,          setShowQR]          = useState(false);
  const [showFulfillment, setShowFulfillment] = useState(false);
  const [toastMsg,        setToastMsg]        = useState<string | null>(null);

  // Content fade animation
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const handleStateChange = useCallback((newState: ScreenState) => {
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setScreenState(newState);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [contentOpacity]);

  // Sincronizar estado con el carrito
  useEffect(() => {
    if (screenState === 'tracking') return;
    handleStateChange(cart.length > 0 ? 'cart' : 'empty');
  }, [cart.length]);

  const handleOrderSuccess = useCallback((order: OrderPublicDTO) => {
    setActiveOrder(order);
    handleStateChange('tracking');
  }, [handleStateChange]);

  // Pedir de nuevo: recrea el carrito con precios vigentes y vuelve a "cart"
  const handleReorder = useCallback(async (order: OrderPublicDTO) => {
    try {
      const products      = await getPublicProducts();
      const byId          = new Map(products.map((p) => [p.id, p]));
      const { addToCart } = useCartStore.getState();
      const added = order.items?.reduce((n, it) => {
        const pid  = typeof it.product === 'string' ? it.product : it.product?.id;
        const prod = pid ? byId.get(pid) : undefined;
        if (!prod || !prod.available) return n;
        addToCart({
          productId: prod.id,
          name:      prod.name,
          price:     prod.dynamicPrice ?? prod.price,
          image:     prod.image,
          notes:     it.notes ?? '',
          quantity:  it.quantity,
        });
        return n + 1;
      }, 0) ?? 0;

      if (added === 0) {
        setToastMsg('Los productos de este pedido no están disponibles ahora.');
        return;
      }
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setActiveOrder(null);
      handleStateChange('cart');
    } catch {
      setToastMsg('No pudimos repetir el pedido. Probá de nuevo.');
    }
  }, [handleStateChange]);

  const handleGoToCarta = useCallback(() => {
    navigation.navigate('Carta');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>
          {screenState === 'tracking' ? 'Seguimiento' : 'Mi Pedido'}
        </Text>
        {screenState === 'tracking' && activeOrder && (
          <View style={styles.orderNumBadge}>
            <Text style={styles.orderNumText}>
              #{activeOrder.id.slice(-5).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Contenido principal */}
      <Animated.View style={[styles.content, { paddingBottom: tabBarHeight, opacity: contentOpacity }]}>
        {screenState === 'empty' && (
          <EmptyCartView onGoToCarta={handleGoToCarta} />
        )}

        {screenState === 'cart' && (
          <CartView
            onSubmitSuccess={handleOrderSuccess}
            onOpenScanner={() => setShowQR(true)}
            onChangeDestination={() => setShowFulfillment(true)}
          />
        )}

        {screenState === 'tracking' && activeOrder && (
          <TrackingView
            order={activeOrder}
            onReorder={handleReorder}
          />
        )}
      </Animated.View>

      {/* Modal QR Scanner */}
      <Modal
        visible={showQR}
        animationType="slide"
        onRequestClose={() => setShowQR(false)}
      >
        <QRScannerScreen
          onClose={() => setShowQR(false)}
          onSuccess={() => {
            setShowQR(false);
            setToastMsg('Mesa conectada. Ya podés pedir desde tu mesa.');
          }}
        />
      </Modal>

      {/* FulfillmentSheet — cambiar destino sin salir del pedido */}
      <FulfillmentSheet
        visible={showFulfillment}
        onClose={() => setShowFulfillment(false)}
        onOpenScanner={() => setShowQR(true)}
      />

      {/* Toast global de la pantalla */}
      <NToast
        visible={!!toastMsg}
        message={toastMsg ?? ''}
        variant="info"
        onHide={() => setToastMsg(null)}
      />
    </SafeAreaView>
  );
}

// ── Estilos principales ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  headerBar: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: Spacing.gutter,
    paddingTop:      Spacing.md,
    paddingBottom:   Spacing.sm,
  },
  screenTitle: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
  },
  orderNumBadge: {
    backgroundColor: Colors.emberMuted,
    borderRadius:    Radius.xs,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:     1,
    borderColor:     Colors.emberBorder,
  },
  orderNumText: {
    ...Typography.labelMd,
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
});

// ── Estilos de sub-vistas ─────────────────────────────────────────────────────
const subStyles = StyleSheet.create({
  emptyWrap: { flex: 1 },

  // Estimate badge
  estimateBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: Colors.infoMuted,
    borderRadius:    Radius.md,
    paddingHorizontal: Spacing.smMd,
    paddingVertical:   8,
    borderWidth:     1,
    borderColor:     NocturneColors.infoBorder,
  },
  estimateBadgeText: {
    ...Typography.bodyMd,
    color: Colors.info,
  },

  // Upsell section
  upsellSection: {
    gap: Spacing.sm,
  },
  upsellTitle: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
    textTransform: 'none' as const,
  },
  upsellCard: {
    width:           120,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.lg,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
    gap:             4,
    paddingBottom:   Spacing.xs,
  },
  upsellImage: {
    width:  120,
    height: 80,
  },
  upsellImageFallback: {
    backgroundColor: Colors.surfaceContainerHighest,
    justifyContent:  'center',
    alignItems:      'center',
  },
  upsellName: {
    ...Typography.bodySm,
    color:             Colors.onSurface,
    paddingHorizontal: Spacing.xs,
  },
  upsellAdd: {
    marginHorizontal:  Spacing.xs,
    backgroundColor:   Colors.emberMuted,
    borderRadius:      Radius.sm,
    paddingVertical:   4,
    alignItems:        'center',
    borderWidth:       1,
    borderColor:       Colors.emberBorder,
  },
  upsellAddText: {
    ...Typography.labelSm,
    color:         Colors.primary,
    textTransform: 'none' as const,
    fontSize:      10,
  },

  // ── Cart ─────────────────────────────────────────────────────
  cartScroll: {
    padding:    Spacing.gutter,
    gap:        Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },

  // Destination card — "Recibís en"
  destinationCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    gap:             Spacing.smMd,
    borderWidth:     1,
    borderColor:     Colors.emberBorder,
  },
  destinationIcon: {
    width:           44,
    height:          44,
    borderRadius:    Radius.md,
    justifyContent:  'center',
    alignItems:      'center',
  },
  destinationText: {
    flex: 1,
    gap:  2,
  },
  destinationLabel: {
    ...Typography.labelSm,
    color:         Colors.onSurfaceVariant,
    textTransform: 'none' as const,
  },
  destinationValue: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
  },
  changeBtn: {
    backgroundColor: Colors.emberMuted,
    borderRadius:    Radius.full,
    borderWidth:     1,
    borderColor:     Colors.emberBorder,
    paddingHorizontal: 14,
    paddingVertical:   8,
  },
  changeBtnText: {
    ...Typography.labelMd,
    color:         Colors.primary,
    textTransform: 'none' as const,
  },

  // Gate
  gateCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     Colors.emberBorder,
  },
  gateIcon: {
    width:           44,
    height:          44,
    borderRadius:    Radius.full,
    backgroundColor: Colors.emberMuted,
    justifyContent:  'center',
    alignItems:      'center',
  },
  gateText: { gap: 4 },
  gateTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  gateSub:   { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  gateActions: { gap: Spacing.xs },

  // Items del carrito
  itemCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         Spacing.smMd,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
    gap:             6,
  },
  itemTopRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  itemName: { ...Typography.titleMd, color: Colors.onSurface, flex: 1 },
  itemPrice: { ...Typography.labelLg, color: Colors.primary, fontSize: 15 },
  itemNotes: { ...Typography.bodySm, color: Colors.outline, fontStyle: 'italic' },

  // Notes badges
  notesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  noteBadge: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  noteBadgeText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    textTransform: 'none' as const,
  },

  itemControlsRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  deleteText: { ...Typography.bodySm, color: Colors.error },
  stepper: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.md,
    paddingHorizontal: 4,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  stepBtn:   { padding: 8 },
  stepCount: { ...Typography.labelLg, color: Colors.onSurface, paddingHorizontal: 8 },

  // Propina
  tipCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         Spacing.smMd,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  tipTitle: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  tipRow: {
    flexDirection:   'row',
    gap:             4,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.full,
    padding:         4,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  tipChip: {
    flex:            1,
    paddingVertical: 11,
    borderRadius:    Radius.full,
    alignItems:      'center',
  },
  tipChipActive: { backgroundColor: Colors.primaryContainer },
  tipChipText:   { ...Typography.labelSm, color: Colors.onSurfaceVariant, textTransform: 'none' as const },
  tipChipTextActive: { color: Colors.onPrimary, fontWeight: '700' as const },

  // Resumen
  summaryCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         Spacing.smMd,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  summaryRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel:{ ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  summaryValue:{ ...Typography.bodyMd, color: Colors.onSurface },
  couponRow: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    backgroundColor: NocturneColors.successMuted,
    borderRadius:    Radius.md,
    paddingHorizontal: Spacing.smMd,
    paddingVertical:   8,
    borderWidth:     1,
    borderColor:     NocturneColors.successBorder,
  },
  couponBadge: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  couponCode: {
    ...Typography.labelMd,
    color:         Colors.success,
    textTransform: 'none' as const,
    letterSpacing: 0.4,
  },
  couponSaving: {
    ...Typography.labelLg,
    color: Colors.success,
  },
  totalRow: {
    borderTopWidth:  1,
    borderTopColor:  NocturneColors.borderSubtle,
    paddingTop:      Spacing.sm,
    marginTop:       4,
  },
  totalLabel: { ...Typography.headlineSm, color: Colors.onSurface },
  totalValue: { ...Typography.priceLg, color: Colors.primary },

  // ── Tracking ─────────────────────────────────────────────────
  trackingScroll: {
    padding:    Spacing.gutter,
    gap:        Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  timelineCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.xl,
    padding:         Spacing.lg,
    gap:             Spacing.md,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
    ...(Elevation.card as object),
  },
  orderNumLabel: {
    ...Typography.labelSm,
    color:         Colors.onSurfaceVariant,
    textAlign:     'center',
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
  },
  orderNumber: {
    ...Typography.orderNumber,
    color:     Colors.onSurface,
    textAlign: 'center',
  },
  statusHero: {
    alignItems: 'center',
    gap:        Spacing.xs,
  },
  statusHeroIcon: {
    width:           52,
    height:          52,
    borderRadius:    Radius.full,
    justifyContent:  'center',
    alignItems:      'center',
  },
  statusHeroLabel: {
    ...Typography.headlineLg,
    textAlign: 'center',
  },
  statusHeroMsg: {
    ...Typography.bodyMd,
    color:      Colors.onSurfaceVariant,
    textAlign:  'center',
    lineHeight: 21,
  },
  etaChip: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    backgroundColor: Colors.infoMuted,
    borderRadius:    Radius.full,
    paddingHorizontal: Spacing.smMd,
    paddingVertical:   6,
    borderWidth:     1,
    borderColor:     NocturneColors.infoBorder,
    marginTop:       Spacing.xs,
  },
  etaChipText: {
    ...Typography.labelMd,
    color: Colors.info,
  },
  progressTrack: {
    height:          8,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.full,
    overflow:        'hidden',
  },
  progressBar: {
    height:          '100%',
    backgroundColor: Colors.primary,
    borderRadius:    Radius.full,
    // Glow ember del progreso
    shadowColor:   Colors.primary,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius:  8,
    elevation:     4,
  },
  stepsRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
  },
  stepCol:    { alignItems: 'center', gap: 6 },
  stepIconBox: {
    width:           38,
    height:          38,
    borderRadius:    19,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  stepIconBoxActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor:     Colors.primaryContainer,
  },
  stepLabel: { ...Typography.labelSm, color: Colors.outline, textTransform: 'none' as const },
  stepLabelActive: { color: Colors.onSurface },
  // Items de tracking
  itemsCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  cardSectionTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  trackItemRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: NocturneColors.borderSubtle,
  },
  trackItemBullet: {
    width:           28,
    height:          28,
    borderRadius:    Radius.full,
    backgroundColor: Colors.emberMuted,
    justifyContent:  'center',
    alignItems:      'center',
  },
  trackItemQty:   { ...Typography.labelSm, color: Colors.primary },
  trackItemName:  { ...Typography.bodyMd, color: Colors.onSurface },
  trackItemNotes: { ...Typography.bodySm, color: Colors.outline },

  // Check card
  checkCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  checkHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkTitle:  { ...Typography.headlineSm, color: Colors.onSurface },
  checkRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  checkLabel:  { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  checkValue:  { ...Typography.labelLg, color: Colors.onSurface },
  checkNotice: { ...Typography.bodySm, color: Colors.outline },

  // Tracking actions
  trackingActions: { gap: Spacing.sm },
});

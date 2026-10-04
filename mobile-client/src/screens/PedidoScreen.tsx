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
  Image,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShoppingBag, Send,
  CheckCircle2, Flame, Sparkles,
  AlertCircle, RefreshCw, QrCode,
  UtensilsCrossed, Receipt, ChefHat, PhoneCall,
  Clock,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Colors }     from '../theme/colors';
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

import { NEmptyState } from '../components/shared/NEmptyState';
import { NButton }     from '../components/shared/NButton';
import { NToast }      from '../components/shared/NToast';
import { CartItemRow } from '../components/shared/CartItemRow';
import { ProductGridCard } from '../components/shared/ProductGridCard';
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

const ORDER_STATUS_STEPS = ['pending', 'in-progress', 'completed'] as const;

function getStepIndex(status: string) {
  return ORDER_STATUS_STEPS.indexOf(status as any);
}

const STATUS_LABEL: Record<string, string> = {
  pending:       'Recibido',
  'in-progress': 'En Barra',
  completed:     'Servido',
  cancelled:     'Cancelado',
};

const STATUS_MSG: Record<string, string> = {
  pending:       'Tu comanda fue recibida por el personal. Pronto comenzará la preparación.',
  'in-progress': 'El bartender está preparando tus bebidas con las recetas oficiales.',
  completed:     '¡Tu pedido fue servido! Disfrutá la experiencia Nebula.',
  cancelled:     'Esta comanda fue cancelada.',
};

const ITEM_STATUS_LABEL: Record<string, string> = {
  pending:    'En cola',
  preparing:  'Preparando',
  ready:      'Listo',
  served:     'Servido',
  cancelled:  'Cancelado',
};

const ESTIMATE: Record<string, number> = {
  pending:       15,
  'in-progress': 8,
  completed:     0,
  cancelled:     0,
};

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
          Ingresá el código de 3 dígitos para que el personal sepa adónde llevar tu pedido.
        </Text>
      </View>
      <View style={subStyles.gateActions}>
        <NButton
          label="Conectar mesa"
          onPress={onOpenScanner}
          variant="primary"
          size="sm"
          fullWidth
          icon={<QrCode size={16} color={Colors.onPrimary} />}
        />
        <NButton
          label="Pedir sin mesa (retiro en barra)"
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
}: {
  onSubmitSuccess: (order: OrderPublicDTO) => void;
  onOpenScanner:   () => void;
}) {
  const {
    cart, addToCart, removeFromCart, setLineQty, clearCart,
    appliedCoupon,
    tipPercent, setTipPercent,
    getSubtotal, getDiscountAmount, getTipAmount, getTotalWithTipAndDiscount,
  } = useCartStore();
  const { tableId, sessionId, tableNumber, tableCode } = useSessionStore();
  const { token }                                       = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [gateSkipped, setGateSkipped] = useState(false);
  const [destinationMode, setDestinationMode] = useState<'mesa' | 'bar'>(
    tableId ? 'mesa' : 'bar'
  );

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
  const showGate       = !hasMesa && !gateSkipped;

  const handleSubmit = async () => {
    if (!hasMesa && !gateSkipped) {
      onOpenScanner();
      return;
    }
    setSubmitting(true);
    try {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
      const order = await createOrder({
        table:     destinationMode === 'mesa' ? (tableId ?? '') : '',
        sessionId: destinationMode === 'mesa' ? (sessionId ?? '') : '',
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
      {/* Destination selector */}
      <View style={subStyles.destinationRow}>
        <TouchableOpacity
          style={[subStyles.destChip, destinationMode === 'mesa' && subStyles.destChipActive]}
          onPress={() => hasMesa && setDestinationMode('mesa')}
        >
          <Text style={[subStyles.destChipText, destinationMode === 'mesa' && subStyles.destChipTextActive]}>
            {hasMesa ? `Mesa #${tableNumber}` : 'Mesa'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[subStyles.destChip, destinationMode === 'bar' && subStyles.destChipActive]}
          onPress={() => setDestinationMode('bar')}
        >
          <Text style={[subStyles.destChipText, destinationMode === 'bar' && subStyles.destChipTextActive]}>
            Retiro en Barra
          </Text>
        </TouchableOpacity>
      </View>

      {/* Estimated time badge */}
      <View style={subStyles.estimateBadge}>
        <Clock size={16} color={Colors.info} />
        <Text style={subStyles.estimateBadgeText}>~15 min · Entrega estimada</Text>
      </View>

      {/* Mesa status */}
      <View style={[subStyles.mesaBar, !hasMesa && subStyles.mesaBarWarn]}>
        {hasMesa ? (
          <>
            <View style={subStyles.mesaDot} />
            <View style={{ flex: 1 }}>
              <Text style={subStyles.mesaTitle}>Mesa #{tableNumber}</Text>
              <Text style={subStyles.mesaSub}>Código: {tableCode}</Text>
            </View>
          </>
        ) : (
          <>
            <AlertCircle size={16} color={Colors.warning} />
            <Text style={[subStyles.mesaTitle, { color: Colors.warning, flex: 1 }]}>
              Sin mesa conectada
            </Text>
            <TouchableOpacity onPress={onOpenScanner} style={subStyles.connectBtn}>
              <Text style={subStyles.connectBtnText}>Conectar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Gate de mesa (si no hay mesa y no se skippeó) */}
      {showGate && (
        <MesaGate
          onOpenScanner={onOpenScanner}
          onSkip={() => setGateSkipped(true)}
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
                  <Image
                    source={{ uri: item.image }}
                    style={subStyles.upsellImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[subStyles.upsellImage, subStyles.upsellImageFallback]}>
                    <Text style={{ fontSize: 18 }}>🍹</Text>
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
          <View style={subStyles.summaryRow}>
            <Text style={[subStyles.summaryLabel, { color: Colors.success }]}>
              Cupón {appliedCoupon.code} ({appliedCoupon.type === 'PERCENT' ? `-${appliedCoupon.value}%` : `-$${appliedCoupon.value}`})
            </Text>
            <Text style={[subStyles.summaryValue, { color: Colors.success }]}>
              -{fmtPrice(discountAmount)}
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
        label={submitting ? 'Enviando...' : `Confirmar Pedido · ${fmtPrice(total)}`}
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
  onNewOrder,
}: {
  order:      OrderPublicDTO;
  onNewOrder: () => void;
}) {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [currentOrder, setCurrentOrder] = useState<OrderPublicDTO>(order);
  const [tableSummary, setTableSummary] = useState<TablePublicDTO | null>(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const [toastMsg,     setToastMsg]     = useState<string | null>(null);

  const stepIndex = getStepIndex(currentOrder.status);

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
          animateProgress(getStepIndex(merged.status));
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
      animateProgress(getStepIndex(fresh.status));
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
        <Text style={subStyles.orderNum}>
          #{currentOrder.id.slice(-3).toUpperCase()}
        </Text>

        {/* Estimated time */}
        {showEstimate && (
          <Text style={subStyles.estimatedTime}>
            ⏱ Listo en aprox. {ESTIMATE[currentOrder.status] ?? 15} min
          </Text>
        )}

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
                    {STATUS_LABEL[step]}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Mensaje de estado */}
        <View style={[
          subStyles.statusBanner,
          isCancelled && { borderColor: Colors.errorContainer },
        ]}>
          <Text style={[
            subStyles.statusBannerText,
            isCancelled && { color: Colors.error },
          ]}>
            {STATUS_MSG[currentOrder.status] ?? STATUS_MSG['pending']}
          </Text>
        </View>
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
            <View style={[
              subStyles.itemStatusBadge,
              item.status === 'ready' && subStyles.itemStatusBadgeReady,
              item.status === 'served' && subStyles.itemStatusBadgeServed,
            ]}>
              <Text style={subStyles.itemStatusText}>
                {ITEM_STATUS_LABEL[item.status ?? 'pending'] ?? 'En cola'}
              </Text>
            </View>
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
            label="Hacer otro pedido"
            onPress={onNewOrder}
            variant="primary"
            fullWidth
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
  const [screenState, setScreenState] = useState<ScreenState>('empty');
  const [activeOrder,  setActiveOrder]  = useState<OrderPublicDTO | null>(null);
  const [showQR,       setShowQR]       = useState(false);

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

  const handleNewOrder = useCallback(() => {
    setActiveOrder(null);
    handleStateChange('empty');
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
          />
        )}

        {screenState === 'tracking' && activeOrder && (
          <TrackingView
            order={activeOrder}
            onNewOrder={handleNewOrder}
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
          onSuccess={() => setShowQR(false)}
        />
      </Modal>
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
    backgroundColor: Colors.goldMuted,
    borderRadius:    Radius.xs,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
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
    borderColor:     'rgba(56,189,248,0.20)',
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
    borderColor:     'rgba(224,226,236,0.07)',
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
    backgroundColor:   Colors.goldMuted,
    borderRadius:      Radius.sm,
    paddingVertical:   4,
    alignItems:        'center',
    borderWidth:       1,
    borderColor:       Colors.goldBorder,
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

  // Destination row
  destinationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  destChip: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingVertical: 8,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(224, 226, 236, 0.06)',
  },
  destChipActive: { backgroundColor: Colors.goldMuted, borderColor: Colors.goldBorder },
  destChipText:   { ...Typography.labelMd, color: Colors.onSurfaceVariant, textTransform: 'none' as const },
  destChipTextActive: { color: Colors.primary },

  // Mesa status bar
  mesaBar: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  Colors.surfaceContainerLow,
    borderRadius:     Radius.lg,
    padding:          Spacing.smMd,
    gap:              Spacing.sm,
    borderWidth:      1,
    borderColor:      'rgba(224, 226, 236, 0.08)',
  },
  mesaBarWarn: {
    backgroundColor: 'rgba(224, 120, 40, 0.08)',
    borderColor:     'rgba(224, 120, 40, 0.25)',
  },
  mesaDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.success,
  },
  mesaTitle: {
    ...Typography.titleMd,
    color: Colors.onSurface,
  },
  mesaSub: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  connectBtn: {
    backgroundColor: Colors.primaryContainer,
    borderRadius:    Radius.sm,
    paddingHorizontal: 10,
    paddingVertical:   5,
  },
  connectBtnText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
  },

  // Gate
  gateCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  gateIcon: {
    width:           44,
    height:          44,
    borderRadius:    Radius.full,
    backgroundColor: Colors.goldMuted,
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
    borderColor:     'rgba(224, 226, 236, 0.06)',
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
    borderColor:     'rgba(224, 226, 236, 0.08)',
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
    borderColor:     'rgba(224, 226, 236, 0.06)',
  },
  tipTitle: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  tipRow:   { flexDirection: 'row', gap: 6 },
  tipChip: {
    flex:            1,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingVertical: 8,
    borderRadius:    Radius.md,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.06)',
  },
  tipChipActive: { backgroundColor: Colors.goldMuted, borderColor: Colors.goldBorder },
  tipChipText:   { ...Typography.labelSm, color: Colors.onSurfaceVariant, textTransform: 'none' as const },
  tipChipTextActive: { color: Colors.primary },

  // Resumen
  summaryCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         Spacing.smMd,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.06)',
  },
  summaryRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel:{ ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  summaryValue:{ ...Typography.bodyMd, color: Colors.onSurface },
  totalRow: {
    borderTopWidth:  1,
    borderTopColor:  'rgba(224, 226, 236, 0.08)',
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
    borderColor:     'rgba(224, 226, 236, 0.08)',
    ...(Elevation.card as object),
  },
  orderNum: {
    fontFamily:    'Outfit_600SemiBold',
    fontSize:      32,
    lineHeight:    38,
    letterSpacing: -0.64,
    color:         Colors.primary,
    textAlign:     'center',
    fontWeight:    '700' as const,
  },
  estimatedTime: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
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
    borderColor:     'rgba(224, 226, 236, 0.08)',
  },
  stepIconBoxActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor:     Colors.primaryContainer,
  },
  stepLabel: { ...Typography.labelSm, color: Colors.outline, textTransform: 'none' as const },
  stepLabelActive: { color: Colors.onSurface },
  statusBanner: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.md,
    padding:         Spacing.smMd,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.06)',
  },
  statusBannerText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },

  // Items de tracking
  itemsCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.06)',
  },
  cardSectionTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  trackItemRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 226, 236, 0.05)',
  },
  trackItemBullet: {
    width:           28,
    height:          28,
    borderRadius:    Radius.full,
    backgroundColor: Colors.goldMuted,
    justifyContent:  'center',
    alignItems:      'center',
  },
  trackItemQty:   { ...Typography.labelSm, color: Colors.primary },
  trackItemName:  { ...Typography.bodyMd, color: Colors.onSurface },
  trackItemNotes: { ...Typography.bodySm, color: Colors.outline },
  itemStatusBadge: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.xs,
    paddingHorizontal: 7,
    paddingVertical:   3,
  },
  itemStatusBadgeReady: { backgroundColor: 'rgba(52, 185, 100, 0.15)' },
  itemStatusBadgeServed: { backgroundColor: 'rgba(52, 185, 100, 0.25)' },
  itemStatusText: { ...Typography.labelSm, color: Colors.onSurfaceVariant, textTransform: 'none' as const },

  // Check card
  checkCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.06)',
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

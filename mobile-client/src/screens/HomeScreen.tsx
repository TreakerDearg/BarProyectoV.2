// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — HomeScreen
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
  RefreshControl,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles, ChevronDown,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation }  from '../theme/elevation';
import { Gradients } from '../theme/gradients';
import { Motion, Easings } from '../theme/motion';
import { usePressScale } from '../hooks/usePressScale';

import { useAuthStore }    from '../stores/useAuthStore';
import { useSessionStore } from '../stores/useSessionStore';
import { useCartStore }    from '../stores/useCartStore';

import { getPublicProducts }   from '../api/menuApi';
import { getPublicPromotions } from '../api/promoApi';
import { getMyOrderHistory }   from '../api/authApi';
import { getTableDetails }     from '../api/tableApi';
import { getPublicRouletteDrinks } from '../api/rouletteApi';
import { socketService }       from '../socket/socketService';

import { MesaCard }            from '../components/shared/MesaCard';
import { PedidoActivoBanner }  from '../components/shared/PedidoActivoBanner';
import { SommelierCard }       from '../components/shared/SommelierCard';
import { NSkeleton }           from '../components/shared/NSkeleton';
import { NToast }              from '../components/shared/NToast';
import { FulfillmentSheet }    from '../components/shared/FulfillmentSheet';
import { HeroCarousel }        from '../components/HeroCarousel';
import { CategoryHeroRow }     from '../components/CategoryHeroRow';
import { ProductGridCard }     from '../components/shared/ProductGridCard';
import { RouletteScreen }      from './RouletteScreen';
import { QRScannerScreen }     from './QRScannerScreen';
import { ProductCustomizerSheet } from '../components/ProductCustomizerSheet';
import { MobileWheel }         from '../components/roulette/MobileWheel';
import { SERVICE_MODE_META }   from '../utils/status';

import type {
  ProductPublicDTO,
  PromotionPublicDTO,
  OrderPublicDTO,
  TablePublicDTO,
  RouletteDrinkDTO,
} from '../types/api';
import type { RootTabParamList } from '../navigation/types';

type HomeNav = BottomTabNavigationProp<RootTabParamList, 'Inicio'>;

// Ancho del carrusel del Sommelier: 80% del viewport + peek de la próxima card
const { width: SCREEN_W } = Dimensions.get('window');
const SOMMELIER_CARD_WIDTH = SCREEN_W * 0.8;

// Touchable con soporte de estilo animado (press scale sin reescribir el JSX)
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ── Greeting helper ───────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

// ── Promo helpers (beneficio + vigencia para el HeroCarousel) ────────────────
function promoBenefit(p: PromotionPublicDTO): string | undefined {
  switch (p.type) {
    case 'PERCENT': return `-${p.value}% OFF`;
    case 'FLAT':    return `-$${p.value.toLocaleString('es-AR')} OFF`;
    case '2X1':     return '2x1';
    default:        return undefined;
  }
}

function promoValidUntil(p: PromotionPublicDTO): string | undefined {
  const end = p.schedule?.endDate;
  if (!end) return undefined;
  const d = new Date(end);
  if (isNaN(d.getTime())) return undefined;
  return `Vigente hasta ${d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}`;
}

// ── HomeScreen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation   = useNavigation<HomeNav>();
  const tabBarHeight = useBottomTabBarHeight();

  const user          = useAuthStore((s) => s.user);
  const { tableId, tableNumber, serviceMode } = useSessionStore();
  const cartCount     = useCartStore((s) => s.cart.length);

  // ── Data state ────────────────────────────────────────────────
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublicDTO[]>([]);
  const [categories,       setCategories]       = useState<{ id: string; name: string }[]>([]);
  const [promos,           setPromos]           = useState<PromotionPublicDTO[]>([]);
  const [activeOrder,      setActiveOrder]      = useState<OrderPublicDTO | null>(null);
  const [tableInfo,        setTableInfo]        = useState<TablePublicDTO | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRoulette,     setShowRoulette]     = useState(false);
  const [showFulfillment,  setShowFulfillment]  = useState(false);
  const [showQR,           setShowQR]           = useState(false);
  const [homeToast,        setHomeToast]        = useState<string | null>(null);
  const [customizerProduct, setCustomizerProduct] = useState<ProductPublicDTO | null>(null);
  const [idleWheelDrinks,  setIdleWheelDrinks]  = useState<RouletteDrinkDTO[]>([]);

  // Spin estático para la rueda idle del CTA (no recrear Animated.Value por render)
  const idleSpin    = useRef(new Animated.Value(0)).current;
  const ruletaPress = usePressScale(0.98);

  // ── Idle wheel drinks ─────────────────────────────────────────
  useEffect(() => {
    getPublicRouletteDrinks()
      .then((drinks) => setIdleWheelDrinks(drinks))
      .catch(() => {});
  }, []);

  // ── Stagger animations ────────────────────────────────────────
  const anim = useRef({
    header:    new Animated.Value(0),
    greeting:  { o: new Animated.Value(0), y: new Animated.Value(16) },
    mesa:      { o: new Animated.Value(0), y: new Animated.Value(16) },
    promo:     { o: new Animated.Value(0), y: new Animated.Value(16) },
    quick:     { o: new Animated.Value(0), s: new Animated.Value(0.95) },
    sommelier: Array.from({ length: 4 }, () => ({ o: new Animated.Value(0), y: new Animated.Value(16) })),
  }).current;

  const runStaggerAnimation = () => {
    // Tokens de motion: entradas de sección con desaceleración suave
    const dur  = Motion.base;
    const ease = Easings.decelerate;
    Animated.parallel([
      // header
      Animated.timing(anim.header, { toValue: 1, duration: dur, easing: ease, useNativeDriver: true }),
      // greeting (100ms delay)
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(anim.greeting.o, { toValue: 1, duration: dur, easing: ease, useNativeDriver: true }),
          Animated.timing(anim.greeting.y, { toValue: 0, duration: dur, easing: ease, useNativeDriver: true }),
        ]),
      ]),
      // mesa (200ms)
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(anim.mesa.o, { toValue: 1, duration: dur, easing: ease, useNativeDriver: true }),
          Animated.timing(anim.mesa.y, { toValue: 0, duration: dur, easing: ease, useNativeDriver: true }),
        ]),
      ]),
      // promo (300ms)
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(anim.promo.o, { toValue: 1, duration: dur, easing: ease, useNativeDriver: true }),
          Animated.timing(anim.promo.y, { toValue: 0, duration: dur, easing: ease, useNativeDriver: true }),
        ]),
      ]),
      // quick access (400ms)
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(anim.quick.o, { toValue: 1, duration: dur, easing: ease, useNativeDriver: true }),
          Animated.timing(anim.quick.s, { toValue: 1, duration: dur, easing: ease, useNativeDriver: true }),
        ]),
      ]),
      // sommelier cards (500ms + i*80ms)
      ...anim.sommelier.map((s, i) =>
        Animated.sequence([
          Animated.delay(500 + i * 80),
          Animated.parallel([
            Animated.timing(s.o, { toValue: 1, duration: dur, easing: ease, useNativeDriver: true }),
            Animated.timing(s.y, { toValue: 0, duration: dur, easing: ease, useNativeDriver: true }),
          ]),
        ])
      ),
    ]).start();
  };

  // ── Pulsing dot ───────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (tableNumber != null) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current.start();
    } else {
      pulseLoopRef.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => { pulseLoopRef.current?.stop(); };
  }, [tableNumber]);

  // ── Fetch all data ────────────────────────────────────────────
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [products, promotions] = await Promise.all([
        getPublicProducts(),
        getPublicPromotions(),
      ]);

      setFeaturedProducts(
        products.filter((p) => p.featured && p.available).slice(0, 4)
      );

      const catSet = new Set<string>();
      products.forEach((p) => { if (p.category) catSet.add(p.category); });
      setCategories([
        { id: 'all', name: 'Todos' },
        ...Array.from(catSet).map((c) => ({
          id:   c,
          name: c.charAt(0).toUpperCase() + c.slice(1),
        })).slice(0, 5),
      ]);

      setPromos(promotions.filter((p) => p.active).slice(0, 3));

      if (user) {
        try {
          const history = await getMyOrderHistory(3);
          const active  = (history as any[]).find(
            (o) => o.status === 'pending' || o.status === 'in-progress'
          );
          if (active) setActiveOrder(active as OrderPublicDTO);
        } catch {}
      }

      if (tableId) {
        try {
          const tbl = await getTableDetails(tableId);
          setTableInfo(tbl);
        } catch {}
      }
    } catch {
      // Silencioso
    } finally {
      setLoading(false);
      setRefreshing(false);
      runStaggerAnimation();
    }
  }, [user, tableId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Socket: actualizar pedido activo ──────────────────────────
  useEffect(() => {
    if (!activeOrder?.id) return;
    const unsub = socketService.onOrderUpdate((updated) => {
      if (updated?.id === activeOrder.id || updated?._id === activeOrder.id) {
        setActiveOrder((prev) => prev ? { ...prev, ...updated } : prev);
      }
    });
    return () => unsub();
  }, [activeOrder?.id]);

  // ── Navegación ────────────────────────────────────────────────
  const goToCarta    = () => navigation.navigate('Carta');
  const goToPedidos  = () => navigation.navigate('Pedidos');
  const goToReservas = () => navigation.navigate('Reservas');
  const goToCuenta   = () => navigation.navigate('Cuenta');

  const handleCartaCategory = (catId: string) => {
    setSelectedCategory(catId);
    navigation.navigate('Carta');
  };

  // ── MesaCard handlers ─────────────────────────────────────────
  const handleCallWaiter = () => {
    try { Haptics.selectionAsync(); } catch {}
    setHomeToast('Se notificó al personal. En breve se acercan.');
  };

  const handleRepeatRound = () => {
    const cart = useCartStore.getState().cart;
    if (cart.length === 0) {
      Alert.alert('Sin ronda anterior', 'No hay ronda anterior en el carrito.');
      return;
    }
    Alert.alert(
      'Repetir Ronda',
      'Se agregarán los mismos productos al carrito',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            cart.forEach((item) => useCartStore.getState().addToCart(item));
            navigation.navigate('Pedidos');
          },
        },
      ]
    );
  };

  // ── Customizer confirm ────────────────────────────────────────
  const handleCustomizerConfirm = (
    product: ProductPublicDTO,
    quantity: number,
    notes: string
  ) => {
    useCartStore.getState().addToCart({
      productId: product.id,
      name:      product.name,
      price:     product.dynamicPrice ?? product.price,
      image:     product.image,
      notes,
      quantity,
    });
    setHomeToast(`${product.name} agregado al pedido`);
  };

  // ── Session chip (destino del pedido) ─────────────────────────
  const zoneLabel = tableInfo?.location
    ? tableInfo.location.charAt(0).toUpperCase() + tableInfo.location.slice(1)
    : undefined;

  const hasTable = tableNumber != null;

  const chipMeta = hasTable
    ? {
        ...SERVICE_MODE_META.table,
        label:  `Mesa #${tableNumber}${zoneLabel ? ` · ${zoneLabel}` : ''}`,
        border: NocturneColors.emberBorder,
      }
    : serviceMode === 'bar'
    ? { ...SERVICE_MODE_META.bar, border: NocturneColors.infoMuted }
    : {
        ...SERVICE_MODE_META.table,
        label:  'Sin mesa',
        color:  Colors.onSurfaceVariant,
        bg:     Colors.surfaceContainerHighest,
        border: Colors.outlineVariant,
      };

  const ChipIcon = chipMeta.icon;

  // ── Imagen de ambiente del hero (primer destacado, si no la primera promo) ──
  const heroImageUri =
    featuredProducts[0]?.image ||
    promos[0]?.applicableProducts?.[0]?.image ||
    undefined;

  // ── Render: skeleton de carga ─────────────────────────────────
  const renderSkeleton = () => (
    <View style={{ gap: Spacing.md }}>
      <NSkeleton height={230} radius={Radius.xl} />
      <NSkeleton height={72} radius={Radius.xl} />
      <NSkeleton height={Spacing.heroCarouselHeight} radius={Radius.xl} />
      <NSkeleton height={40} radius={Radius.md} />
      {[0, 1].map((i) => <NSkeleton key={i} height={200} radius={Radius.xl} />)}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <NToast
        visible={!!homeToast}
        message={homeToast ?? ''}
        variant="info"
        onHide={() => setHomeToast(null)}
      />

      {/* ── Top Bar ───────────────────────────────────── */}
      <Animated.View style={[styles.topBar, { opacity: anim.header }]}>
        <View style={styles.topLeft}>
          <View style={styles.brandDot}>
            <Sparkles size={14} color={Colors.primary} />
          </View>
          <Text style={styles.brandName}>Nebula</Text>

          {/* Chip de sesión — abre FulfillmentSheet */}
          <TouchableOpacity
            style={[styles.sessionChip, { backgroundColor: chipMeta.bg, borderColor: chipMeta.border }]}
            onPress={() => {
              try { Haptics.selectionAsync(); } catch {}
              setShowFulfillment(true);
            }}
            activeOpacity={0.8}
          >
            <ChipIcon size={12} color={chipMeta.color} />
            <Text
              style={[styles.sessionChipText, { color: chipMeta.color }]}
              numberOfLines={1}
            >
              {chipMeta.label}
            </Text>
            {hasTable && (
              <Animated.View
                style={[
                  styles.pulsingDot,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
            )}
            <ChevronDown size={12} color={chipMeta.color} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={goToCuenta} style={styles.avatarBtn}>
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatarImg}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
          ) : (
            <View style={styles.avatarInitials}>
              <Text style={styles.avatarInitialsText}>
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* ── Scroll principal ──────────────────────────── */}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: tabBarHeight + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {loading ? renderSkeleton() : (
          <>
            {/* ── Hero de bienvenida — imagen full-bleed + saludo ── */}
            <Animated.View
              style={[styles.hero, {
                opacity: anim.greeting.o,
                transform: [{ translateY: anim.greeting.y }],
              }]}
            >
              {heroImageUri ? (
                <Image
                  source={{ uri: heroImageUri }}
                  style={styles.heroImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={150}
                />
              ) : (
                <View style={styles.heroImageFallback}>
                  <LinearGradient
                    {...Gradients.cardSheen}
                    style={styles.heroFill}
                    pointerEvents="none"
                  />
                </View>
              )}

              {/* Lavado nocturno detrás del saludo (canvas → transparente) */}
              <LinearGradient
                {...Gradients.nightWash}
                style={styles.heroWash}
                pointerEvents="none"
              />
              {/* Fusión inferior con el canvas */}
              <LinearGradient
                {...Gradients.heroOverlay}
                style={styles.heroBottomFade}
                pointerEvents="none"
              />

              <View style={styles.heroContent}>
                <Text style={styles.greetingMain}>
                  {getGreeting()}{user ? `, ${user.name.split(' ')[0]}` : ''}
                </Text>
                <Text style={styles.greetingSub}>¿Qué te gustaría disfrutar hoy?</Text>
              </View>
            </Animated.View>

            {/* ── Mesa activa ─────────────────────────────── */}
            <Animated.View
              style={{
                opacity: anim.mesa.o,
                transform: [{ translateY: anim.mesa.y }],
                gap: Spacing.md,
              }}
            >
              {/* ── Pedido activo ────────────────────────── */}
              {activeOrder && (
                <PedidoActivoBanner
                  order={activeOrder}
                  onPress={goToPedidos}
                  estimatedMinutes={15}
                />
              )}

              {/* ── Mesa activa ──────────────────────────── */}
              {tableNumber != null && (
                <MesaCard
                  tableNumber={tableNumber}
                  zone={zoneLabel ? `Zona ${zoneLabel}` : undefined}
                  totalAmount={tableInfo?.totalAmount}
                  onViewConsumos={goToPedidos}
                  onCallWaiter={handleCallWaiter}
                  onRepeatRound={handleRepeatRound}
                />
              )}
            </Animated.View>

            {/* ── Promo destacada → HeroCarousel ───────────── */}
            <Animated.View
              style={{
                opacity: anim.promo.o,
                transform: [{ translateY: anim.promo.y }],
              }}
            >
              <HeroCarousel
                slides={promos.map((p) => ({
                  id:         p.id,
                  title:      p.name,
                  subtitle:   p.description,
                  benefit:    promoBenefit(p),
                  validUntil: promoValidUntil(p),
                  onPress:    goToCarta,
                }))}
              />
            </Animated.View>

            {/* ── CategoryHeroRow (replaces CategoryPills + QuickActions) ── */}
            <View style={styles.section}>
              <CategoryHeroRow
                categories={categories}
                activeCategory={selectedCategory}
                onSelect={handleCartaCategory}
                onRuletaPress={() => setShowRoulette(true)}
              />
            </View>

            {/* ── Lo más pedido ─────────────────────────────── */}
            {featuredProducts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Lo más pedido</Text>
                  <TouchableOpacity onPress={goToCarta} style={styles.seeAllBtn}>
                    <Text style={styles.seeAllText}>Ver todo</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={featuredProducts.slice(0, 4)}
                  numColumns={2}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  columnWrapperStyle={{ gap: Spacing.gridGap }}
                  ItemSeparatorComponent={() => <View style={{ height: Spacing.gridGap }} />}
                  renderItem={({ item }) => (
                    <View style={{ flex: 1 }}>
                      <ProductGridCard
                        product={item}
                        isFavorite={false}
                        cartQty={useCartStore.getState().cart.find((l) => l.productId === item.id)?.quantity ?? 0}
                        onAdd={(p) =>
                          useCartStore.getState().addToCart({
                            productId: p.id,
                            name:      p.name,
                            price:     p.dynamicPrice ?? p.price,
                            image:     p.image,
                            notes:     '',
                            quantity:  1,
                          })
                        }
                        onRemove={(p) => {
                          const qty = useCartStore.getState().cart.find((l) => l.productId === p.id)?.quantity ?? 0;
                          if (qty <= 1) useCartStore.getState().removeFromCart(p.id);
                          else useCartStore.getState().setLineQty(p.id, qty - 1);
                        }}
                        onPress={() => navigation.navigate('Carta')}
                      />
                    </View>
                  )}
                />
              </View>
            )}

            {/* ── Selección del Sommelier — carrusel 80% viewport ── */}
            {featuredProducts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Selección del Sommelier</Text>
                    <Text style={styles.sectionSub}>
                      Recomendaciones exclusivas de nuestra barra y cocina
                    </Text>
                  </View>
                  <TouchableOpacity onPress={goToCarta} style={styles.seeAllBtn}>
                    <Text style={styles.seeAllText}>Ver todo</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={featuredProducts}
                  horizontal
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={SOMMELIER_CARD_WIDTH + Spacing.gridGap}
                  decelerationRate="fast"
                  style={styles.sommelierCarousel}
                  contentContainerStyle={styles.sommelierCarouselContent}
                  renderItem={({ item, index }) => {
                    const s = anim.sommelier[Math.min(index, anim.sommelier.length - 1)];
                    return (
                      <Animated.View
                        style={{
                          width: SOMMELIER_CARD_WIDTH,
                          opacity: s.o,
                          transform: [{ translateY: s.y }],
                        }}
                      >
                        <SommelierCard
                          product={item}
                          onAdd={(p) => setCustomizerProduct(p)}
                          onPress={() => navigation.navigate('Carta')}
                          featureBadge={
                            item.type === 'drink' ? 'COCKTAIL ESTRELLA' : 'PLATO DEL CHEF'
                          }
                        />
                      </Animated.View>
                    );
                  }}
                />
              </View>
            )}

            {/* ── Ruleta CTA — with idle MobileWheel ───────── */}
            <AnimatedTouchable
              style={[styles.rouletteCard, ruletaPress.animatedStyle]}
              onPress={() => setShowRoulette(true)}
              onPressIn={ruletaPress.onPressIn}
              onPressOut={ruletaPress.onPressOut}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Abrir la ruleta de cócteles"
            >
              <View style={styles.roulettLeft}>
                <View style={styles.rouletteIconWrap}>
                  {idleWheelDrinks.length > 0 ? (
                    <MobileWheel
                      drinks={idleWheelDrinks}
                      spinAnim={idleSpin}
                      size={52}
                    />
                  ) : (
                    <Sparkles size={28} color={Colors.primary} />
                  )}
                </View>
                <View>
                  <Text style={styles.rouletteTitle}>Ruleta Nebula</Text>
                  <Text style={styles.rouletteSub}>
                    Girá y descubrí tu cóctel de la noche
                  </Text>
                </View>
              </View>
            </AnimatedTouchable>
          </>
        )}
      </ScrollView>

      {/* ── Modal Ruleta ──────────────────────────────────── */}
      <Modal
        visible={showRoulette}
        animationType="slide"
        onRequestClose={() => setShowRoulette(false)}
      >
        <RouletteScreen onClose={() => setShowRoulette(false)} />
      </Modal>

      {/* ── ProductCustomizerSheet ──────────────────────── */}
      <ProductCustomizerSheet
        visible={!!customizerProduct}
        product={customizerProduct}
        onClose={() => setCustomizerProduct(null)}
        onConfirm={handleCustomizerConfirm}
      />

      {/* ── FulfillmentSheet — ¿Cómo recibís tu pedido? ── */}
      <FulfillmentSheet
        visible={showFulfillment}
        onClose={() => setShowFulfillment(false)}
        onOpenScanner={() => setShowQR(true)}
      />

      {/* ── Modal QR Scanner ────────────────────────────── */}
      <Modal
        visible={showQR}
        animationType="slide"
        onRequestClose={() => setShowQR(false)}
      >
        <QRScannerScreen
          onClose={() => setShowQR(false)}
          onSuccess={() => {
            setShowQR(false);
            setHomeToast('Mesa conectada. Ya podés pedir desde tu mesa.');
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // ── Top bar ────────────────────────────────────────────────────
  topBar: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: Spacing.gutter,
    paddingVertical:   Spacing.smMd,
    backgroundColor: NocturneColors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: NocturneColors.borderSubtle,
  },
  topLeft: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
    marginRight:   Spacing.sm,
  },
  brandDot: {
    width:           28,
    height:          28,
    borderRadius:    Radius.full,
    backgroundColor: NocturneColors.emberMuted,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     NocturneColors.emberBorder,
  },
  brandName: {
    ...Typography.headlineSm,
    color:         Colors.primary,
    letterSpacing: 1,
  },
  sessionChip: {
    flexShrink:        1,
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    borderRadius:      Radius.full,
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderWidth:       1,
  },
  sessionChipText: {
    ...Typography.labelSm,
    textTransform: 'none' as const,
    flexShrink:    1,
  },
  pulsingDot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: Colors.success,
  },

  avatarBtn: {
    width:           36,
    height:          36,
    borderRadius:    Radius.full,
    overflow:        'hidden',
    borderWidth:     2,
    borderColor:     NocturneColors.emberBorder,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitials: {
    width: '100%', height: '100%',
    justifyContent: 'center',
    alignItems:     'center',
    backgroundColor: Colors.primaryContainer,
  },
  avatarInitialsText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
  },

  // ── Scroll ─────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: Spacing.gutter,
    paddingTop:        Spacing.md,
    gap:               Spacing.lg,
  },

  // ── Hero de bienvenida ─────────────────────────────────────────
  hero: {
    height:           230,
    marginHorizontal: -Spacing.gutter,
    marginTop:        -Spacing.md,
    overflow:         'hidden',
    backgroundColor:  NocturneColors.surfaceContainerLowest,
  },
  heroImage: {
    width:  '100%',
    height: '100%',
  },
  heroImageFallback: {
    width:           '100%',
    height:          '100%',
    backgroundColor: NocturneColors.surfaceContainerLowest,
  },
  heroFill: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    bottom:   0,
  },
  heroWash: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    height:   '70%',
  },
  heroBottomFade: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   '45%',
  },
  heroContent: {
    position:          'absolute',
    top:               0,
    left:              0,
    right:             0,
    paddingHorizontal: Spacing.gutter,
    paddingTop:        Spacing.md,
    gap:               4,
  },
  greetingMain: {
    ...Typography.displayLg,
    color: Colors.onSurface,
  },
  greetingSub: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
  },

  // ── Sections ───────────────────────────────────────────────────
  section: { gap: Spacing.sm },
  sectionHeaderRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
  },
  sectionTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  sectionSub:   { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  seeAllBtn: { paddingTop: 2 },
  seeAllText: { ...Typography.labelMd, color: Colors.primary },
  sommelierCarousel:        { marginHorizontal: -Spacing.gutter },
  sommelierCarouselContent: { paddingHorizontal: Spacing.gutter, gap: Spacing.gridGap },

  // ── Ruleta CTA ─────────────────────────────────────────────────
  rouletteCard: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.xl,
    padding:         Spacing.md,
    borderWidth:     1,
    borderColor:     NocturneColors.emberBorder,
    ...(Elevation.card as object),
  },
  roulettLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.smMd,
    flex:          1,
  },
  rouletteIconWrap: {
    width:           52,
    height:          52,
    borderRadius:    Radius.full,
    backgroundColor: NocturneColors.emberMuted,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     NocturneColors.emberBorder,
  },
  rouletteTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  rouletteSub:   { ...Typography.bodySm, color: Colors.onSurfaceVariant },
});

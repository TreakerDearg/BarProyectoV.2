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
  Image,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles, Zap,
  ChefHat, ShoppingBag, CalendarDays,
  RotateCw,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation }  from '../theme/elevation';

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
import { PromoBanner, PromoBannerFallback } from '../components/shared/PromoBanner';
import { SommelierCard }       from '../components/shared/SommelierCard';
import { NSkeleton }           from '../components/shared/NSkeleton';
import { NToast }              from '../components/shared/NToast';
import { CategoryPills }       from '../components/CategoryPills';
import { HeroCarousel }        from '../components/HeroCarousel';
import { CategoryHeroRow }     from '../components/CategoryHeroRow';
import { ProductGridCard }     from '../components/shared/ProductGridCard';
import { RouletteScreen }      from './RouletteScreen';
import { ProductCustomizerSheet } from '../components/ProductCustomizerSheet';
import { MobileWheel }         from '../components/roulette/MobileWheel';

import type {
  ProductPublicDTO,
  PromotionPublicDTO,
  OrderPublicDTO,
  TablePublicDTO,
  RouletteDrinkDTO,
} from '../types/api';
import type { RootTabParamList } from '../navigation/types';

type HomeNav = BottomTabNavigationProp<RootTabParamList, 'Inicio'>;

// ── Greeting helper ───────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

// ── Quick action card ─────────────────────────────────────────────────────────
interface QuickAction {
  label:   string;
  icon:    React.ReactNode;
  bg:      string;
  onPress: () => void;
}

function QuickActionCard({ label, icon, bg, onPress }: QuickAction) {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, { toValue: 0.92, useNativeDriver: true, friction: 8 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  };

  return (
    <TouchableOpacity
      style={[qStyles.card, { backgroundColor: bg }]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[qStyles.inner, { transform: [{ scale: pressAnim }] }]}
      >
        {icon}
        <Text style={qStyles.label}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const qStyles = StyleSheet.create({
  card: {
    width:           '22%',
    aspectRatio:     1,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.06)',
    overflow:        'hidden',
  },
  inner: {
    width: '100%',
    height: '100%',
    justifyContent:  'center',
    alignItems:      'center',
    gap:             4,
  },
  label: { ...Typography.labelSm, color: Colors.onSurface, textTransform: 'none' as const, textAlign: 'center' },
});

// ── HomeScreen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation   = useNavigation<HomeNav>();
  const tabBarHeight = useBottomTabBarHeight();

  const user          = useAuthStore((s) => s.user);
  const { tableId, tableNumber } = useSessionStore();
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
  const [homeToast,        setHomeToast]        = useState<string | null>(null);
  const [customizerProduct, setCustomizerProduct] = useState<ProductPublicDTO | null>(null);
  const [idleWheelDrinks,  setIdleWheelDrinks]  = useState<RouletteDrinkDTO[]>([]);

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
    const dur = 350;
    Animated.parallel([
      // header
      Animated.timing(anim.header, { toValue: 1, duration: dur, useNativeDriver: true }),
      // greeting (100ms delay)
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(anim.greeting.o, { toValue: 1, duration: dur, useNativeDriver: true }),
          Animated.timing(anim.greeting.y, { toValue: 0, duration: dur, useNativeDriver: true }),
        ]),
      ]),
      // mesa (200ms)
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(anim.mesa.o, { toValue: 1, duration: dur, useNativeDriver: true }),
          Animated.timing(anim.mesa.y, { toValue: 0, duration: dur, useNativeDriver: true }),
        ]),
      ]),
      // promo (300ms)
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(anim.promo.o, { toValue: 1, duration: dur, useNativeDriver: true }),
          Animated.timing(anim.promo.y, { toValue: 0, duration: dur, useNativeDriver: true }),
        ]),
      ]),
      // quick access (400ms)
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(anim.quick.o, { toValue: 1, duration: dur, useNativeDriver: true }),
          Animated.timing(anim.quick.s, { toValue: 1, duration: dur, useNativeDriver: true }),
        ]),
      ]),
      // sommelier cards (500ms + i*80ms)
      ...anim.sommelier.map((s, i) =>
        Animated.sequence([
          Animated.delay(500 + i * 80),
          Animated.parallel([
            Animated.timing(s.o, { toValue: 1, duration: dur, useNativeDriver: true }),
            Animated.timing(s.y, { toValue: 0, duration: dur, useNativeDriver: true }),
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

  // ── Render: skeleton de carga ─────────────────────────────────
  const renderSkeleton = () => (
    <View style={{ gap: Spacing.md, padding: Spacing.gutter }}>
      <NSkeleton height={72} radius={Radius.xl} />
      <NSkeleton height={180} radius={Radius.xl} />
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
          <View style={styles.zoneBadge}>
            <Text style={styles.zoneText}>
              {tableInfo?.location ? tableInfo.location.toUpperCase() : 'BAR'}
            </Text>
          </View>
          {/* Pulsing dot when mesa connected */}
          {tableNumber != null && (
            <Animated.View
              style={[
                styles.pulsingDot,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
          )}
        </View>

        <TouchableOpacity onPress={goToCuenta} style={styles.avatarBtn}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
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
            {/* ── Saludo ──────────────────────────────────── */}
            <Animated.View
              style={[styles.greetingSection, {
                opacity: anim.greeting.o,
                transform: [{ translateY: anim.greeting.y }],
              }]}
            >
              <Text style={styles.greetingMain}>
                {getGreeting()}{user ? `, ${user.name.split(' ')[0]}` : ''}
              </Text>
              <Text style={styles.greetingSub}>¿Qué te gustaría disfrutar hoy?</Text>
            </Animated.View>

            {/* ── Mesa activa ─────────────────────────────── */}
            <Animated.View
              style={{
                opacity: anim.mesa.o,
                transform: [{ translateY: anim.mesa.y }],
              }}
            >
              {tableNumber != null && (
                <MesaCard
                  tableNumber={tableNumber}
                  zone={tableInfo?.location
                    ? `Zona ${tableInfo.location.charAt(0).toUpperCase() + tableInfo.location.slice(1)}`
                    : undefined}
                  totalAmount={tableInfo?.totalAmount}
                  onViewConsumos={goToPedidos}
                  onCallWaiter={handleCallWaiter}
                  onRepeatRound={handleRepeatRound}
                />
              )}

              {/* ── Pedido activo ────────────────────────── */}
              {activeOrder && (
                <PedidoActivoBanner
                  order={activeOrder}
                  onPress={goToPedidos}
                  estimatedMinutes={15}
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
                  id:       p.id,
                  title:    p.name,
                  subtitle: p.description,
                  onPress:  goToCarta,
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

            {/* ── Selección del Sommelier (first 2) ────────── */}
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

                <View style={styles.sommelierList}>
                  {featuredProducts.slice(0, 2).map((product, i) => {
                    const s = anim.sommelier[Math.min(i, anim.sommelier.length - 1)];
                    return (
                      <Animated.View
                        key={product.id}
                        style={{ opacity: s.o, transform: [{ translateY: s.y }] }}
                      >
                        <SommelierCard
                          product={product}
                          onAdd={(p) => setCustomizerProduct(p)}
                          onPress={() => navigation.navigate('Carta')}
                          featureBadge={
                            product.type === 'drink' ? 'COCKTAIL ESTRELLA' : 'PLATO DEL CHEF'
                          }
                        />
                      </Animated.View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── Ruleta CTA — with idle MobileWheel ───────── */}
            <TouchableOpacity
              style={styles.rouletteCard}
              onPress={() => setShowRoulette(true)}
              activeOpacity={0.85}
            >
              <View style={styles.roulettLeft}>
                <View style={styles.rouletteIconWrap}>
                  {idleWheelDrinks.length > 0 ? (
                    <MobileWheel
                      drinks={idleWheelDrinks}
                      spinAnim={new Animated.Value(0)}
                      size={80}
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
            </TouchableOpacity>
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
    borderBottomColor: 'rgba(224, 226, 236, 0.06)',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  brandDot: {
    width:           28,
    height:          28,
    borderRadius:    Radius.full,
    backgroundColor: Colors.goldMuted,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  brandName: {
    ...Typography.headlineSm,
    color:         Colors.primary,
    letterSpacing: 1,
  },
  zoneBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius:    Radius.full,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.10)',
  },
  zoneText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
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
    borderColor:     Colors.goldBorder,
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

  // ── Saludo ─────────────────────────────────────────────────────
  greetingSection: { gap: 4 },
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
  sectionRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    gap:            Spacing.sm,
  },
  sommelierList: { gap: Spacing.md },

  // ── Ruleta CTA ─────────────────────────────────────────────────
  rouletteCard: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.xl,
    padding:         Spacing.md,
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
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
    backgroundColor: Colors.goldMuted,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  rouletteTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  rouletteSub:   { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  rouletteBtn: {
    width:           44,
    height:          44,
    borderRadius:    Radius.full,
    backgroundColor: Colors.primaryContainer,
    justifyContent:  'center',
    alignItems:      'center',
    ...(Elevation.goldCTA as object),
  },
});

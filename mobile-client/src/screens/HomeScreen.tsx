// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — HomeScreen
// Pantalla principal fiel al diseño Nocturne Gastronomy del screenshot.
// Secciones: top bar, saludo, card de mesa, pedido activo, promo,
//            categorías, selección del sommelier, ruleta CTA.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles, UserCircle, Zap,
  ChefHat, ShoppingBag, CalendarDays,
  RotateCw,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Colors }     from '../theme/colors';
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
import { socketService }       from '../socket/socketService';

import { MesaCard }            from '../components/shared/MesaCard';
import { PedidoActivoBanner }  from '../components/shared/PedidoActivoBanner';
import { PromoBanner, PromoBannerFallback } from '../components/shared/PromoBanner';
import { SommelierCard }       from '../components/shared/SommelierCard';
import { NSkeleton }           from '../components/shared/NSkeleton';
import { CategoryPills }       from '../components/CategoryPills';
import { RouletteScreen }      from './RouletteScreen';

import type {
  ProductPublicDTO,
  PromotionPublicDTO,
  OrderPublicDTO,
  TablePublicDTO,
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
  return (
    <TouchableOpacity
      style={[qStyles.card, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.80}
    >
      {icon}
      <Text style={qStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const qStyles = StyleSheet.create({
  card: {
    width:           '22%',
    aspectRatio:     1,
    borderRadius:    Radius.lg,
    justifyContent:  'center',
    alignItems:      'center',
    gap:             4,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.06)',
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

  // ── Fetch all data ────────────────────────────────────────────
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [products, promotions] = await Promise.all([
        getPublicProducts(),
        getPublicPromotions(),
      ]);

      // Featured products
      setFeaturedProducts(
        products.filter((p) => p.featured && p.available).slice(0, 4)
      );

      // Categories
      const catSet = new Set<string>();
      products.forEach((p) => { if (p.category) catSet.add(p.category); });
      setCategories([
        { id: 'all', name: 'Todos' },
        ...Array.from(catSet).map((c) => ({
          id:   c,
          name: c.charAt(0).toUpperCase() + c.slice(1),
        })).slice(0, 5), // max 5 + "Todos"
      ]);

      // Promos
      setPromos(promotions.filter((p) => p.active).slice(0, 3));

      // Pedido activo (solo si hay sesión)
      if (user) {
        try {
          const history = await getMyOrderHistory(3);
          const active  = (history as any[]).find(
            (o) => o.status === 'pending' || o.status === 'in-progress'
          );
          if (active) setActiveOrder(active as OrderPublicDTO);
        } catch {}
      }

      // Detalle de mesa
      if (tableId) {
        try {
          const tbl = await getTableDetails(tableId);
          setTableInfo(tbl);
        } catch {}
      }
    } catch {
      // Silencioso — pantalla muestra los datos parciales que cargaron
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, tableId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Socket: actualizar pedido activo en tiempo real ───────────
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
      {/* ── Top Bar ───────────────────────────────────────── */}
      <View style={styles.topBar}>
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
      </View>

      {/* ── Scroll principal ──────────────────────────────── */}
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
            <View style={styles.greetingSection}>
              <Text style={styles.greetingMain}>
                {getGreeting()}{user ? `, ${user.name.split(' ')[0]}` : ''}
              </Text>
              <Text style={styles.greetingSub}>¿Qué te gustaría disfrutar hoy?</Text>
            </View>

            {/* ── Mesa activa ─────────────────────────────── */}
            {tableNumber != null && (
              <MesaCard
                tableNumber={tableNumber}
                zone={tableInfo?.location
                  ? `Zona ${tableInfo.location.charAt(0).toUpperCase() + tableInfo.location.slice(1)}`
                  : undefined}
                totalAmount={tableInfo?.totalAmount}
                onViewConsumos={goToPedidos}
                onCallWaiter={() => {}}
              />
            )}

            {/* ── Pedido activo ────────────────────────────── */}
            {activeOrder && (
              <PedidoActivoBanner
                order={activeOrder}
                onPress={goToPedidos}
                estimatedMinutes={15}
              />
            )}

            {/* ── Promo destacada ──────────────────────────── */}
            {promos.length > 0 ? (
              <PromoBanner
                promo={promos[0]}
                onPress={goToCarta}
              />
            ) : (
              <PromoBannerFallback onPress={goToCarta} />
            )}

            {/* ── Accesos rápidos ──────────────────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <QuickActionCard
                  label="Carta"
                  icon={<ChefHat size={22} color={Colors.primary} />}
                  bg={Colors.goldMuted}
                  onPress={goToCarta}
                />
                <QuickActionCard
                  label="Pedido"
                  icon={<ShoppingBag size={22} color={Colors.success} />}
                  bg="rgba(52, 185, 100, 0.08)"
                  onPress={goToPedidos}
                />
                <QuickActionCard
                  label="Reservas"
                  icon={<CalendarDays size={22} color={Colors.info} />}
                  bg="rgba(56, 189, 248, 0.08)"
                  onPress={goToReservas}
                />
                <QuickActionCard
                  label="Ruleta"
                  icon={<RotateCw size={22} color={Colors.secondary} />}
                  bg="rgba(237, 192, 94, 0.08)"
                  onPress={() => setShowRoulette(true)}
                />
              </View>
            </View>

            {/* ── Explorar la carta ────────────────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Explorar la carta</Text>
                <TouchableOpacity onPress={goToCarta} style={styles.seeAllBtn}>
                  <Text style={styles.seeAllText}>Deslizar →</Text>
                </TouchableOpacity>
              </View>
              <CategoryPills
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCartaCategory}
              />
            </View>

            {/* ── Selección del Sommelier ───────────────────── */}
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
                  {featuredProducts.map((product) => (
                    <SommelierCard
                      key={product.id}
                      product={product}
                      onAdd={(p) => {
                        useCartStore.getState().addToCart({
                          productId: p.id,
                          name:      p.name,
                          price:     p.dynamicPrice ?? p.price,
                          image:     p.image,
                          notes:     '',
                          quantity:  1,
                        });
                      }}
                      onPress={() => navigation.navigate('Carta')}
                      featureBadge={
                        product.type === 'drink' ? 'COCKTAIL ESTRELLA' : 'PLATO DEL CHEF'
                      }
                    />
                  ))}
                </View>
              </View>
            )}

            {/* ── Ruleta CTA ───────────────────────────────── */}
            <TouchableOpacity
              style={styles.rouletteCard}
              onPress={() => setShowRoulette(true)}
              activeOpacity={0.85}
            >
              <View style={styles.roulettLeft}>
                <View style={styles.rouletteIconWrap}>
                  <Sparkles size={28} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.rouletteTitle}>Ruleta Nebula</Text>
                  <Text style={styles.rouletteSub}>
                    Girá y descubrí tu cóctel de la noche
                  </Text>
                </View>
              </View>
              <View style={styles.rouletteBtn}>
                <RotateCw size={18} color={Colors.onPrimary} />
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

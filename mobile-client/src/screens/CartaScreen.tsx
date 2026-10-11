// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — CartaScreen  (FEAT-002 T10 · Nocturne Evolved)
// SectionList por categoría (grid 2 columnas) con barra de categorías sticky
// y scroll-spy sincronizado. Buscador con sugerencias de categorías, tarjetas
// con precio protagonista, FloatingCartBar con cantidad + total.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState, useEffect, useMemo, useCallback, useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  SectionList,
  Animated,
} from 'react-native';
import type {
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, UtensilsCrossed } from 'lucide-react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../navigation/types';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';

import { getPublicProducts } from '../api/menuApi';
import { useCartStore }      from '../stores/useCartStore';
import { useAuthStore }      from '../stores/useAuthStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';

import { ProductGridCard }    from '../components/shared/ProductGridCard';
import { SommelierCard }      from '../components/shared/SommelierCard';
import { NEmptyState }        from '../components/shared/NEmptyState';
import { NSkeleton }          from '../components/shared/NSkeleton';
import { NToast }             from '../components/shared/NToast';
import { FloatingCartBar }    from '../components/FloatingCartBar';
import { ModifierModal }      from '../components/ModifierModal';
import { ProductCustomizerSheet } from '../components/ProductCustomizerSheet';
import { CategoryHeroRow }    from '../components/CategoryHeroRow';
import { CategoryPills }      from '../components/CategoryPills';

import type { ProductPublicDTO } from '../types/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildCategories(products: ProductPublicDTO[]) {
  const set = new Set<string>();
  products.forEach((p) => { if (p.category) set.add(p.category); });
  return [
    { id: 'all', name: 'Todas' },
    ...Array.from(set).map((cat) => ({
      id:   cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
    })),
  ];
}

/** Fila del grid: hero a ancho completo o 1-2 productos en 2 columnas. */
interface CartaRow {
  key:    string;
  items:  ProductPublicDTO[];
  /** Primer ítem de la sección: card hero con imagen grande. */
  hero?:  boolean;
}

/** Sección del SectionList: una categoría. */
interface CartaSection {
  title:      string;
  categoryId: string;
  count:      number;
  data:       CartaRow[];
}

type CartaNav = BottomTabNavigationProp<RootTabParamList, 'Carta'>;

// ── Componente ────────────────────────────────────────────────────────────────
export default function CartaScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation   = useNavigation<CartaNav>();

  // ── Estado de datos ───────────────────────────────────────────
  const [products,   setProducts]   = useState<ProductPublicDTO[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // ── Filtros ───────────────────────────────────────────────────
  const [searchQuery,    setSearchQuery]    = useState('');
  // Valor debounced: el filtrado espera 300 ms desde la última tecla
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // ── Medidas de la barra sticky ────────────────────────────────
  const [stickyTop,  setStickyTop]  = useState(0);
  const [barHeight,  setBarHeight]  = useState(0);

  // ── Modals ────────────────────────────────────────────────────
  const [selectedProduct,   setSelectedProduct]   = useState<ProductPublicDTO | null>(null);
  const [toastMsg,          setToastMsg]          = useState<string | null>(null);
  const [customizerProduct, setCustomizerProduct] = useState<ProductPublicDTO | null>(null);

  // ── Stores ────────────────────────────────────────────────────
  const { cart, addToCart, setLineQty, removeFromCart } = useCartStore();
  const { token }                                        = useAuthStore();
  const { isFavorite, toggleFavorite, loadFromBackend }  = useFavoritesStore();

  // ── Refs de scroll / scroll-spy ───────────────────────────────
  const listRef           = useRef<SectionList<CartaRow, CartaSection> | null>(null);
  const scrollY           = useRef(new Animated.Value(0)).current;
  const sectionOffsets    = useRef<Record<string, number>>({});
  const programmaticUntil = useRef(0);
  const activeRef         = useRef('all');

  activeRef.current = activeCategory;

  // ── Debounce de búsqueda (300 ms desde la última tecla) ───────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Carga de datos ────────────────────────────────────────────
  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getPublicProducts();
      setProducts(data);
    } catch {
      setError('No se pudo cargar la carta. Verificá tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    if (token) loadFromBackend();
  }, [token]);

  // ── Categorías dinámicas ──────────────────────────────────────
  const categories = useMemo(() => buildCategories(products), [products]);

  const orderedCategories = useMemo(
    () => categories.filter((c) => c.id !== 'all'),
    [categories]
  );

  // ── Secciones: agrupadas por categoría en filas de 2 ──────────
  const sections = useMemo<CartaSection[]>(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const base = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.description ?? '').toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
      : products;

    const byCategory = new Map<string, ProductPublicDTO[]>();
    base.forEach((p) => {
      const arr = byCategory.get(p.category) ?? [];
      arr.push(p);
      byCategory.set(p.category, arr);
    });

    const out: CartaSection[] = [];
    orderedCategories.forEach((cat) => {
      const items = byCategory.get(cat.id);
      if (!items || items.length === 0) return;
      const rows: CartaRow[] = [];
      // El primer ítem de cada categoría abre la sección como hero
      rows.push({ key: `${cat.id}-hero`, items: [items[0]], hero: true });
      for (let i = 1; i < items.length; i += 2) {
        rows.push({ key: `${cat.id}-${i}`, items: items.slice(i, i + 2) });
      }
      out.push({ title: cat.name, categoryId: cat.id, count: items.length, data: rows });
    });
    return out;
  }, [products, orderedCategories, debouncedQuery]);

  const resultCount = useMemo(
    () => sections.reduce((n, s) => n + s.count, 0),
    [sections]
  );

  const searching = debouncedQuery.trim().length > 0;

  // ── Scroll-spy: la categoría visible manda ────────────────────
  const handleScrollSpy = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (searching) return;
      if (Date.now() < programmaticUntil.current) return;
      const cursor = e.nativeEvent.contentOffset.y + barHeight + 16;
      let current = 'all';
      for (const cat of orderedCategories) {
        const off = sectionOffsets.current[cat.id];
        if (off !== undefined && cursor >= off) current = cat.id;
      }
      if (current !== activeRef.current) {
        activeRef.current = current;
        setActiveCategory(current);
      }
    },
    [searching, barHeight, orderedCategories]
  );

  const onScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true, listener: handleScrollSpy }
      ),
    [handleScrollSpy, scrollY]
  );

  // ── Navegación por categorías (tap = scroll, spy = highlight) ─
  const scrollToCategory = useCallback(
    (id: string) => {
      programmaticUntil.current = Date.now() + 700;
      activeRef.current = id;
      setActiveCategory(id);

      if (id === 'all') {
        listRef.current?.getScrollResponder()?.scrollTo({ y: 0, animated: true });
        return;
      }

      const off = sectionOffsets.current[id];
      if (off !== undefined) {
        const target = Math.max(off - barHeight - 16, 0);
        listRef.current?.getScrollResponder()?.scrollTo({ y: target, animated: true });
        return;
      }

      // Sin medida todavía: salto aproximado + corrección al medirse
      const idx = sections.findIndex((s) => s.categoryId === id);
      if (idx >= 0) {
        listRef.current?.scrollToLocation({
          sectionIndex: idx,
          itemIndex:    0,
          viewOffset:   barHeight + 16,
          animated:     true,
        });
        setTimeout(() => {
          const exact = sectionOffsets.current[id];
          if (exact !== undefined) {
            listRef.current
              ?.getScrollResponder()
              ?.scrollTo({ y: Math.max(exact - barHeight - 16, 0), animated: true });
          }
        }, 450);
      }
    },
    [barHeight, sections]
  );

  // ── Acciones ──────────────────────────────────────────────────
  const getCartQty = useCallback(
    (id: string) => cart.find((l) => l.productId === id)?.quantity ?? 0,
    [cart]
  );

  const handleAdd = useCallback((product: ProductPublicDTO) => {
    addToCart({
      productId: product.id,
      name:      product.name,
      price:     product.dynamicPrice ?? product.price,
      image:     product.image,
      notes:     '',
      quantity:  1,
    });
    setToastMsg(`${product.name} agregado`);
    setTimeout(() => setToastMsg(null), 2800);
  }, [addToCart]);

  const handleRemove = useCallback((product: ProductPublicDTO) => {
    const qty = getCartQty(product.id);
    if (qty <= 1) {
      removeFromCart(product.id);
    } else {
      setLineQty(product.id, qty - 1);
    }
  }, [getCartQty, setLineQty, removeFromCart]);

  const handleDetailAdd = useCallback(
    (product: ProductPublicDTO, quantity: number, notes: string) => {
      addToCart({
        productId: product.id,
        name:      product.name,
        price:     product.dynamicPrice ?? product.price,
        image:     product.image,
        notes,
        quantity,
      });
    },
    [addToCart]
  );

  const handleFavorite = useCallback(
    (product: ProductPublicDTO) => toggleFavorite(product.id),
    [toggleFavorite]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    activeRef.current = 'all';
    setActiveCategory('all');
  }, []);

  // ── ListHeaderComponent ───────────────────────────────────────
  const ListHeader = useMemo(() => (
    <View style={styles.listHeader}>
      {/* Title */}
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Nuestra Carta</Text>
        {products.length > 0 && (
          <Text style={styles.productCount}>{products.length} productos</Text>
        )}
      </View>

      {/* SearchBar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cocktails, vinos, comida..."
            placeholderTextColor={Colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <X size={16} color={Colors.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Resultados de búsqueda */}
        {searching && (
          <Text style={styles.resultsText}>
            {resultCount} resultado{resultCount !== 1 ? 's' : ''} para "{debouncedQuery.trim()}"
          </Text>
        )}
      </View>

      {/* CategoryHeroRow — entrada visual a las categorías */}
      <CategoryHeroRow
        categories={categories}
        activeCategory={activeCategory}
        onSelect={scrollToCategory}
        onRuletaPress={() => {/* navigation to roulette handled in HomeScreen */}}
      />

      {/* Hueco reservado para la barra sticky de categorías */}
      <View
        style={{ height: searching ? 0 : barHeight }}
        onLayout={(e) => setStickyTop(e.nativeEvent.layout.y)}
      />
    </View>
  ), [
    products.length, searchQuery, debouncedQuery, searching, resultCount,
    categories, activeCategory, clearSearch, scrollToCategory, barHeight,
  ]);

  // ── ListEmptyComponent ────────────────────────────────────────
  const ListEmpty = useMemo(() => (
    <View>
      <NEmptyState
        icon={<UtensilsCrossed size={28} color={Colors.outline} />}
        title={
          searching
            ? `Sin resultados para "${searchQuery.trim()}"`
            : 'No hay productos disponibles'
        }
        subtitle={
          searching
            ? 'Probá con otra palabra o explorá por categoría'
            : 'Volvé a intentar en unos minutos'
        }
        action={
          searching
            ? { label: 'Limpiar búsqueda', onPress: resetSearch }
            : undefined
        }
      />

      {/* Sugerencia de categorías */}
      {searching && orderedCategories.length > 0 && (
        <View style={styles.suggestWrap}>
          <Text style={styles.suggestLabel}>Explorá por categoría</Text>
          <View style={styles.suggestRow}>
            {orderedCategories.slice(0, 4).map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.suggestPill}
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery('');
                  setTimeout(() => scrollToCategory(cat.id), 180);
                }}
              >
                <Text style={styles.suggestPillText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  ), [searching, searchQuery, orderedCategories, resetSearch, scrollToCategory]);

  // ── Render: estado de carga ───────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadWrap}>
          <View style={styles.headerBar}>
            <Text style={styles.screenTitle}>Nuestra Carta</Text>
          </View>
          <NSkeleton height={44} radius={Radius.lg} />
          <NSkeleton height={38} radius={Radius.full} />
          {[0, 1].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <View style={styles.skeletonCell}>
                <NSkeleton height={190} radius={Radius.lg} />
              </View>
              <View style={styles.skeletonCell}>
                <NSkeleton height={190} radius={Radius.lg} />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // ── Render: error ─────────────────────────────────────────────
  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <NEmptyState
          icon={<UtensilsCrossed size={32} color={Colors.error} />}
          title="No pudimos cargar la carta"
          subtitle={error}
          action={{ label: 'Reintentar', onPress: () => fetchProducts() }}
        />
      </SafeAreaView>
    );
  }

  // ── Barra sticky: lista para mostrarse ────────────────────────
  const barReady = !searching && stickyTop > 0 && barHeight > 0;
  const stickyDelta = stickyTop > 0
    ? scrollY.interpolate({
        inputRange:  [0, stickyTop],
        outputRange: [0, -stickyTop],
        extrapolate: 'clamp',
      })
    : 0;

  // ── Render principal ──────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.listWrap}>
        <Animated.SectionList
          ref={listRef}
          sections={sections}
          keyExtractor={(row) => row.key}
          renderItem={({ item }) => {
            const [first] = item.items;

            // Hero de sección: primer ítem a ancho completo
            if (item.hero && first) {
              return (
                <SommelierCard
                  product={first}
                  isFavorite={isFavorite(first.id)}
                  onAdd={(p) => setCustomizerProduct(p)}
                  onPress={(p) => setSelectedProduct(p)}
                  onFavorite={token ? handleFavorite : undefined}
                />
              );
            }

            return (
              <View style={styles.rowWrap}>
                {item.items.map((p) => (
                  <View key={p.id} style={styles.gridItem}>
                    <ProductGridCard
                      product={p}
                      isFavorite={isFavorite(p.id)}
                      cartQty={getCartQty(p.id)}
                      onAdd={handleAdd}
                      onRemove={handleRemove}
                      onFavorite={token ? handleFavorite : undefined}
                      onPress={setSelectedProduct}
                    />
                  </View>
                ))}
                {item.items.length === 1 && <View style={styles.gridItem} />}
              </View>
            );
          }}
          renderSectionHeader={({ section }) => (
            <View
              style={styles.sectionHeader}
              onLayout={(e) => {
                sectionOffsets.current[section.categoryId] = e.nativeEvent.layout.y;
              }}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>
                {section.count} {section.count === 1 ? 'opción' : 'opciones'}
              </Text>
            </View>
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          stickySectionHeadersEnabled={false}
          onScroll={onScroll}
          scrollEventThrottle={32}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabBarHeight + Spacing.xxl + 20 },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.gridGap }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchProducts(true)}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={() => {
            // Silencioso: scrollToCategory corrige con offsets medidos
          }}
        />

        {/* ── Barra de categorías sticky (scroll-spy) ──────── */}
        <Animated.View
          style={[
            styles.stickyBar,
            {
              top:      stickyTop,
              opacity:  barReady ? 1 : 0,
              transform: [{ translateY: stickyDelta }],
            },
          ]}
          pointerEvents={barReady ? 'auto' : 'none'}
        >
          <View
            style={styles.stickyBarInner}
            onLayout={(e) => setBarHeight(e.nativeEvent.layout.height)}
          >
            <CategoryPills
              categories={categories}
              selectedCategory={activeCategory}
              onSelectCategory={scrollToCategory}
            />
          </View>
        </Animated.View>
      </View>

      {/* ── FloatingCartBar ──────────────────────────────── */}
      <View style={[styles.floatingBarContainer, { bottom: tabBarHeight + 12 }]}>
        <FloatingCartBar onPress={() => navigation.navigate('Pedidos')} />
      </View>

      {/* ── ModifierModal ─────────────────────────────────── */}
      <ModifierModal
        visible={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onConfirm={handleDetailAdd}
      />

      {/* ── ProductCustomizerSheet ───────────────────────── */}
      <ProductCustomizerSheet
        visible={!!customizerProduct}
        product={customizerProduct}
        onClose={() => setCustomizerProduct(null)}
        onConfirm={handleDetailAdd}
      />

      {/* ── Toast ────────────────────────────────────────── */}
      <NToast
        visible={!!toastMsg}
        message={toastMsg ?? ''}
        variant="success"
        onHide={() => setToastMsg(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  listWrap: { flex: 1 },

  // ── SectionList content ───────────────────────────────────────
  listContent: {
    paddingHorizontal: Spacing.gutter,
  },
  rowWrap: {
    flexDirection: 'row',
    gap:           Spacing.gridGap,
  },
  gridItem: {
    flex: 1,
  },

  // ── Section headers ───────────────────────────────────────────
  sectionHeader: {
    flexDirection:  'row',
    alignItems:     'baseline',
    justifyContent: 'space-between',
    paddingTop:     Spacing.md,
    paddingBottom:  Spacing.sm,
  },
  sectionTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
  },
  sectionCount: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },

  // ── List header sub-styles ────────────────────────────────────
  listHeader: {
    gap: Spacing.sm,
  },
  headerBar: {
    flexDirection:   'row',
    alignItems:      'baseline',
    justifyContent:  'space-between',
    paddingTop:      Spacing.md,
    paddingBottom:   Spacing.xs,
  },
  screenTitle: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
  },
  productCount: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },

  // ── Search ─────────────────────────────────────────────────────
  searchWrap: {
    paddingBottom: Spacing.xs,
    gap:           Spacing.xs,
  },
  searchBar: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical:   10,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
    gap:             Spacing.sm,
  },
  searchInput: {
    flex:    1,
    ...Typography.bodyMd,
    color:   Colors.onSurface,
    padding: 0,
  },
  resultsText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },

  // ── Barra sticky ───────────────────────────────────────────────
  stickyBar: {
    position:        'absolute',
    left:            0,
    right:           0,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: NocturneColors.borderSubtle,
    zIndex:          10,
  },
  stickyBarInner: {
    paddingBottom: Spacing.xs,
  },

  // ── Empty state: sugerencia de categorías ─────────────────────
  suggestWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom:     Spacing.xxl,
    gap:               Spacing.sm,
    alignItems:        'center',
  },
  suggestLabel: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
  suggestRow: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            Spacing.sm,
    justifyContent: 'center',
  },
  suggestPill: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.full,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical:   6,
  },
  suggestPillText: {
    ...Typography.labelMd,
    color: Colors.onSurface,
  },

  // ── Skeleton de carga ──────────────────────────────────────────
  loadWrap: {
    paddingHorizontal: Spacing.gutter,
    paddingTop:        Spacing.xs,
    gap:               Spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap:           Spacing.gridGap,
  },
  skeletonCell: {
    flex: 1,
  },

  // ── FloatingCartBar ────────────────────────────────────────────
  floatingBarContainer: {
    position: 'absolute',
    left:     Spacing.gutter,
    right:    Spacing.gutter,
  },
});

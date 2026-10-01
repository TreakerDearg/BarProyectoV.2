// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — CartaScreen
// Catálogo completo: búsqueda, categorías, SommelierCard (featured),
// CompactProductRow (resto), ModifierModal, FloatingCartBar.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState, useEffect, useMemo, useCallback, useRef,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, UtensilsCrossed } from 'lucide-react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../navigation/types';

import { Colors }     from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';

import { getPublicProducts } from '../api/menuApi';
import { useCartStore }      from '../stores/useCartStore';
import { useAuthStore }      from '../stores/useAuthStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';

import { SommelierCard }      from '../components/shared/SommelierCard';
import { CompactProductRow }  from '../components/shared/CompactProductRow';
import { NEmptyState }        from '../components/shared/NEmptyState';
import {
  SkeletonSommelierCard,
  SkeletonCompactRow,
} from '../components/shared/NSkeleton';
import { NToast }            from '../components/shared/NToast';
import { FloatingCartBar }   from '../components/FloatingCartBar';
import { ModifierModal }     from '../components/ModifierModal';
import { CategoryPills }     from '../components/CategoryPills';

import type { ProductPublicDTO } from '../types/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Agrupa categorías únicas con un "Todos" al inicio */
function buildCategories(products: ProductPublicDTO[]) {
  const set = new Set<string>();
  products.forEach((p) => { if (p.category) set.add(p.category); });
  return [
    { id: 'all', name: 'Todos' },
    ...Array.from(set).map((cat) => ({
      id:   cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
    })),
  ];
}

const FEATURED_COUNT = 3; // primeros N productos featured como SommelierCard

// ── Componente ────────────────────────────────────────────────────────────────

type CartaNav = BottomTabNavigationProp<RootTabParamList, 'Carta'>;

export default function CartaScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation   = useNavigation<CartaNav>();

  // ── Estado de datos ───────────────────────────────────────────
  const [products,   setProducts]   = useState<ProductPublicDTO[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // ── Filtros ───────────────────────────────────────────────────
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // ── Modals ────────────────────────────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState<ProductPublicDTO | null>(null);
  const [toastMsg,        setToastMsg]        = useState<string | null>(null);

  // ── Stores ────────────────────────────────────────────────────
  const { cart, addToCart }          = useCartStore();
  const { token }                    = useAuthStore();
  const { isFavorite, toggleFavorite, loadFromBackend } = useFavoritesStore();

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

  // ── Productos filtrados ───────────────────────────────────────
  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, activeCategory, searchQuery]);

  // Featured (solo sin filtros activos): primeros N con featured=true
  const featuredProducts = useMemo(
    () =>
      activeCategory === 'all' && !searchQuery.trim()
        ? products.filter((p) => p.featured && p.available).slice(0, FEATURED_COUNT)
        : [],
    [products, activeCategory, searchQuery]
  );

  // Lista normal: excluye los featured del top cuando están visibles
  const listProducts = useMemo(() => {
    if (featuredProducts.length === 0) return filtered;
    const featuredIds = new Set(featuredProducts.map((p) => p.id));
    return filtered.filter((p) => !featuredIds.has(p.id));
  }, [filtered, featuredProducts]);

  // ── Acciones ──────────────────────────────────────────────────
  const getCartQty = useCallback(
    (id: string) => cart.find((l) => l.productId === id)?.quantity ?? 0,
    [cart]
  );

  const handleQuickAdd = useCallback((product: ProductPublicDTO) => {
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

  const clearSearch = useCallback(() => setSearchQuery(''), []);

  // ── Render: estado de carga ───────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerBar}>
          <Text style={styles.screenTitle}>Nuestra Carta</Text>
        </View>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + Spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          <SkeletonSommelierCard />
          <SkeletonSommelierCard />
          {[...Array(4)].map((_, i) => <SkeletonCompactRow key={i} />)}
        </ScrollView>
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

  // ── Render principal ──────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ────────────────────────────────────────── */}
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Nuestra Carta</Text>
        {products.length > 0 && (
          <Text style={styles.productCount}>
            {products.length} productos
          </Text>
        )}
      </View>

      {/* ── SearchBar ─────────────────────────────────────── */}
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
      </View>

      {/* ── Categorías ────────────────────────────────────── */}
      <View style={styles.categoryWrap}>
        <CategoryPills
          categories={categories}
          selectedCategory={activeCategory}
          onSelectCategory={(id) => {
            setActiveCategory(id);
            setSearchQuery('');
          }}
        />
      </View>

      {/* ── Lista de productos ────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: tabBarHeight + Spacing.xxl + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProducts(true)}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Featured — Selección del Sommelier */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Selección del Sommelier</Text>
              <Text style={styles.sectionSub}>Recomendaciones exclusivas</Text>
            </View>
            <View style={styles.sommelierList}>
              {featuredProducts.map((product) => (
                <SommelierCard
                  key={product.id}
                  product={product}
                  isFavorite={isFavorite(product.id)}
                  onAdd={handleQuickAdd}
                  onPress={setSelectedProduct}
                  onFavorite={token ? handleFavorite : undefined}
                  featureBadge={
                    product.type === 'drink' ? 'COCKTAIL ESTRELLA' : 'PLATO DEL CHEF'
                  }
                />
              ))}
            </View>
          </View>
        )}

        {/* Divisor */}
        {featuredProducts.length > 0 && listProducts.length > 0 && (
          <View style={styles.divider} />
        )}

        {/* Carta completa / filtrada */}
        {listProducts.length === 0 && !loading ? (
          <NEmptyState
            icon={<UtensilsCrossed size={28} color={Colors.outline} />}
            title={
              searchQuery.trim()
                ? `Sin resultados para "${searchQuery}"`
                : 'No hay productos en esta categoría'
            }
            subtitle={
              searchQuery.trim()
                ? 'Probá con otro término de búsqueda'
                : undefined
            }
            action={
              searchQuery.trim() || activeCategory !== 'all'
                ? {
                    label: 'Limpiar filtros',
                    onPress: () => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    },
                  }
                : undefined
            }
          />
        ) : (
          <View style={styles.section}>
            {(searchQuery.trim() || activeCategory !== 'all') && (
              <Text style={styles.sectionTitle}>
                {searchQuery.trim()
                  ? `${listProducts.length} resultado${listProducts.length !== 1 ? 's' : ''}`
                  : categories.find((c) => c.id === activeCategory)?.name ?? activeCategory}
              </Text>
            )}
            {!searchQuery.trim() && activeCategory === 'all' && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Explorar la carta</Text>
              </View>
            )}
            <View style={styles.compactList}>
              {listProducts.map((product) => (
                <CompactProductRow
                  key={product.id}
                  product={product}
                  isFavorite={isFavorite(product.id)}
                  cartQty={getCartQty(product.id)}
                  onAdd={handleQuickAdd}
                  onPress={setSelectedProduct}
                  onFavorite={token ? handleFavorite : undefined}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── FloatingCartBar (navega a tab Pedidos) ────────── */}
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

      {/* ── Toast de confirmación ────────────────────────── */}
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

  // ── Header ─────────────────────────────────────────────────────
  headerBar: {
    flexDirection:   'row',
    alignItems:      'baseline',
    justifyContent:  'space-between',
    paddingHorizontal: Spacing.gutter,
    paddingTop:      Spacing.md,
    paddingBottom:   Spacing.sm,
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
    paddingHorizontal: Spacing.gutter,
    paddingBottom:     Spacing.sm,
  },
  searchBar: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical:   10,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.10)',
    gap:             Spacing.sm,
  },
  searchInput: {
    flex:      1,
    ...Typography.bodyMd,
    color:     Colors.onSurface,
    padding:   0,
  },

  // ── Categories ─────────────────────────────────────────────────
  categoryWrap: {
    paddingLeft: Spacing.gutter,
  },

  // ── Scroll ─────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: Spacing.gutter,
    paddingTop:        Spacing.sm,
    gap:               Spacing.md,
  },

  // ── Sections ───────────────────────────────────────────────────
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
  },
  sectionSub: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  sommelierList: {
    gap: Spacing.md,
  },
  compactList: {
    gap: Spacing.sm,
  },
  divider: {
    height:          1,
    backgroundColor: 'rgba(224, 226, 236, 0.06)',
    marginVertical:  Spacing.xs,
  },

  // ── FloatingCartBar (reposicionado sobre tab bar) ───────────────
  floatingBarContainer: {
    position:  'absolute',
    left:      Spacing.gutter,
    right:     Spacing.gutter,
  },
});

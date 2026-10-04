// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — CartaScreen  (FEAT-002 T10)
// FlatList numColumns=2 with ProductGridCard, CategoryHeroRow header,
// SearchBar, FloatingCartBar, ModifierModal, ProductCustomizerSheet, NToast.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState, useEffect, useMemo, useCallback,
} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
import { ProductGridCard }    from '../components/shared/ProductGridCard';
import { NEmptyState }        from '../components/shared/NEmptyState';
import {
  SkeletonSommelierCard,
  SkeletonCompactRow,
} from '../components/shared/NSkeleton';
import { NToast }            from '../components/shared/NToast';
import { FloatingCartBar }   from '../components/FloatingCartBar';
import { ModifierModal }     from '../components/ModifierModal';
import { ProductCustomizerSheet } from '../components/ProductCustomizerSheet';
import { CategoryHeroRow }   from '../components/CategoryHeroRow';

import type { ProductPublicDTO } from '../types/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  const [activeCategory, setActiveCategory] = useState('all');

  // ── Modals ────────────────────────────────────────────────────
  const [selectedProduct,   setSelectedProduct]   = useState<ProductPublicDTO | null>(null);
  const [toastMsg,          setToastMsg]          = useState<string | null>(null);
  const [customizerProduct, setCustomizerProduct] = useState<ProductPublicDTO | null>(null);

  // ── Stores ────────────────────────────────────────────────────
  const { cart, addToCart, setLineQty, removeFromCart } = useCartStore();
  const { token }                                        = useAuthStore();
  const { isFavorite, toggleFavorite, loadFromBackend }  = useFavoritesStore();

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

  const clearSearch = useCallback(() => setSearchQuery(''), []);

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
      </View>

      {/* CategoryHeroRow */}
      <CategoryHeroRow
        categories={categories}
        activeCategory={activeCategory}
        onSelect={(id) => {
          setActiveCategory(id);
          setSearchQuery('');
        }}
        onRuletaPress={() => {/* navigation to roulette handled in HomeScreen */}}
      />

      {/* Section heading */}
      {(searchQuery.trim() || activeCategory !== 'all') && (
        <View style={styles.sectionHeadingWrap}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim()
              ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`
              : categories.find((c) => c.id === activeCategory)?.name ?? activeCategory}
          </Text>
        </View>
      )}
    </View>
  ), [products.length, searchQuery, categories, activeCategory, filtered.length, clearSearch]);

  // ── Render: estado de carga ───────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerBar}>
          <Text style={styles.screenTitle}>Nuestra Carta</Text>
        </View>
        <View style={{ gap: Spacing.md, padding: Spacing.gutter }}>
          <SkeletonSommelierCard />
          <SkeletonSommelierCard />
          {[...Array(4)].map((_, i) => <SkeletonCompactRow key={i} />)}
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

  // ── Render principal ──────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.flatListContent,
          { paddingBottom: tabBarHeight + Spacing.xxl + 20 },
        ]}
        columnWrapperStyle={styles.columnWrapper}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.gridGap }} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
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
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProducts(true)}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProductGridCard
              product={item}
              isFavorite={isFavorite(item.id)}
              cartQty={getCartQty(item.id)}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onFavorite={token ? handleFavorite : undefined}
              onPress={setSelectedProduct}
            />
          </View>
        )}
      />

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

  // ── FlatList content ──────────────────────────────────────────
  flatListContent: {
    paddingHorizontal: Spacing.gutter,
    paddingTop:        Spacing.sm,
  },
  columnWrapper: {
    gap: Spacing.gridGap,
  },
  gridItem: {
    flex: 1,
  },

  // ── List header sub-styles ────────────────────────────────────
  listHeader: {
    marginBottom: Spacing.sm,
    gap:          Spacing.sm,
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
    flex:    1,
    ...Typography.bodyMd,
    color:   Colors.onSurface,
    padding: 0,
  },

  // ── Section heading ────────────────────────────────────────────
  sectionHeadingWrap: {
    paddingTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
  },

  // ── FloatingCartBar ────────────────────────────────────────────
  floatingBarContainer: {
    position: 'absolute',
    left:     Spacing.gutter,
    right:    Spacing.gutter,
  },
});

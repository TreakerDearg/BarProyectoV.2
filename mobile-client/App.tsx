import React, { useEffect, useState, useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, ScrollView, Modal, ActivityIndicator } from "react-native";
import { Colors } from "./src/theme/colors";
import { socketService } from "./src/socket/socketService";
import { useAuthStore } from "./src/stores/useAuthStore";
import { useCartStore } from "./src/stores/useCartStore";
import { getPublicProducts } from "./src/api/menuApi";
import type { ProductPublicDTO, OrderPublicDTO } from "./src/types/api";

// Components
import { HeaderContext } from "./src/components/HeaderContext";
import { DealsCarousel } from "./src/components/DealsCarousel";
import { CategoryPills } from "./src/components/CategoryPills";
import { ProductCard } from "./src/components/ProductCard";
import { ModifierModal } from "./src/components/ModifierModal";
import { FloatingCartBar } from "./src/components/FloatingCartBar";

// Screens / Modals
import { QRScannerScreen } from "./src/screens/QRScannerScreen";
import { CartScreen } from "./src/screens/CartScreen";
import { OrderStatusScreen } from "./src/screens/OrderStatusScreen";
import { RouletteScreen } from "./src/screens/RouletteScreen";

export default function App() {
  const loadSession = useAuthStore((s) => s.loadSession);
  const addToCart = useCartStore((s) => s.addToCart);

  // Data State
  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // UI Modal State
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderPublicDTO | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductPublicDTO | null>(null);

  useEffect(() => {
    // 1. Cargar sesión de usuario y conectar WebSocket
    loadSession();
    socketService.connect();

    // 2. Cargar catálogo de productos públicos
    getPublicProducts()
      .then(setProducts)
      .catch((e) => console.warn("[App] Error cargando productos:", e))
      .finally(() => setLoadingProducts(false));

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Extraer categorías dinámicamente de los productos
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });

    const list = [{ id: "all", name: "🔥 Todos" }];
    set.forEach((cat) => {
      list.push({ id: cat, name: cat.charAt(0).toUpperCase() + cat.slice(1) });
    });
    return list;
  }, [products]);

  // Filtrar productos por categoría
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleQuickAdd = (product: ProductPublicDTO) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.dynamicPrice || product.price,
      image: product.image,
      notes: "",
      quantity: 1,
    });
  };

  const handleCustomAdd = (product: ProductPublicDTO, quantity: number, notes: string) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.dynamicPrice || product.price,
      image: product.image,
      notes,
      quantity,
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor={Colors.background} />

        {/* 1. HEADER CONTEXTUAL (Mesa actual / Retiro en barra) */}
        <HeaderContext onOpenScanner={() => setShowQRScanner(true)} />

        {/* 2. FEED PRINCIPAL ESTILO FAST-FOOD (MCDONALD'S / KFC) */}
        <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
          {/* OFERTAS Y BENEFICIOS */}
          <DealsCarousel onSelectPromo={() => setShowRoulette(true)} />

          {/* SELECTOR HORIZONTAL DE CATEGORÍAS */}
          <CategoryPills
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* LISTA DE PRODUCTOS */}
          <View style={styles.productsSection}>
            <Text style={styles.sectionHeading}>
              {selectedCategory === "all" ? "Nuestra Carta" : selectedCategory.toUpperCase()}
            </Text>

            {loadingProducts ? (
              <View style={styles.loadingArea}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Cargando cócteles y tapas...</Text>
              </View>
            ) : filteredProducts.length === 0 ? (
              <View style={styles.emptyArea}>
                <Text style={styles.emptyText}>No hay productos disponibles en esta sección.</Text>
              </View>
            ) : (
              filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onPress={(p) => setSelectedProduct(p)}
                  onQuickAdd={handleQuickAdd}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* 3. BARRA FLOTANTE DE CARRITO INFERIOR */}
        <FloatingCartBar onPress={() => setShowCart(true)} />

        {/* MODAL: PERSONALIZADOR DE PRODUCTO */}
        <ModifierModal
          visible={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleCustomAdd}
        />

        {/* MODAL: VINCULAR MESA (TECLADO NUMÉRICO 3 DÍGITOS) */}
        <Modal visible={showQRScanner} animationType="slide" onRequestClose={() => setShowQRScanner(false)}>
          <QRScannerScreen
            onClose={() => setShowQRScanner(false)}
            onSuccess={() => setShowQRScanner(false)}
          />
        </Modal>

        {/* MODAL: CARRITO Y CHECKOUT */}
        <Modal visible={showCart} animationType="slide" onRequestClose={() => setShowCart(false)}>
          <CartScreen
            onClose={() => setShowCart(false)}
            onOpenTableConnect={() => {
              setShowCart(false);
              setShowQRScanner(true);
            }}
            onOrderSuccess={(order) => {
              setShowCart(false);
              setActiveOrder(order);
            }}
          />
        </Modal>

        {/* MODAL: SEGUIMIENTO EN VIVO DE COMANDA */}
        {activeOrder && (
          <Modal visible={!!activeOrder} animationType="slide" onRequestClose={() => setActiveOrder(null)}>
            <OrderStatusScreen initialOrder={activeOrder} onClose={() => setActiveOrder(null)} />
          </Modal>
        )}

        {/* MODAL: RULETA NEBULA */}
        <Modal visible={showRoulette} animationType="slide" onRequestClose={() => setShowRoulette(false)}>
          <RouletteScreen onClose={() => setShowRoulette(false)} />
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  productsSection: {
    marginTop: 8,
  },
  sectionHeading: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  loadingArea: {
    paddingVertical: 50,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyArea: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});

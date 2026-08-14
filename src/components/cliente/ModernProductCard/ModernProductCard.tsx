"use client";

import { Plus } from "lucide-react";
import styles from "./ModernProductCard.module.css";

const featuredProducts = [
  {
    id: 1,
    name: "Hamburguesa Clásica",
    description: "Carne 100% premium, lechuga, tomate, cebolla y nuestra salsa especial",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    badge: "Popular",
  },
  {
    id: 2,
    name: "Papas Fritas",
    description: "Papas cortadas a mano, doradas y crujientes con sal marina",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
    badge: null,
  },
  {
    id: 3,
    name: "Cóctel Mojito",
    description: "Ron blanco, menta fresca, lima, azúcar y soda",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80",
    badge: "Nuevo",
  },
  {
    id: 4,
    name: "Brownie con Helado",
    description: "Brownie de chocolate caliente con helado de vainilla",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80",
    badge: null,
  },
];

export function ModernProductCard() {
  const handleAddToCart = (productId: number) => {
    console.log(`Adding product ${productId} to cart`);
    // TODO: Implement cart functionality
  };

  return (
    <section className={styles.productsSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Lo más pedido</h2>
          <p className={styles.sectionSubtitle}>Los favoritos de nuestros clientes</p>
        </div>
        
        <div className={styles.productsGrid}>
          {featuredProducts.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>
                <img src={product.image} alt={product.name} />
                {product.badge && (
                  <div className={styles.productBadge}>{product.badge}</div>
                )}
              </div>
              
              <div className={styles.productContent}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>${product.price.toFixed(2)}</span>
                  <button
                    className={styles.addButton}
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
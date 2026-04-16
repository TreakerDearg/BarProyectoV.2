"use client";

import { Product } from "@/services/productService";
import ProductCard from "./ProductCard";
import styles from "@/styles/products/ProductsGrid.module.css";

interface ProductsGridProps {
  products: Product[];
  loading: boolean;
  refresh: () => void;
  onEdit: (product: Product) => void;
}

export default function ProductsGrid({
  products,
  loading,
  refresh,
  onEdit,
}: ProductsGridProps) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.skeleton}></div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay cócteles disponibles.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          refresh={refresh}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
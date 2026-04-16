"use client";

import { Pencil, Trash2, Martini } from "lucide-react";
import {
  deleteProduct,
  Product,
} from "@/services/productService";
import styles from "@/styles/products/ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  refresh: () => void;
  onEdit: (product: Product) => void;
}

export default function ProductCard({
  product,
  refresh,
  onEdit,
}: ProductCardProps) {
  const handleDelete = async () => {
    const confirmDelete = confirm(
      `¿Eliminar ${product.name}?`
    );
    if (!confirmDelete) return;

    try {
      await deleteProduct(product._id);
      refresh();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  };

  return (
    <div className={styles.card}>
      {/* ICONO */}
      <div className={styles.icon}>
        <Martini size={32} />
      </div>

      {/* INFORMACIÓN */}
      <h3 className={styles.title}>{product.name}</h3>
      <p className={styles.category}>
        {product.category || "Sin categoría"}
      </p>

      <p className={styles.price}>
        ${product.price.toFixed(2)}
      </p>

      {/* ACCIONES */}
      <div className={styles.actions}>
        <button
          onClick={() => onEdit(product)}
          className={styles.editBtn}
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={handleDelete}
          className={styles.deleteBtn}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
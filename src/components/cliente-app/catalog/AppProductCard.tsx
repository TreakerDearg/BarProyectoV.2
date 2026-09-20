"use client";

import { GlassWater, Plus } from "lucide-react";
import type { ProductPublicDTO } from "@/lib/types/api";
import styles from "./AppProductCard.module.css";

export function AppProductCard({ product, quantity, onAdd }: { product: ProductPublicDTO; quantity: number; onAdd: (product: ProductPublicDTO) => void }) {
  const price = product.dynamicPrice ?? product.price;
  return (
    <article className={styles.card} aria-label={product.name}>
      <div className={styles.image}>
        {product.image ? <img src={product.image} alt="" loading="lazy" /> : <div className={styles.placeholder}><GlassWater size={28} /></div>}
        {product.featured && <span className={styles.badge}>Favorito</span>}
      </div>
      <div className={styles.content}>
        <span className={styles.type}>{product.type === "drink" ? "Bebida" : "Cocina"}</span>
        <h2 className={styles.name}>{product.name}</h2>
        <p className={styles.description}>{product.description || "Una elección especial para disfrutar en Nebula."}</p>
        {product.available === false && <span className={styles.unavailable}>Agotado por ahora</span>}
        <div className={styles.footer}>
          <span className={styles.price}>{price.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}</span>
          <button type="button" className={styles.add} onClick={() => onAdd(product)} disabled={product.available === false} aria-label={product.available === false ? `${product.name} agotado` : `Agregar ${product.name}`}>{quantity || <Plus size={19} aria-hidden="true" />}</button>
        </div>
      </div>
    </article>
  );
}

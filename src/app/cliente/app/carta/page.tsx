"use client";

import Link from "next/link";
import { GlassWater, Plus, Search, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { useMenu } from "@/hooks/useMenu";
import { useClienteStore } from "@/stores/useClienteStore";
import type { ProductPublicDTO } from "@/lib/types/api";
import styles from "./app-carta.module.css";

function priceOf(product: ProductPublicDTO) {
  return product.dynamicPrice ?? product.price;
}

export default function AppCartaPage() {
  const menu = useMenu();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const cart = useClienteStore((state) => state.cart);
  const addToCart = useClienteStore((state) => state.addToCart);

  const products = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return menu.products
      .filter((product) => category === "all" || product.category?.toLowerCase() === category)
      .filter((product) => !normalized || [product.name, product.description, product.category, ...product.tags].some((value) => value?.toLowerCase().includes(normalized)))
      .sort((a, b) => Number(b.available) - Number(a.available) || Number(b.featured) - Number(a.featured));
  }, [category, menu.products, query]);

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const categories = menu.categories;

  const handleAdd = (product: ProductPublicDTO) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: priceOf(product),
      quantity: 1,
      notes: "",
    });
  };

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>Pedir</span>
        <h1 className={styles.title}>La carta, a tu ritmo</h1>
        <p className={styles.description}>Explora, elige y agrega tus favoritos sin perder el hilo.</p>
      </header>

      <label className={styles.search}>
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Buscar en la carta</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar bebida, plato..." />
      </label>

      {categories.length > 0 && (
        <div className={styles.categories} aria-label="Categorías de la carta">
          <button type="button" className={`${styles.category} ${category === "all" ? styles.categoryActive : ""}`} onClick={() => setCategory("all")}>Todo</button>
          {categories.map((item) => (
            <button key={item.id} type="button" className={`${styles.category} ${category === item.id ? styles.categoryActive : ""}`} onClick={() => setCategory(item.id)}>
              {item.name}
            </button>
          ))}
        </div>
      )}

      {menu.loading && <p className={styles.state}>Cargando la carta...</p>}
      {menu.error && <p className={styles.state} role="alert">{menu.error}</p>}
      {!menu.loading && !menu.error && products.length === 0 && <p className={styles.empty}>No encontramos productos con esos filtros.</p>}

      <div className={styles.grid}>
        {products.map((product) => {
          const quantity = cart.find((line) => line.productId === product.id)?.quantity ?? 0;
          return (
            <article className={styles.product} key={product.id}>
              <div className={styles.productImage}>
                {product.image ? <img src={product.image} alt="" loading="lazy" /> : <div className={styles.productPlaceholder}><GlassWater size={23} /></div>}
              </div>
              <div className={styles.productInfo}>
                <span className={styles.productType}>{product.type === "drink" ? "Bebida" : "Cocina"}</span>
                <h2 className={styles.productName}>{product.name}</h2>
                {product.description && <p className={styles.productDescription}>{product.description}</p>}
                <p className={styles.productPrice}>${priceOf(product).toLocaleString("es-AR", { maximumFractionDigits: 0 })}</p>
              </div>
              <button type="button" className={styles.add} onClick={() => handleAdd(product)} disabled={product.available === false} aria-label={`Agregar ${product.name}${quantity ? `, ${quantity} en el pedido` : ""}`}>
                {quantity > 0 ? <span>{quantity}</span> : <Plus size={20} aria-hidden="true" />}
              </button>
            </article>
          );
        })}
      </div>

      {cartCount > 0 && (
        <div className={styles.cartBar}>
          <div className={styles.cartText}><ShoppingBag size={17} aria-hidden="true" /> <span>{cartCount} {cartCount === 1 ? "producto" : "productos"}<span className={styles.cartSubtext}>Tu pedido está guardado</span></span></div>
          <Link href="/cliente/app/pedido" className={styles.cartLink}>Ver pedido <span aria-hidden="true">→</span></Link>
        </div>
      )}
    </main>
  );
}

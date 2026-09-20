"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useMenu } from "@/hooks/useMenu";
import { useClienteStore } from "@/stores/useClienteStore";
import type { ProductPublicDTO } from "@/lib/types/api";
import { AppCartBar } from "@/components/cliente-app/catalog/AppCartBar";
import { AppProductCard } from "@/components/cliente-app/catalog/AppProductCard";
import styles from "./app-carta.module.css";

function priceOf(product: ProductPublicDTO): number { return product.dynamicPrice ?? product.price; }

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
  const featured = products.filter((product) => product.featured && product.available !== false).slice(0, 2);
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const cartTotal = cart.reduce((total, line) => total + line.price * line.quantity, 0);
  const handleAdd = (product: ProductPublicDTO) => addToCart({ productId: product.id, name: product.name, price: priceOf(product), quantity: 1, notes: "" });

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>Pedir</span>
        <h1 className={styles.title}>Elige tu próximo momento</h1>
        <p className={styles.description}>Explora favoritos, descubre algo nuevo y arma tu pedido a tu ritmo.</p>
      </header>
      <label className={styles.search}><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar en la carta</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar bebida, plato..." /></label>
      {menu.categories.length > 0 && <div className={styles.categories} aria-label="Categorías de la carta"><button type="button" className={`${styles.category} ${category === "all" ? styles.categoryActive : ""}`} onClick={() => setCategory("all")}>Todo</button>{menu.categories.map((item) => <button key={item.id} type="button" className={`${styles.category} ${category === item.id ? styles.categoryActive : ""}`} onClick={() => setCategory(item.id)}>{item.name}</button>)}</div>}
      {!query && category === "all" && featured.length > 0 && <section className={styles.featured} aria-labelledby="featured-title"><div className={styles.sectionHeading}><h2 id="featured-title" className={styles.sectionTitle}>Favoritos de la casa</h2><span className={styles.sectionMeta}>Para empezar</span></div><div className={styles.featuredList}>{featured.map((product) => <button type="button" className={styles.featuredItem} key={product.id} onClick={() => handleAdd(product)}><span className={styles.featuredImage}>{product.image && <img src={product.image} alt="" />}</span><span><span className={styles.featuredName}>{product.name}</span><span className={styles.featuredPrice}>{priceOf(product).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}</span></span></button>)}</div></section>}
      {menu.loading && <p className={styles.state}>Cargando la carta...</p>}
      {menu.error && <p className={styles.state} role="alert">{menu.error}</p>}
      {!menu.loading && !menu.error && products.length === 0 && <p className={styles.empty}>No encontramos productos con esos filtros.</p>}
      <section className={styles.grid} aria-label="Productos de la carta">{products.map((product) => <AppProductCard key={product.id} product={product} quantity={cart.find((line) => line.productId === product.id)?.quantity ?? 0} onAdd={handleAdd} />)}</section>
      <AppCartBar count={cartCount} total={cartTotal} />
    </main>
  );
}

"use client";

import Link from "next/link";
import styles from "./CategoryCards.module.css";

const categories = [
  {
    name: "Hamburguesas",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    href: "/cliente/carta?category=hamburguesas",
  },
  {
    name: "Papas",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
    href: "/cliente/carta?category=papas",
  },
  {
    name: "Bebidas",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80",
    href: "/cliente/carta?category=bebidas",
  },
  {
    name: "Cócteles",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80",
    href: "/cliente/carta?category=cocteles",
  },
  {
    name: "Postres",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
    href: "/cliente/carta?category=postres",
  },
  {
    name: "Ensaladas",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
    href: "/cliente/carta?category=ensaladas",
  },
];

export function CategoryCards() {
  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>¿Qué te apetece?</h2>
          <p className={styles.sectionSubtitle}>Explora nuestras categorías</p>
        </div>
        
        <div className={styles.categoriesContainer}>
          {categories.map((category) => (
            <Link key={category.name} href={category.href} className={styles.categoryCard}>
              <div className={styles.categoryImage}>
                <img src={category.image} alt={category.name} />
                <div className={styles.categoryOverlay} />
              </div>
              <div className={styles.categoryName}>{category.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
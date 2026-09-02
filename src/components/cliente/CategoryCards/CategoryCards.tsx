"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassWater, ChefHat, Layers } from "lucide-react";
import { getProductCategories, type ProductCategoryPublic } from "@/lib/api/bartender";
import styles from "./CategoryCards.module.css";

// Fallback estático si la API no responde
const FALLBACK_CATEGORIES: ProductCategoryPublic[] = [
  { id: "cocteles",    name: "Cócteles",    count: 0, drinks: 0, food: 0, sampleImage: null },
  { id: "vinos",       name: "Vinos",       count: 0, drinks: 0, food: 0, sampleImage: null },
  { id: "destilados",  name: "Destilados",  count: 0, drinks: 0, food: 0, sampleImage: null },
  { id: "entradas",    name: "Entradas",    count: 0, drinks: 0, food: 0, sampleImage: null },
  { id: "principales", name: "Principales", count: 0, drinks: 0, food: 0, sampleImage: null },
  { id: "postres",     name: "Postres",     count: 0, drinks: 0, food: 0, sampleImage: null },
];

// Imágenes Unsplash de alta calidad como fallback por tipo
const UNSPLASH_FALLBACK: Record<string, string> = {
  drinks: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=75",
  food:   "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=75",
  default:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=75",
};

function categoryFallbackImage(cat: ProductCategoryPublic): string {
  if (cat.sampleImage) return cat.sampleImage;
  if (cat.drinks > cat.food) return UNSPLASH_FALLBACK.drinks;
  if (cat.food > 0)          return UNSPLASH_FALLBACK.food;
  return UNSPLASH_FALLBACK.default;
}

function CategorySkeleton() {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonLabel} />
    </div>
  );
}

export function CategoryCards() {
  const [categories, setCategories] = useState<ProductCategoryPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductCategories()
      .then((data) => {
        if (data.length > 0) {
          setCategories(data.slice(0, 6)); // máx 6 en home
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      })
      .catch(() => setCategories(FALLBACK_CATEGORIES))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionKicker}>
            <Layers size={14} />
            Nuestra carta
          </div>
          <h2 className={styles.sectionTitle}>Explorá por categoría</h2>
          <p className={styles.sectionSubtitle}>
            Desde cócteles de autor hasta platos de autor
          </p>
        </div>

        <div className={styles.categoriesContainer}>
          {loading
            ? Array.from({ length: 6 }, (_, i) => <CategorySkeleton key={i} />)
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/cliente/carta?category=${encodeURIComponent(cat.name)}`}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryImage}>
                    <img
                      src={categoryFallbackImage(cat)}
                      alt={cat.name}
                      loading="lazy"
                    />
                    <div className={styles.categoryOverlay} />
                    {/* Badge de tipo */}
                    {cat.drinks > 0 && cat.food === 0 && (
                      <span className={styles.typeBadge}>
                        <GlassWater size={11} /> Bebidas
                      </span>
                    )}
                    {cat.food > 0 && cat.drinks === 0 && (
                      <span className={styles.typeBadge}>
                        <ChefHat size={11} /> Cocina
                      </span>
                    )}
                  </div>
                  <div className={styles.categoryName}>
                    {cat.name}
                    {cat.count > 0 && (
                      <span className={styles.categoryCount}>{cat.count}</span>
                    )}
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}

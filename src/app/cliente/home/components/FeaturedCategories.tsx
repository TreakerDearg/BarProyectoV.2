"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChefHat, Wine, UtensilsCrossed, GlassWater, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicMenus } from "@/lib/api/bartender";
import type { PublicMenu, MenuCategory } from "@/lib/types/api";
import ui from "../../cliente-ui.module.css";

interface FeaturedCategoriesProps {
  maxCategories?: number;
}

interface CategoryWithMenu extends MenuCategory {
  menuName: string;
}

// Icon mapping para categorías
function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase();
  if (name.includes("bebida") || name.includes("trago") || name.includes("cocktail")) {
    return Wine;
  }
  if (name.includes("comida") || name.includes("plato") || name.includes("entrada")) {
    return UtensilsCrossed;
  }
  return GlassWater;
}

export default function FeaturedCategories({ maxCategories = 6 }: FeaturedCategoriesProps) {
  const [categories, setCategories] = useState<CategoryWithMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    getPublicMenus({ hideUnavailable: false })
      .then((data) => {
        if (alive) {
          // Extraer categorías únicas de todos los menús
          const allCategories = Array.isArray(data) ? data.flatMap(menu => 
            menu.categories?.map(cat => ({
              ...cat,
              menuName: menu.name
            })) || []
          ) : [];

          // Ordenar por cantidad de productos y limitar
          const sortedCategories = allCategories
            .sort((a, b) => (b.products?.length || 0) - (a.products?.length || 0))
            .slice(0, maxCategories);

          setCategories(sortedCategories);
        }
      })
      .catch((e: Error) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [maxCategories]);

  if (loading) {
    return (
      <section className={ui.featuredCategoriesSection}>
        <div className={ui.featuredCategoriesContainer}>
          <h2 className={ui.featuredCategoriesTitle}>Categorías Destacadas</h2>
          <div className={ui.featuredCategoriesGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={ui.featuredCategorySkeleton} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section className={ui.featuredCategoriesSection}>
      <div className={ui.featuredCategoriesContainer}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={ui.featuredCategoriesTitle}>Explora por Categoría</h2>
          <p className={ui.featuredCategoriesSubtitle}>
            Descubre nuestra selección de platos y bebidas artesanales
          </p>
        </motion.div>

        <div className={ui.featuredCategoriesGrid}>
          {categories.map((category, index) => {
            const CategoryIcon = getCategoryIcon(category.name);
            const productCount = category.products?.length || 0;

            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link 
                  href="/cliente/carta" 
                  className={ui.featuredCategoryCard}
                >
                  <div className={ui.featuredCategoryIcon}>
                    <CategoryIcon className={ui.featuredCategoryIconSvg} />
                  </div>
                  
                  <div className={ui.featuredCategoryContent}>
                    <h3 className={ui.featuredCategoryName}>{category.name}</h3>
                    <p className={ui.featuredCategoryCount}>
                      {productCount} {productCount === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>

                  <div className={ui.featuredCategoryArrow}>
                    <ArrowRight className={ui.featuredCategoryArrowIcon} />
                  </div>

                  <div className={ui.featuredCategoryGlow} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

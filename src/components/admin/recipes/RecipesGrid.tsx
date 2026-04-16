"use client";

import RecipeCard from "./RecipeCard";
import { Recipe } from "@/services/recipeService";
import { Product } from "@/services/productService";
import { InventoryItem } from "@/services/inventoryService";

import styles from "@/styles/recipes/RecipesGrid.module.css";

interface RecipesGridProps {
  recipes: Recipe[];
  products: Product[];
  inventory: InventoryItem[];
  loading: boolean;
  onEdit: (recipe: Recipe) => void;
  refresh: () => void;
}

/* =========================
   SKELETON CARD
========================= */
function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage}></div>

      <div className={styles.skeletonLine}></div>
      <div className={styles.skeletonLineShort}></div>

      <div className={styles.skeletonBlock}></div>
      <div className={styles.skeletonBlock}></div>
    </div>
  );
}

/* =========================
   GRID
========================= */
export default function RecipesGrid({
  recipes,
  products,
  inventory,
  loading,
  onEdit,
  refresh,
}: RecipesGridProps) {
  /* =========================
     LOADING STATE (SKELETON)
  ========================= */
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  /* =========================
     SAFE VALIDATION
  ========================= */
  if (!Array.isArray(recipes)) {
    return null;
  }

  /* =========================
     EMPTY STATE
  ========================= */
  if (recipes.length === 0) {
    return (
      <div className={styles.stateContainer}>
        <p className={styles.empty}>
          No se encontraron recetas.
        </p>
      </div>
    );
  }

  /* =========================
     GRID RENDER
  ========================= */
  return (
    <div className={styles.grid}>
      {recipes.map((recipe) => {
        if (!recipe?._id) return null;

        return (
          <RecipeCard
            key={recipe._id}
            recipe={recipe}
            products={products}
            inventory={inventory}
            onEdit={onEdit}
            refresh={refresh}
          />
        );
      })}
    </div>
  );
}
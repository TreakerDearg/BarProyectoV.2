/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo } from "react";
import {
  Pencil,
  Trash2,
  ScrollText,
  Martini,
  Flame,
  Beaker,
  GlassWater,
} from "lucide-react";

import { deleteRecipe, Recipe } from "@/services/recipeService";
import { Product } from "@/services/productService";
import { InventoryItem } from "@/services/inventoryService";

import styles from "@/styles/recipes/RecipeCardV2.module.css";

/* =========================
   SAFE HELPERS
========================= */
const getId = (v: any) =>
  typeof v === "string" ? v : v?._id;

export default function RecipeCard({
  recipe,
  products,
  inventory,
  onEdit,
  refresh,
}: {
  recipe: Recipe;
  products: Product[];
  inventory: InventoryItem[];
  onEdit: (r: Recipe) => void;
  refresh: () => void;
}) {
  /* =========================
     PRODUCT RESOLVE
  ========================= */
  const product = useMemo(() => {
    const id = getId(recipe.productId);
    return products.find((p) => p._id === id);
  }, [products, recipe.productId]);

  /* =========================
     INGREDIENTS
  ========================= */
  const ingredients = useMemo(() => {
    return recipe.ingredients?.map((ing) => {
      const id = getId(ing.ingredientId);
      const item = inventory.find((i) => i._id === id);

      return {
        name: item?.name ?? "Unknown",
        unit: item?.unit ?? "",
        quantity: ing.quantity,
      };
    }) || [];
  }, [recipe.ingredients, inventory]);

  /* =========================
     METHOD ENGINE
  ========================= */
  const method = useMemo(() => {
    const cat = product?.category?.toLowerCase() || "";

    const map: Record<string, string> = {
      cocktail: "Shake with ice and fine strain.",
      shot: "Serve chilled in shot glass.",
      highball: "Build over ice and top with mixer.",
      mocktail: "Stir gently with ice.",
      frozen: "Blend until smooth texture.",
      martini: "Stir with ice and fine strain.",
    };

    return map[cat] || recipe.method || "Standard preparation technique.";
  }, [product, recipe.method]);

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async () => {
    if (!confirm("Delete this recipe?")) return;
    await deleteRecipe(recipe._id);
    refresh();
  };

  return (
    <div className={styles.card}>
      {/* ================= HEADER IMAGE ================= */}
      <div className={styles.hero}>
        <img
          src={product?.image || "/cocktail-placeholder.png"}
          alt={product?.name || "cocktail"}
        />

        <div className={styles.badge}>
          <Martini size={14} />
          <span>{product?.category || "mix"}</span>
        </div>

        <div className={styles.glow} />
      </div>

      {/* ================= TITLE ================= */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h3>{product?.name || "Unnamed cocktail"}</h3>

          <div className={styles.meta}>
            <GlassWater size={14} />
            <span>ID {recipe._id?.slice?.(-6)}</span>
          </div>
        </div>
      </div>

      {/* ================= INGREDIENTS ================= */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Beaker size={14} />
          Ingredients
        </div>

        <div className={styles.ingredients}>
          {ingredients.map((i, idx) => (
            <div key={idx} className={styles.row}>
              <span className={styles.qty}>
                {i.quantity} {i.unit}
              </span>
              <span className={styles.name}>{i.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= METHOD ================= */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Flame size={14} />
          Method
        </div>

        <p className={styles.method}>{method}</p>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className={styles.actions}>
        <button className={styles.protocol}>
          <ScrollText size={16} />
          Protocol
        </button>

        <div className={styles.iconGroup}>
          <button onClick={() => onEdit(recipe)}>
            <Pencil size={16} />
          </button>

          <button onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
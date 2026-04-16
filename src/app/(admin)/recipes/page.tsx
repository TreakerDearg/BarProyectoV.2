"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

import AdminLayout from "@/components/layout/AdminLayout";
import RecipesHeader from "@/components/admin/recipes/RecipesHeader";
import RecipesFilters from "@/components/admin/recipes/RecipesFilters";
import RecipesGrid from "@/components/admin/recipes/RecipesGrid";
import RecipesPagination from "@/components/admin/recipes/RecipesPagination";
import RecipeModal from "@/components/admin/recipes/RecipeModal";

import { getRecipes } from "@/services/recipeService";
import { getInventory, InventoryItem } from "@/services/inventoryService";
import { getProducts, Product } from "@/services/productService";

import styles from "@/styles/recipes/RecipesPage.module.css";

/* ================================
   TYPES
================================ */
export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
}

export interface Recipe {
  _id: string;
  productId: string | { _id: string };
  ingredients: RecipeIngredient[];
  method?: string;
  image?: string;
}

/* ================================
   NORMALIZER
================================ */
const normalizeText = (text: string = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/* ================================
   HELPERS SAFE ID
================================ */
const getId = (val: any) =>
  typeof val === "string" ? val : val?._id;

/* ================================
   PAGE
================================ */
export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] =
    useState<Recipe | null>(null);

  const itemsPerPage = 6;

  /* ================================
     LOAD DATA (FIXED)
  ================================= */
  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [recipesData, productsData, inventoryData] =
        await Promise.all([
          getRecipes(),
          getProducts(),
          getInventory(),
        ]);

      setRecipes(
        Array.isArray(recipesData)
          ? recipesData.map((r: any) => ({
              ...r,
              productId: getId(r.productId),
            }))
          : []
      );

      setProducts(Array.isArray(productsData) ? productsData : []);
      setInventory(Array.isArray(inventoryData) ? inventoryData : []);
    } catch (err) {
      console.error("Error loading recipes:", err);
      setRecipes([]);
      setProducts([]);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ================================
     CATEGORIES
  ================================= */
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ).sort((a, b) => a!.localeCompare(b!));

    return ["all", ...unique];
  }, [products]);

  /* ================================
     FILTER (FIXED SAFE)
  ================================= */
  const filteredRecipes = useMemo(() => {
    const q = normalizeText(search);

    return recipes.filter((recipe) => {
      const product = products.find(
        (p) => p._id === getId(recipe.productId)
      );

      const name = product?.name || "";
      const cat = product?.category || "";

      const matchSearch =
        normalizeText(name).includes(q);

      const matchCategory =
        category === "all" ||
        normalizeText(cat) === normalizeText(category);

      return matchSearch && matchCategory;
    });
  }, [recipes, products, search, category]);

  /* ================================
     PAGINATION
  ================================= */
  const totalPages = Math.ceil(
    filteredRecipes.length / itemsPerPage
  );

  const paginatedRecipes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecipes.slice(start, start + itemsPerPage);
  }, [filteredRecipes, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  /* ================================
     METRICS
  ================================= */
  const metrics = useMemo(() => {
    return {
      total: recipes.length,
      cocktails: products.length,
      ingredients: inventory.length,
      categories: categories.length - 1,
    };
  }, [recipes, products, inventory, categories]);

  /* ================================
     RENDER
  ================================= */
  return (
    <AdminLayout>
      <div className={styles.container}>
        <RecipesHeader
          metrics={metrics}
          onAdd={() => {
            setEditingRecipe(null);
            setIsModalOpen(true);
          }}
        />

        <RecipesFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          categories={categories}
        />

        <RecipesGrid
          recipes={paginatedRecipes}
          products={products}
          inventory={inventory}
          loading={loading}
          onEdit={(r: Recipe) => {
            setEditingRecipe(r);
            setIsModalOpen(true);
          }}
          refresh={load}
        />

        {!loading && totalPages > 1 && (
          <RecipesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        <RecipeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={load}
          products={products}
          inventory={inventory}
          editingRecipe={editingRecipe}
        />
      </div>
    </AdminLayout>
  );
}
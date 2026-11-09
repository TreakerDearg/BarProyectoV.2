"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  createRecipeVariant,
} from "../services/recipeService";
import type { Recipe } from "../types/recipe";
import RecipeHeader from "../components/RecipeHeader";
import RecipeGrid from "../components/RecipeGrid";
import RecipeDetailDrawer from "../components/RecipeDetailDrawer";
import RecipeBuilderModal from "../components/RecipeBuilderModal";
import RecipeVariantModal from "../components/RecipeVariantModal";
import RecipeExecutiveDashboard from "../components/RecipeExecutiveDashboard";

export default function RecipeMasterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Primary state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Determine active view / station from URL or state
  const activeStation = useMemo<"all" | "drink" | "food" | "dashboard">(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "dashboard") return "dashboard";

    const typeParam = searchParams.get("type");
    if (typeParam === "drink" || typeParam === "food") return typeParam;

    return "all";
  }, [searchParams]);

  // Drawer & Modal States
  const [selectedRecipeForDrawer, setSelectedRecipeForDrawer] = useState<Recipe | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [builderStation, setBuilderStation] = useState<"drink" | "food">("drink");

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [parentRecipeForVariant, setParentRecipeForVariant] = useState<Recipe | null>(null);

  // Fetch all recipes
  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecipes();
      setRecipes(data);
    } catch (err: any) {
      console.error("Failed to load recipes:", err);
      setError("No se pudieron cargar las fichas técnicas. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Handle station change
  const handleStationChange = (station: "all" | "drink" | "food" | "dashboard") => {
    if (station === "dashboard") {
      setSearchParams({ view: "dashboard" });
    } else if (station === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ type: station });
    }
  };

  // Categories list extracted from recipes
  const categories = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set).sort();
  }, [recipes]);

  // Symmetrical KPIs for Header
  const totalCount = recipes.length;
  const drinksCount = recipes.filter((r) => r.type === "drink").length;
  const foodCount = recipes.filter((r) => r.type === "food").length;
  const avgMargin = useMemo(() => {
    let totalRev = 0;
    let totalCost = 0;
    recipes.forEach((r) => {
      const price = typeof r.product === "object" && r.product?.price ? r.product.price : 0;
      const cost = r.totalCost || 0;
      if (price > 0) {
        totalRev += price;
        totalCost += cost;
      }
    });
    return totalRev > 0 ? Math.round(((totalRev - totalCost) / totalRev) * 100) : 72;
  }, [recipes]);

  // Drawer handlers
  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipeForDrawer(recipe);
    setIsDrawerOpen(true);
  };

  // Builder handlers
  const handleCreateNew = (type: "drink" | "food") => {
    setRecipeToEdit(null);
    setBuilderStation(type);
    setIsBuilderOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setBuilderStation(recipe.type || "drink");
    setIsDrawerOpen(false);
    setIsBuilderOpen(true);
  };

  const handleSaveRecipe = async (recipeData: Recipe) => {
    if (recipeData._id) {
      await updateRecipe(recipeData._id, recipeData);
    } else {
      await createRecipe(recipeData);
    }
    await loadRecipes();
  };

  // Variant Modal handlers
  const handleOpenAddVariant = (recipe: Recipe) => {
    setParentRecipeForVariant(recipe);
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = async (data: {
    parentRecipeId: string;
    variantName: string;
    variantType: "size" | "spirit" | "dietary";
    productId?: string;
    newPrice?: number;
    additionalCost?: number;
  }) => {
    if (!parentRecipeForVariant) return;

    if (data.productId) {
      await createRecipeVariant(data.parentRecipeId, {
        productId: data.productId,
        variantName: data.variantName,
      });
    } else {
      // Create new clone variant
      const clonedRecipe: Recipe = {
        ...parentRecipeForVariant,
        _id: undefined,
        variantName: data.variantName,
        parentId: data.parentRecipeId,
        isPrimary: false,
        totalCost: Math.round(
          (parentRecipeForVariant.totalCost || 0) + (data.additionalCost || 0)
        ),
      };
      await createRecipe(clonedRecipe);
    }
    await loadRecipes();
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-6 space-y-6">
      {/* Unified Header */}
      <RecipeHeader
        activeStation={activeStation}
        onStationChange={handleStationChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        totalCount={totalCount}
        drinksCount={drinksCount}
        foodCount={foodCount}
        avgMargin={avgMargin}
        onCreateDrink={() => handleCreateNew("drink")}
        onCreateFood={() => handleCreateNew("food")}
      />

      {/* Main Content: Executive Dashboard OR Recipe Grid */}
      {activeStation === "dashboard" ? (
        <RecipeExecutiveDashboard
          recipes={recipes}
          onCreateNew={handleCreateNew}
          onSelectRecipe={handleViewRecipe}
        />
      ) : (
        <RecipeGrid
          recipes={recipes}
          activeStation={activeStation}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          loading={loading}
          onViewRecipe={handleViewRecipe}
          onEditRecipe={handleEditRecipe}
          onAddVariant={handleOpenAddVariant}
          onCreateNew={handleCreateNew}
        />
      )}

      {/* Slide-over Detail Drawer */}
      <RecipeDetailDrawer
        recipe={selectedRecipeForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleEditRecipe}
        onAddVariant={handleOpenAddVariant}
        onSelectVariant={(variant) => setSelectedRecipeForDrawer(variant)}
        allVariants={recipes}
      />

      {/* 3-Step Clean Recipe Builder Modal */}
      <RecipeBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSave={handleSaveRecipe}
        recipeToEdit={recipeToEdit}
        defaultStation={builderStation}
      />

      {/* Rapid Variant Creator Modal */}
      <RecipeVariantModal
        parentRecipe={parentRecipeForVariant}
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        onSaveVariant={handleSaveVariant}
      />
    </div>
  );
}


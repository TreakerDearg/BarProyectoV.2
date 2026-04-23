import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCcw, Search } from "lucide-react";

import RecipeCard from "../components/RecipeCard";
import RecipeForm from "../components/RecipeForm";
import RecipeDetailModal from "../components/RecipeDetailModal";

import {
  getRecipes,
  createRecipe,
  deleteRecipe,
} from "../services/recipeService";

import type { Recipe } from "../types/recipe";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [openForm, setOpenForm] = useState(false);


  const [selectedRecipe, setSelectedRecipe] =
    useState<Recipe | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "drink" | "food">("all");

  /* =========================
     FETCH
  ========================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getRecipes();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar recetas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =========================
     CREATE
  ========================= */
  const handleSave = async (data: Recipe) => {
    try {
      await createRecipe(data);
      setOpenForm(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Error al crear receta");
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta receta?")) return;

    try {
      await deleteRecipe(id);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar receta");
    }
  };

  /* =========================
     FILTER
  ========================= */
  const filteredRecipes = recipes.filter((r) => {
    const matchSearch =
      r.product?.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase());

    const matchType =
      filter === "all" ? true : r.type === filter;

    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Recetas</h1>
          <p className="text-gray-500 text-sm">
            Gestión de recetas de bar y cocina
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
          >
            <RefreshCcw size={18} />
          </button>

          <button
            onClick={() => setOpenForm(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <Plus size={18} />
            Nueva receta
          </button>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-3 text-gray-500"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar receta..."
            className="w-full pl-9 p-2 bg-gray-900 border border-gray-800 rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "drink", "food"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-lg text-sm border transition ${
                filter === t
                  ? "bg-amber-500 text-black border-amber-500"
                  : "bg-gray-900 border-gray-800 text-gray-400"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-900 animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}

      {/* GRID */}
      {!loading && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((r) => (
            <RecipeCard
              key={r._id}
              recipe={r}
              onDelete={handleDelete}

              // 👉 OPEN MODAL
              onOpen={(recipe) => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredRecipes.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No hay recetas que coincidan con la búsqueda
        </div>
      )}

      {/* FORM MODAL */}
      {openForm && (
        <RecipeForm
          onSave={handleSave}
          onClose={() => setOpenForm(false)}
        />
      )}

      {/* DETAIL MODAL */}
      <RecipeDetailModal
        open={!!selectedRecipe}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}
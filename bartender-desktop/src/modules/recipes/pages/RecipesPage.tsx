import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";

import RecipeCard from "../components/RecipeCard";
import RecipeForm from "../components/RecipeForm";

import {
  getRecipes,
  createRecipe,
  deleteRecipe,
} from "../services/recipeService";

import type { Recipe } from "../types/recipe";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     FETCH CENTRALIZADO
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
     CREATE RECIPE
  ========================= */
  const handleSave = async (data: Recipe) => {
    try {
      await createRecipe(data);
      setOpen(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Error al crear receta");
    }
  };

  /* =========================
     DELETE WITH CONFIRM
  ========================= */
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("¿Eliminar esta receta?");
    if (!confirmDelete) return;

    try {
      await deleteRecipe(id);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar receta");
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Recetas
        </h1>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
            title="Actualizar"
          >
            <RefreshCcw size={18} />
          </button>

          <button
            onClick={() => setOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Nueva receta
          </button>
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
        <p className="text-gray-400">
          Cargando recetas...
        </p>
      )}

      {/* EMPTY STATE */}
      {!loading && recipes.length === 0 && !error && (
        <p className="text-gray-500">
          No hay recetas registradas todavía.
        </p>
      )}

      {/* GRID */}
      <div className="grid grid-cols-3 gap-4">
        {recipes.map((r) => (
          <RecipeCard
            key={r._id}
            recipe={r}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <RecipeForm
          onSave={handleSave}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
import { Trash2, Martini, Utensils } from "lucide-react";
import type { Recipe } from "../types/recipe";

interface Props {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

export default function RecipeCard({ recipe, onDelete }: Props) {
  const isDrink = recipe.type === "drink";

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-amber-500 transition p-4 rounded-xl space-y-3">

      {/* HEADER */}
      <div className="flex justify-between items-start">

        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            {isDrink ? (
              <Martini size={16} className="text-amber-400" />
            ) : (
              <Utensils size={16} className="text-emerald-400" />
            )}

            {recipe.product?.name || "Sin producto"}
          </h3>

          <p className="text-xs text-gray-500">
            {recipe.category || "Sin categoría"}
          </p>
        </div>

        {/* TYPE BADGE */}
        <span
          className={`text-xs px-2 py-1 rounded ${
            isDrink
              ? "bg-amber-500/20 text-amber-400"
              : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          {recipe.type?.toUpperCase()}
        </span>
      </div>

      {/* INGREDIENT COUNT */}
      <p className="text-xs text-gray-400">
        Ingredientes: {recipe.ingredients?.length || 0}
      </p>

      {/* INGREDIENT LIST (COMPACT) */}
      <div className="text-sm space-y-1 max-h-24 overflow-auto">
        {recipe.ingredients?.slice(0, 4).map((i, idx) => (
          <div key={idx} className="flex justify-between text-gray-300">
            <span>
              {i.inventoryItem?.name || "Ingrediente"}
            </span>

            <span className="text-gray-500">
              {i.quantity}
            </span>
          </div>
        ))}

        {recipe.ingredients?.length > 4 && (
          <p className="text-xs text-gray-500">
            +{recipe.ingredients.length - 4} más...
          </p>
        )}
      </div>

      {/* COST (SI EXISTE) */}
      {"totalCost" in recipe && (
        <p className="text-amber-400 font-semibold text-sm">
          Costo: ${(recipe as any).totalCost?.toFixed?.(2) || 0}
        </p>
      )}

      {/* ACTIONS */}
      <button
        onClick={() => recipe._id && onDelete(recipe._id)}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition"
      >
        <Trash2 size={16} />
        Eliminar
      </button>
    </div>
  );
}
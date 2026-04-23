import { X, Martini, Utensils, Flame } from "lucide-react";
import type { Recipe } from "../types/recipe";

interface Props {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
}

export default function RecipeDetailModal({
  recipe,
  open,
  onClose,
}: Props) {
  if (!open || !recipe) return null;

  const isDrink = recipe.type === "drink";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="w-[700px] max-h-[90vh] overflow-auto bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">

        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {isDrink ? (
                <Martini className="text-amber-400" size={18} />
              ) : (
                <Utensils className="text-emerald-400" size={18} />
              )}

              {recipe.product?.name || "Sin producto"}
            </h2>

            <p className="text-xs text-gray-500 capitalize">
              {recipe.category}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X />
          </button>
        </div>

        {/* STATUS */}
        <div className="flex gap-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              isDrink
                ? "bg-amber-500/20 text-amber-400"
                : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            {recipe.type.toUpperCase()}
          </span>

          {recipe.isActive === false && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <Flame size={12} />
              Inactiva
            </span>
          )}
        </div>

        {/* INGREDIENTS */}
        <div>
          <h3 className="font-semibold mb-2">Ingredientes</h3>

          <div className="space-y-2">
            {recipe.ingredients.map((i, idx) => (
              <div
                key={idx}
                className="flex justify-between bg-gray-800 p-2 rounded"
              >
                <span>{i.inventoryItem?.name}</span>

                <span className="text-gray-400">
                  {i.quantity} {i.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* METHOD */}
        {recipe.method && (
          <div>
            <h3 className="font-semibold mb-2">Método</h3>
            <p className="text-gray-400 text-sm">{recipe.method}</p>
          </div>
        )}

        {/* STEPS */}
        {recipe.steps?.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Pasos</h3>

            <div className="space-y-2">
              {recipe.steps.map((s, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 text-sm text-gray-300"
                >
                  <span className="text-amber-400">
                    {s.stepNumber}.
                  </span>
                  <span>{s.instruction}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COST */}
        {typeof recipe.totalCost === "number" && (
          <div className="pt-2 border-t border-gray-800">
            <span className="text-amber-400 font-bold">
              Costo: ${recipe.totalCost.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
import { Trash2, Eye, Martini, Utensils, Flame } from "lucide-react";
import type { Recipe } from "../types/recipe";

interface Props {
  recipe: Recipe;
  onDelete: (id: string) => void;
  onOpen?: (recipe: Recipe) => void;
}

export default function RecipeCard({
  recipe,
  onDelete,
  onOpen,
}: Props) {
  const isDrink = recipe.type === "drink";

  /* =========================
     SAFE HANDLER
  ========================= */
  const handleOpen = () => {
    if (!onOpen) return; // evita crash
    onOpen(recipe);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!recipe._id) return;
    onDelete(recipe._id);
  };

  const handleOpenButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onOpen) return;
    onOpen(recipe);
  };

  return (
    <div
      onClick={handleOpen}
      className="relative cursor-pointer bg-gray-900 border border-gray-800 hover:border-amber-500 transition-all p-4 rounded-xl space-y-3 group"
    >
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            {isDrink ? (
              <Martini size={16} className="text-amber-400" />
            ) : (
              <Utensils size={16} className="text-emerald-400" />
            )}

            {recipe.product?.name || "Sin producto"}
          </h3>

          <p className="text-xs text-gray-500 capitalize">
            {recipe.category || "general"}
          </p>
        </div>

        {/* TYPE + STATUS */}
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-xs px-2 py-1 rounded font-semibold ${
              isDrink
                ? "bg-amber-500/20 text-amber-400"
                : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            {recipe.type?.toUpperCase()}
          </span>

          {recipe.isActive === false && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <Flame size={12} />
              Inactiva
            </span>
          )}
        </div>
      </div>

      {/* INGREDIENTS */}
      <div className="space-y-1">
        <p className="text-xs text-gray-400">
          Ingredientes: {recipe.ingredients?.length || 0}
        </p>

        <div className="text-sm space-y-1 max-h-24 overflow-hidden">
          {recipe.ingredients?.slice(0, 4).map((i, idx) => (
            <div
              key={idx}
              className="flex justify-between text-gray-300"
            >
              <span className="truncate max-w-[70%]">
                {i.inventoryItem?.name || "Ingrediente"}
              </span>

              <span className="text-gray-500 whitespace-nowrap">
                {i.quantity} {i.unit}
              </span>
            </div>
          ))}

          {recipe.ingredients?.length > 4 && (
            <p className="text-xs text-gray-500">
              +{recipe.ingredients.length - 4} más...
            </p>
          )}
        </div>
      </div>

      {/* METHOD */}
      {recipe.method && (
        <p className="text-xs text-gray-500 line-clamp-2">
          {recipe.method}
        </p>
      )}

      {/* COST */}
      {typeof recipe.totalCost === "number" && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-amber-400 font-semibold text-sm">
            ${recipe.totalCost.toFixed(2)}
          </span>

          <span className="text-xs text-gray-500">
            costo estimado
          </span>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={handleDelete}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg"
        >
          <Trash2 size={14} />
          Eliminar
        </button>

        <button
          onClick={handleOpenButton}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 p-2 rounded-lg"
        >
          <Eye size={14} />
          Ver
        </button>
      </div>
    </div>
  );
}
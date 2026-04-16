import { Trash2 } from "lucide-react";
import type { Recipe } from "../types/recipe";

interface Props {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

export default function RecipeCard({ recipe, onDelete }: Props) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <h3 className="font-bold">
        {recipe.product?.name || "Sin producto"}
      </h3>

      <ul className="text-sm mt-2">
        {recipe.ingredients.map((i, idx) => (
          <li key={idx}>
            {i.inventoryItem?.name || "Ingrediente"} - {i.quantity}
          </li>
        ))}
      </ul>

      <button
        onClick={() => recipe._id && onDelete(recipe._id)}
        className="mt-3 bg-red-500 p-2 rounded w-full"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
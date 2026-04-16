import { useInventoryStore } from "@/store/useInventoryStore";
import { useRecipeStore } from "@/store/useRecipeStore";

export function getMissingIngredients(drinkName: string) {
  const inventory = useInventoryStore.getState();
  const recipes = useRecipeStore.getState().recipes;

  const recipe = recipes.find((r) => r.name === drinkName);

  if (!recipe) return [];

  return recipe.ingredients
    .map((ing) => {
      const product = inventory.products.find(
        (p) => p.id === ing.productId
      );

      if (!product) return null;

      const missing = ing.quantity - product.stock;

      if (missing > 0) {
        return {
          name: product.name,
          missing,
        };
      }

      return null;
    })
    .filter(Boolean);
}
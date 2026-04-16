import { useInventoryStore } from "@/store/useInventoryStore";
import { useRecipeStore } from "@/store/useRecipeStore";

export function canMakeDrink(drinkName: string): boolean {
  const inventory = useInventoryStore.getState();
  const recipes = useRecipeStore.getState().recipes;

  const recipe = recipes.find((r) => r.name === drinkName);

  if (!recipe) return true; // si no tiene receta, permitir

  return recipe.ingredients.every((ing) => {
    const product = inventory.products.find(
      (p) => p.id === ing.productId
    );

    if (!product) return false;

    return product.stock >= ing.quantity;
  });
}
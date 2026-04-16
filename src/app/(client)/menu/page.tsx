"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/components/layout/ClientLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/animations/FadeIn";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

import { getProducts } from "@/services/productService";
import { getRecipes } from "@/services/recipeService";
import { getInventory } from "@/services/inventoryService";

export default function MenuPage() {
  const add = useCartStore((s) => s.add);
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);

  //  cargar todo
  const load = async () => {
    const [p, r, i] = await Promise.all([
      getProducts(),
      getRecipes(),
      getInventory(),
    ]);

    setProducts(p);
    setRecipes(r);
    setInventory(i);
  };

  useEffect(() => {
    load();
  }, []);

  // validar stock REAL
  const canMakeDrink = (productId: string) => {
    const recipe = recipes.find(
      (r: any) => r.productId === productId
    );

    if (!recipe) return false;

    return recipe.ingredients.every((ing: any) => {
      const item = inventory.find(
        (i: any) => i._id === ing.ingredientId
      );

      if (!item) return false;

      return item.stock >= ing.quantity;
    });
  };

  return (
    <ClientLayout>
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl neon-text">MENU</h1>
          <p className="text-sm text-zinc-400">
            Seleccioná tu bebida
          </p>
        </div>

        <button
          onClick={() => router.push("/roulette")}
          className="
            px-4 py-2
            rounded-lg
            bg-[var(--neon-pink)]
            text-black
            font-medium
            transition
            hover:shadow-[0_0_20px_#f472b6]
          "
        >
          🎡 Random Drink
        </button>
      </div>

      {/* GRID */}
      <div className="grid-auto">
        {products.map((drink: any) => {
          const available = canMakeDrink(drink._id);

          return (
            <FadeIn key={drink._id}>
              <Card>
                <div className="flex flex-col gap-2">

                  <h2
                    className={`text-lg ${
                      available ? "neon-cyan" : "text-zinc-500"
                    }`}
                  >
                    {drink.name}
                  </h2>

                  <p className="text-sm text-zinc-400">
                    Categoría: {drink.category || "N/A"}
                  </p>

                  <p className="text-base font-semibold">
                    ${drink.price}
                  </p>

                  {!available && (
                    <p className="text-xs text-red-400">
                      Sin stock
                    </p>
                  )}

                  <Button
                    disabled={!available}
                    onClick={() =>
                      add({
                        id: drink._id,
                        name: drink.name,
                        price: drink.price,
                        quantity: 1,
                      })
                    }
                  >
                    {available ? "Agregar" : "No disponible"}
                  </Button>

                </div>
              </Card>
            </FadeIn>
          );
        })}
      </div>
    </ClientLayout>
  );
}
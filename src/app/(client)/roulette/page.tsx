"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/components/layout/ClientLayout";
import { spinRoulettePro } from "@/utils/spinRoulette";

import { getRoulette } from "@/services/rouletteService";
import { getInventory } from "@/services/inventoryService";
import { getRecipes } from "@/services/recipeService";

export default function RoulettePage() {
  const [items, setItems] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);

  const [result, setResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(true);

  // cargar datos
  const load = async () => {
    try {
      const [r, i, rec] = await Promise.all([
        getRoulette(),
        getInventory(),
        getRecipes(),
      ]);

      setItems(r);
      setInventory(i);
      setRecipes(rec);
    } catch (err) {
      console.error("Error cargando ruleta:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // VALIDAR STOCK 
  const canMakeDrink = (productId: string) => {
    const recipe = recipes.find(
      (r: any) =>
        r.productId?._id?.toString() === productId
    );

    if (!recipe) return false;

    return recipe.ingredients.every((ing: any) => {
      const item = inventory.find(
        (i: any) =>
          i._id?.toString() ===
          ing.ingredientId?.toString()
      );

      if (!item) return false;

      return item.stock >= ing.quantity;
    });
  };

  // SPIN
  const spin = () => {
    setSpinning(true);
    setResult(null);

    setTimeout(() => {
      const selected = spinRoulettePro(
        items,
        canMakeDrink
      );

      if (!selected) {
        alert("No hay bebidas disponibles");
        setSpinning(false);
        return;
      }

      setResult(selected);
      setSpinning(false);
    }, 1200);
  };

  // LOADING
  if (loading) {
    return (
      <ClientLayout>
        <p className="text-zinc-400">
          Cargando ruleta...
        </p>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <h1 className="neon-text text-2xl mb-6">
        RULETA
      </h1>

      <button
        onClick={spin}
        disabled={spinning}
        className={`
          px-6 py-3 rounded-lg transition
          ${
            spinning
              ? "bg-zinc-700"
              : "bg-[var(--neon-purple)] hover:shadow-[var(--glow-purple)]"
          }
        `}
      >
        {spinning ? "Girando..." : "Girar"}
      </button>

      {result && (
        <div className="mt-6 text-center">
          <p className="text-zinc-400 text-sm">
            Resultado:
          </p>

          <p className="neon-cyan text-2xl">
            {result.name}
          </p>
        </div>
      )}
    </ClientLayout>
  );
}
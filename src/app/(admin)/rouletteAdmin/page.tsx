"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { getRoulette, saveRoulette } from "@/services/rouletteService";
import { getProducts } from "@/services/productService";

export default function RouletteAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // cargar todo
  const load = async () => {
    const [r, p] = await Promise.all([
      getRoulette(),
      getProducts(),
    ]);

    setItems(r);
    setProducts(p);
  };

  useEffect(() => {
    load();
  }, []);

  //  inicializar
  const initialize = () => {
    const base = products.map((p) => ({
      productId: p._id,
      weight: 1,
      enabled: true,
    }));

    setItems(base);
  };

  const updateItem = (id: string, changes: any) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === id ? { ...i, ...changes } : i
      )
    );
  };

  const handleSave = async () => {
    await saveRoulette(items);
    alert("Guardado ");
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl neon-text mb-6">
        🎡 RULETA ADMIN
      </h1>

      <div className="flex gap-3 mb-6">
        <button
          onClick={initialize}
          className="px-4 py-2 bg-[var(--neon-purple)] rounded-lg"
        >
          Inicializar
        </button>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[var(--neon-cyan)] rounded-lg"
        >
          Guardar
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const product = products.find(
            (p) => p._id === item.productId
          );

          if (!product) return null;

          return (
            <div
              key={item.productId}
              className="card flex items-center justify-between gap-4"
            >
              <p className="w-40 neon-cyan">
                {product.name}
              </p>

              <input
                type="number"
                value={item.weight}
                onChange={(e) =>
                  updateItem(item.productId, {
                    weight: Number(e.target.value),
                  })
                }
              />

              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) =>
                  updateItem(item.productId, {
                    enabled: e.target.checked,
                  })
                }
              />
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
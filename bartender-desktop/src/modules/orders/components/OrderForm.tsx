"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Minus, Loader2, X } from "lucide-react";

import { getProducts } from "../../../modules/products/services/productService";
import { createOrder } from "../services/orderService";
import type { Product } from "../../../types/product";

export default function OrderForm({
  tableId,
  tableNumber,
  sessionId,
  onClose,
  onSuccess,
}: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "drink" | "food">("all");
  const [loading, setLoading] = useState(false);

  /* ========================= */
  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  /* ========================= */
  const filtered = useMemo(() => {
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
      .filter((p) =>
        category === "all" ? true : p.type === category
      );
  }, [products, search, category]);

  /* ========================= */
  const addProduct = (p: Product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.product === p._id);

      if (exists) {
        return prev.map((i) =>
          i.product === p._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          product: p._id,
          name: p.name,
          quantity: 1,
          price: p.price,
        },
      ];
    });
  };

  const updateQty = (id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product !== id)
        : prev.map((i) =>
            i.product === id ? { ...i, quantity: qty } : i
          )
    );
  };

  const total = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  /* ========================= */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!items.length) return;

    setLoading(true);

    await createOrder({
      table: tableId,
      sessionId,
      items: items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
      })),
    });

    setLoading(false);
    onSuccess?.();
    onClose();
  };

  /* ========================= */
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

      <form
        onSubmit={handleSubmit}
        className="w-[1000px] h-[650px] bg-gray-950 border border-gray-800 rounded-2xl flex overflow-hidden"
      >

        {/* LEFT */}
        <div className="w-2/3 p-4 flex flex-col gap-4">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Mesa {tableNumber}</h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* SEARCH */}
          <input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 p-2 rounded"
          />

          {/* TABS */}
          <div className="flex gap-2">
            {["all", "drink", "food"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c as any)}
                className={`px-3 py-1 rounded ${
                  category === c
                    ? "bg-purple-500 text-black"
                    : "bg-gray-800"
                }`}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>

          {/* GRID */}
          <div className="grid grid-cols-3 gap-2 overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => addProduct(p)}
                className="bg-gray-800 hover:bg-purple-600 p-3 rounded text-left transition"
              >
                <p className="font-bold text-sm">{p.name}</p>
                <p className="text-xs text-gray-400">${p.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-1/3 p-4 flex flex-col justify-between border-l border-gray-800">

          <div className="space-y-2 overflow-y-auto flex-1">
            {items.map((i) => (
              <div key={i.product} className="bg-gray-900 p-2 rounded">

                <div className="flex justify-between">
                  <span>{i.name}</span>
                  <span>${i.price * i.quantity}</span>
                </div>

                <div className="flex gap-2 items-center mt-1">
                  <button type="button" onClick={() => updateQty(i.product, i.quantity - 1)}>
                    <Minus size={14} />
                  </button>

                  <span>{i.quantity}</span>

                  <button type="button" onClick={() => updateQty(i.product, i.quantity + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="text-lg font-bold mb-2">
              Total: ${total.toFixed(2)}
            </p>

            <button
              disabled={!items.length || loading}
              className="w-full bg-purple-500 py-2 rounded font-bold flex justify-center items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Crear Pedido
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
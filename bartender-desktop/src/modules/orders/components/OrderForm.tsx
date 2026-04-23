"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Minus, Loader2 } from "lucide-react";

import { getProducts } from "../../../modules/products/services/productService";
import { createOrder } from "../services/orderService";
import type { Product } from "../../../types/product";

interface Props {
  tableId: string;
  tableNumber: number;
  sessionId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type LocalItem = {
  product: string;
  name: string;
  quantity: number;
  price: number;
  type: "drink" | "food";
};

export default function OrderForm({
  tableId,
  tableNumber,
  sessionId,
  onClose,
  onSuccess,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<LocalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* =========================
     LOAD PRODUCTS
  ========================= */
  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  /* =========================
     FILTERED PRODUCTS
  ========================= */
  const filtered = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const drinks = filtered.filter((p) => p.type === "drink");
  const food = filtered.filter((p) => p.type === "food");

  /* =========================
     ADD PRODUCT
  ========================= */
  const addProduct = (product: Product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.product === product._id);

      if (exists) {
        return prev.map((i) =>
          i.product === product._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          product: product._id!,
          name: product.name,
          quantity: 1,
          price: product.price,
          type: product.type as "drink" | "food",
        },
      ];
    });
  };

  /* =========================
     UPDATE QTY
  ========================= */
  const updateQty = (id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product !== id)
        : prev.map((i) =>
            i.product === id ? { ...i, quantity: qty } : i
          )
    );
  };

  /* =========================
     TOTAL
  ========================= */
  const total = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  const canSubmit = items.length > 0 && !loading;

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);

      await createOrder({
        table: tableId,
        sessionId,
        items: items.map((i) => ({
          product: i.product,
          quantity: i.quantity,
        })),
      });

      setItems([]);
      onSuccess?.();
      onClose();

    } catch (err: any) {
      alert(err.message || "Error creando pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

      <form
        onSubmit={handleSubmit}
        className="w-[900px] h-[600px] bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl flex overflow-hidden"
      >

        {/* =========================
           LEFT: PRODUCTS
        ========================= */}
        <div className="w-2/3 p-4 flex flex-col gap-3 border-r border-gray-800">

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              Mesa {tableNumber}
            </h2>

            <button onClick={onClose} type="button" className="text-gray-400">
              ✕
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative">
            <Search size={16} className="absolute left-2 top-2.5 text-gray-400" />
            <input
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
            />
          </div>

          {/* DRINKS */}
          <div>
            <h3 className="text-sm text-amber-400 mb-1">Bebidas</h3>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {drinks.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => addProduct(p)}
                  className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg text-left"
                >
                  <div className="flex justify-between">
                    <span>{p.name}</span>
                    <span className="text-amber-400">${p.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* FOOD */}
          <div>
            <h3 className="text-sm text-green-400 mb-1">Comida</h3>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {food.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => addProduct(p)}
                  className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg text-left"
                >
                  <div className="flex justify-between">
                    <span>{p.name}</span>
                    <span className="text-green-400">${p.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =========================
           RIGHT: CART
        ========================= */}
        <div className="w-1/3 p-4 flex flex-col justify-between">

          <div className="space-y-2 overflow-y-auto">
            {items.length === 0 && (
              <p className="text-gray-500 text-sm">
                No hay productos agregados
              </p>
            )}

            {items.map((i) => (
              <div
                key={i.product}
                className="flex justify-between items-center bg-gray-900 p-2 rounded-lg"
              >
                <div>
                  <p className="text-sm">{i.name}</p>
                  <p className="text-xs text-gray-400">
                    ${i.price} x {i.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQty(i.product, i.quantity - 1)}
                    className="bg-gray-700 px-2 rounded"
                  >
                    <Minus size={14} />
                  </button>

                  <span>{i.quantity}</span>

                  <button
                    type="button"
                    onClick={() => updateQty(i.product, i.quantity + 1)}
                    className="bg-gray-700 px-2 rounded"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="space-y-3">
            <div className="text-lg font-bold text-amber-400">
              Total: ${total.toFixed(2)}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black rounded-lg font-semibold flex justify-center items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              {loading ? "Procesando..." : "Crear Pedido"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
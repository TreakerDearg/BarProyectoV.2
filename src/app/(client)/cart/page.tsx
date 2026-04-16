"use client";

import { useState } from "react";
import ClientLayout from "@/components/layout/ClientLayout";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, remove, clear } = useCartStore();
  const createOrder = useOrderStore((s) => s.createOrder);
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleOrder = () => {
    setError("");
    setLoading(true);

    try {
      const orderId = createOrder(cart);

      clear();
      router.push(`/status?order=${orderId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <h1 className="text-2xl neon-text mb-6">
        CARRITO
      </h1>

      {cart.length === 0 ? (
        <p className="text-zinc-400">Vacío</p>
      ) : (
        <>
          {/* LISTA */}
          <div className="flex flex-col gap-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="card flex justify-between items-center"
              >
                <div>
                  <p>{item.name}</p>
                  <p className="text-sm text-zinc-400">
                    x{item.quantity}
                  </p>
                </div>

                <button
                  onClick={() => remove(item.id)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-4 p-3 border border-red-500 text-red-400 text-sm rounded">
              {error}
            </div>
          )}

          {/* TOTAL + ACTION */}
          <div className="mt-6">
            <p className="text-lg mb-2">
              Total: ${total}
            </p>

            <button
              onClick={handleOrder}
              disabled={loading}
              className={`
                px-4 py-2 rounded transition
                ${
                  loading
                    ? "bg-zinc-700 cursor-not-allowed"
                    : "bg-[var(--neon-purple)] hover:shadow-[var(--glow-purple)]"
                }
              `}
            >
              {loading ? "Procesando..." : "Confirmar pedido"}
            </button>
          </div>
        </>
      )}
    </ClientLayout>
  );
}
"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/components/layout/ClientLayout";
import { getOrders } from "@/services/orderService";

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getOrders();

      // opcional: solo últimos 5
      setOrders(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const interval = setInterval(load, 5000); //  auto refresh
    return () => clearInterval(interval);
  }, []);

  const statusConfig: any = {
    pending: "text-yellow-400",
    preparing: "text-blue-400",
    ready: "text-green-400",
    delivered: "text-zinc-400",
  };

  return (
    <ClientLayout>
      <h1 className="text-2xl neon-text mb-6">
        MIS PEDIDOS
      </h1>

      {loading ? (
        <p className="text-zinc-400">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-zinc-400">
          No tenés pedidos
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <div key={o._id} className="card">

              <div className="flex justify-between">
                <p className="text-sm text-zinc-400">
                  ID: {o._id}
                </p>

                <p
                  className={`text-sm ${statusConfig[o.status]}`}
                >
                  {o.status}
                </p>
              </div>

              <p className="text-lg mt-2">
                Total: ${o.total}
              </p>

              {/* ITEMS */}
              <div className="text-sm mt-2 text-zinc-400">
                {o.items.map((i: any, idx: number) => (
                  <p key={idx}>
                    {i.productId?.name} x{i.quantity}
                  </p>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}
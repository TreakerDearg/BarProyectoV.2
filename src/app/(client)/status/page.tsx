"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ClientLayout from "@/components/layout/ClientLayout";
import { getOrderById } from "@/services/orderService";

export default function StatusPage() {
  const params = useSearchParams();
  const orderId = params.get("order");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  //  cargar pedido
  const load = async () => {
    if (!orderId) return;

    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    //  AUTO REFRESH (cada 5s)
    const interval = setInterval(load, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const statusConfig: any = {
    pending: {
      label: "Pendiente",
      color: "text-yellow-400",
      glow: "shadow-[0_0_10px_#facc15]",
    },
    preparing: {
      label: "Preparando",
      color: "text-blue-400",
      glow: "shadow-[0_0_10px_#60a5fa]",
    },
    ready: {
      label: "Listo",
      color: "text-green-400",
      glow: "shadow-[0_0_10px_#4ade80]",
    },
    delivered: {
      label: "Entregado",
      color: "text-zinc-400",
      glow: "",
    },
  };

  if (loading) {
    return (
      <ClientLayout>
        <p className="text-zinc-400">
          Cargando pedido...
        </p>
      </ClientLayout>
    );
  }

  if (!order || order.error) {
    return (
      <ClientLayout>
        <p>Pedido no encontrado</p>
      </ClientLayout>
    );
  }

  const status = statusConfig[order.status];

  return (
    <ClientLayout>
      <h1 className="text-2xl neon-text mb-6">
        ESTADO DEL PEDIDO
      </h1>

      <div className="card text-center flex flex-col gap-4">

        <p className="text-sm text-zinc-400">
          ID: {order._id}
        </p>

        <p className="text-lg">
          Total: ${order.total}
        </p>

        {/*  STATUS VISUAL */}
        <div
          className={`
            text-2xl font-bold
            ${status.color}
            ${status.glow}
            p-4 rounded-lg
          `}
        >
          {status.label}
        </div>

        {/*  ITEMS */}
        <div className="text-left text-sm mt-4">
          <p className="text-zinc-400 mb-2">
            Items:
          </p>

          {order.items.map((i: any, idx: number) => (
            <p key={idx}>
              {i.productId?.name} x{i.quantity}
            </p>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
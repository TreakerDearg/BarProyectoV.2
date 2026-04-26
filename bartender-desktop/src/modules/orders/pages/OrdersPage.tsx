import { useEffect, useState, useMemo } from "react";
import { Plus, RefreshCcw } from "lucide-react";

import OrderCard from "../components/OrderCard/Card";
import OrderForm from "../components/OrderForm";
import FocusPanel from "../components/FocusPanel";

import {
  getOrders,
  deleteOrder,
  updateOrderStatus,
} from "../services/orderService";

import type { Order } from "../types/order";

/* =========================
   PRIORITY SYSTEM
========================= */
function getOrderPriority(order: Order) {
  if (!order.createdAt) return 0;

  const minutes =
    (Date.now() - new Date(order.createdAt).getTime()) / 60000;

  if (minutes > 20) return 3; // 🔴 URGENT
  if (minutes > 10) return 2; // 🟡 WARNING
  return 1; // 🟢 NORMAL
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "in-progress" | "completed" | "cancelled"
  >("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  /* =========================
     FETCH
  ========================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // ⛔ luego lo cambiamos por WebSocket
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  /* =========================
     ACTIONS
  ========================= */
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar pedido?")) return;

    await deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o._id !== id));
  };

  const handleStatusChange = async (
    id: string,
    status: Order["status"]
  ) => {
    await updateOrderStatus(id, status);

    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status } : o))
    );
  };

  /* =========================
     FILTER + SORT (CLAVE)
  ========================= */
  const processedOrders = useMemo(() => {
    return orders
      .filter((o) => (filter === "all" ? true : o.status === filter))
      .sort((a, b) => {
        const pa = getOrderPriority(a);
        const pb = getOrderPriority(b);

        // prioridad primero
        if (pb !== pa) return pb - pa;

        // más viejo primero
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        );
      });
  }, [orders, filter]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Kitchen Display</h1>
          <p className="text-gray-500 text-sm">
            Pedidos en tiempo real
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="p-2 bg-gray-800 rounded-lg"
          >
            <RefreshCcw size={18} />
          </button>

          <button
            onClick={() =>
              setError("Seleccionar mesa desde módulo mesas")
            }
            className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg"
          >
            <Plus size={18} />
            Nuevo
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "in-progress", "completed", "cancelled"] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs border ${
                filter === f
                  ? "bg-[#8B5CF6] text-black"
                  : "bg-gray-900 text-gray-400"
              }`}
            >
              {f.toUpperCase()}
            </button>
          )
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border text-red-300 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* MAIN LAYOUT */}
      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : (
        <div className="flex gap-6">

          {/* 🧱 BOARD */}
          <div className="flex-1 grid gap-4
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            2xl:grid-cols-4
          ">
            {processedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onSelectItem={setSelectedItem}
                selectedItemId={selectedItem?._id}
              />
            ))}
          </div>

          {/* 🎯 FOCUS PANEL */}
          <FocusPanel selectedItem={selectedItem} />
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <OrderForm
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
}
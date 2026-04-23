import { useEffect, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";

import OrderCard from "../components/OrderCard";
import OrderForm from "../components/OrderForm";

import {
  getOrders,
  deleteOrder,
  updateOrderStatus,
} from "../services/orderService";

import type { Order } from "../types/order";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     POS CONTEXT (REAL FLOW)
  ========================= */
  const [tableId, setTableId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [filter, setFilter] = useState<
    "all" | "pending" | "in-progress" | "completed" | "cancelled"
  >("all");

  /* =========================
     FETCH ORDERS
  ========================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =========================
     DELETE ORDER
  ========================= */
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar pedido?")) return;

    try {
      setActionLoading(true);
      await deleteOrder(id);

      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error(err);
      setError("Error al eliminar pedido");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================
     STATUS UPDATE
  ========================= */
  const handleStatusChange = async (
    id: string,
    status: Order["status"]
  ) => {
    try {
      setActionLoading(true);

      await updateOrderStatus(id, status);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, status } : o
        )
      );
    } catch (err) {
      console.error(err);
      setError("Error al actualizar estado");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================
     OPEN ORDER (FROM TABLE ONLY)
  ========================= */
  const openOrderFromTable = (table: {
    _id: string;
    number: number;
    currentSessionId?: string | null;
    status?: string;
  }) => {
    if (!table._id || !table.currentSessionId) {
      setError("La mesa no tiene sesión activa");
      return;
    }

    if (table.status !== "occupied") {
      setError("La mesa debe estar abierta");
      return;
    }

    setTableId(table._id);
    setTableNumber(table.number);
    setSessionId(table.currentSessionId);

    setIsModalOpen(true);
  };

  /* =========================
     FILTER
  ========================= */
  const filteredOrders = orders.filter((o) =>
    filter === "all" ? true : o.status === filter
  );

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-gray-500 text-sm">
            Sistema POS - Cocina & Bar (Mesa obligatoria)
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={fetchOrders}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
          >
            <RefreshCcw size={18} />
          </button>

          {/* 🚨 BLOQUEADO: no se puede crear sin mesa */}
          <button
            onClick={() =>
              setError("Debes seleccionar una mesa desde el módulo de mesas")
            }
            className="flex items-center gap-2 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-medium"
          >
            <Plus size={18} />
            Nuevo Pedido
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
              className={`px-3 py-1 rounded-lg text-sm border transition ${
                filter === f
                  ? "bg-amber-500 text-black border-amber-500"
                  : "bg-gray-900 border-gray-800 text-gray-400"
              }`}
            >
              {f.toUpperCase()}
            </button>
          )
        )}

      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <div className="text-gray-400">Cargando pedidos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}

        </div>
      )}

      {/* ORDER FORM (STRICT POS FLOW) */}
      {isModalOpen && tableId && sessionId && (
        <OrderForm
          tableId={tableId}
          tableNumber={tableNumber ?? undefined}
          sessionId={sessionId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchOrders}
        />
      )}

    </div>
  );
}
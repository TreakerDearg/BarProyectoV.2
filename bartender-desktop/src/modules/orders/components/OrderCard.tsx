import {
  Trash2,
  Clock,
  AlertCircle,
  Coffee,
  Utensils,
} from "lucide-react";
import type { Order } from "../types/order";

interface Props {
  order: Order;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Order["status"]) => void;
}

/* =========================
   STATUS UI MAP
========================= */
const statusConfig = {
  pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "in-progress": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  completed: "text-green-400 bg-green-500/10 border-green-500/20",
  cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function OrderCard({
  order,
  onDelete,
  onStatusChange,
}: Props) {
  const orderId = order._id ?? "";

  /* =========================
     FIX TABLE DISPLAY
  ========================= */
  const tableNumber =
    typeof order.table === "object"
      ? (order.table as any)?.number
      : null;

  const tableLabel =
    tableNumber ?? `ID ${String(order.table).slice(-4)}`;

  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-lg hover:border-gray-700 transition">

      {/* HEADER */}
      <div className="flex justify-between items-start">

        <div>
          <h3 className="text-lg font-bold text-white">
            Mesa {tableLabel}
          </h3>

          {order.sessionId && (
            <p className="text-xs text-gray-500">
              Sesión: {order.sessionId.slice(-6)}
            </p>
          )}
        </div>

        <span
          className={`text-xs px-2 py-1 rounded border font-semibold ${
            statusConfig[order.status]
          }`}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* ITEMS */}
      <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">

        {order.items?.map((item, index) => {
          const product =
            typeof item.product === "object"
              ? item.product
              : null;

          const name = product?.name || "Producto";
          const type = product?.type || item.type;

          const Icon = type === "drink" ? Coffee : Utensils;

          const price = item.price ?? 0;

          return (
            <div
              key={item._id || index}
              className="flex justify-between items-center text-sm text-gray-300"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-gray-500" />
                <span>
                  {name}{" "}
                  <span className="text-gray-500">
                    x{item.quantity}
                  </span>
                </span>
              </div>

              <span className="text-gray-400">
                ${(price * item.quantity).toFixed(2)}
              </span>
            </div>
          );
        })}

      </div>

      {/* TOTAL */}
      <div className="mt-3 flex justify-between items-center border-t border-gray-800 pt-2">

        <span className="text-gray-400 text-xs flex items-center gap-1">
          <Clock size={14} />
          Ticket
        </span>

        <span className="text-amber-400 font-bold text-lg">
          ${order.total.toFixed(2)}
        </span>
      </div>

      {/* NOTES */}
      {order.notes && (
        <div className="mt-2 text-xs text-gray-400 flex gap-1 items-start bg-gray-800/30 p-2 rounded">
          <AlertCircle size={12} className="mt-0.5" />
          <span>{order.notes}</span>
        </div>
      )}

      {/* STATUS CONTROL */}
      <select
        value={order.status}
        onChange={(e) =>
          onStatusChange(orderId, e.target.value as Order["status"])
        }
        className="mt-3 w-full p-2 bg-gray-800 rounded text-sm border border-gray-700"
      >
        <option value="pending">Pendiente</option>
        <option value="in-progress">En proceso</option>
        <option value="completed">Completado</option>
        <option value="cancelled">Cancelado</option>
      </select>

      {/* ACTIONS */}
      <button
        onClick={() => orderId && onDelete(orderId)}
        className="mt-3 w-full flex justify-center items-center gap-2
                   bg-red-500/10 text-red-400 p-2 rounded
                   hover:bg-red-500/20 transition"
      >
        <Trash2 size={16} />
        Eliminar orden
      </button>
    </div>
  );
}
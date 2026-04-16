import { Trash2 } from "lucide-react";
import type { Order } from "../types/order";

interface Props {
  order: Order;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export default function OrderCard({
  order,
  onDelete,
  onStatusChange,
}: Props) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-bold">
        Mesa #{order.tableNumber}
      </h3>

      <ul className="text-sm text-gray-300 mt-2">
        {order.items.map((item, index) => (
          <li key={index}>
            {item.product.name} x{item.quantity}
          </li>
        ))}
      </ul>

      <p className="mt-2 font-semibold text-amber-400">
        Total: ${order.total.toFixed(2)}
      </p>

      <select
        value={order.status}
        onChange={(e) =>
          onStatusChange(order._id!, e.target.value)
        }
        className="mt-3 w-full p-2 bg-gray-800 rounded"
      >
        <option value="pending">Pendiente</option>
        <option value="preparing">Preparando</option>
        <option value="completed">Completado</option>
        <option value="cancelled">Cancelado</option>
      </select>

      <button
        onClick={() => onDelete(order._id!)}
        className="mt-3 w-full flex justify-center items-center gap-2 bg-red-500 p-2 rounded hover:bg-red-600"
      >
        <Trash2 size={16} />
        Eliminar
      </button>
    </div>
  );
}
import type { Order } from "../types/discounts";

interface Props {
  orders: Order[];
  selectedOrderId?: string;
  loading?: boolean;
  onSelectOrder: (order: Order) => void;
}

export default function OrderList({
  orders,
  selectedOrderId,
  loading,
  onSelectOrder,
}: Props) {
  return (
    <div className="bg-surface-container border border-white/10 p-4 rounded-xl min-h-[420px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">Active Orders</h3>
        <span className="text-xs text-primary font-semibold">{orders.length} live</span>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading active orders...</p>}

      {!loading && orders.length === 0 && (
        <p className="text-sm text-gray-500">No hay ordenes abiertas para descuentos.</p>
      )}

      <div className="space-y-2">
        {orders.map((order) => (
        <div
          key={order._id}
          onClick={() => onSelectOrder(order)}
          className={`p-3 border rounded-lg cursor-pointer transition ${
            selectedOrderId === order._id
              ? "border-primary bg-primary/10"
              : "border-white/10 hover:bg-surface-container-high"
          }`}
        >
          <p className="font-bold text-white">Mesa {order.table}</p>
          <p className="text-xs text-gray-400">
            {order.items.length} items · {order.status || "pending"}
          </p>
          <p className="text-sm font-bold text-primary mt-1">${Number(order.total || 0).toFixed(2)}</p>
        </div>
      ))}
      </div>
    </div>
  );
}
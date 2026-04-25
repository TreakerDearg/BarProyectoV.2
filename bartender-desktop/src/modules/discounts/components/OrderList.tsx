// components/OrderList.tsx
import type { Order } from "../types/discounts";

interface Props {
  onSelectOrder: (order: Order) => void;
}

export default function OrderList({ onSelectOrder }: Props) {
  const mockOrders: Order[] = [
    {
      _id: "1",
      table: "12",
      customerName: "John Doe",
      total: 142.5,
      items: [],
    },
  ];

  return (
    <div className="bg-surface-container p-4 rounded-xl">
      <h3 className="font-bold mb-4">Active Orders</h3>

      {mockOrders.map((order) => (
        <div
          key={order._id}
          onClick={() => onSelectOrder(order)}
          className="p-3 border rounded-lg cursor-pointer hover:bg-surface-container-high"
        >
          <p className="font-bold">Table {order.table}</p>
          <p className="text-sm">{order.customerName}</p>
          <p className="text-sm font-bold">${order.total}</p>
        </div>
      ))}
    </div>
  );
}
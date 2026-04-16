import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import OrderCard from "../components/OrderCard";
import OrderForm from "../components/OrderForm";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../services/orderService";
import type { Order } from "../types/order";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    const data = await getOrders();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSave = async (order: Order) => {
    await createOrder(order);
    setIsModalOpen(false);
    fetchOrders();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar pedido?")) {
      await deleteOrder(id);
      fetchOrders();
    }
  };

  const handleStatusChange = async (
    id: string,
    status: string
  ) => {
    await updateOrder(id, { status });
    fetchOrders();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg"
        >
          <Plus size={18} /> Nuevo Pedido
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {isModalOpen && (
        <OrderForm
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
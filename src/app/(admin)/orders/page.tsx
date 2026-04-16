"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import OrdersHeader from "@/components/admin/orders/OrdersHeader";
import OrdersFilters from "@/components/admin/orders/OrdersFilters";
import OrderList from "@/components/admin/orders/OrderList";
import { getOrders } from "@/services/orderService";
import styles from "@/styles/OrdersPage.module.css";

type OrderStatus = "all" | "pending" | "preparing" | "ready" | "delivered";

interface Order {
  _id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: any[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Error al obtener órdenes:", err);
      setError("No se pudieron cargar las órdenes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* HEADER */}
        <OrdersHeader />

        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          <OrdersFilters
            filter={filter}
            setFilter={(value) => setFilter(value as OrderStatus)}
          />

          <div className={styles.counter}>
            {filteredOrders.length} órdenes activas
          </div>
        </div>

        {/* CONTENIDO */}
        {loading ? (
          <div className={styles.stateMessage}>Cargando órdenes...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <OrderList orders={filteredOrders} refresh={load} />
        )}
      </div>
    </AdminLayout>
  );
}
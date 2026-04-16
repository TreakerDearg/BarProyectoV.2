"use client";

import OrderCard from "./OrderCard";

interface Props {
  orders: any[];
  refresh: () => void;
}

export default function OrderList({ orders, refresh }: Props) {
  if (!orders.length) {
    return (
      <p className="text-zinc-400">
        No hay órdenes activas.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          refresh={refresh}
        />
      ))}
    </div>
  );
}
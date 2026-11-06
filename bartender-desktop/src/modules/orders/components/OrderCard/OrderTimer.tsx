/**
 * OrderTimer — Cronómetro en tiempo real de la comanda.
 * REDISEÑO v3.0 — Slate Elegante
 */
import { useEffect, useState } from "react";
import type { Order } from "../../types/order";

interface Props {
  order: Order;
}

export default function OrderTimer({ order }: Props) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const start = order.createdAt
        ? new Date(order.createdAt).getTime()
        : Date.now();
      const diff = Date.now() - start;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTime(`${mins}:${secs.toString().padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const start    = order.createdAt ? new Date(order.createdAt).getTime() : Date.now();
  const minutes  = (Date.now() - start) / 60000;
  const isWarning  = minutes > 10;
  const isCritical = minutes > 15;

  const color = isCritical ? "#F85149" : isWarning ? "#FF7B54" : "#E6EDF3";

  return (
    <span
      className={`text-lg font-black tracking-widest font-mono ${isCritical ? "animate-pulse" : ""}`}
      style={{ color }}
    >
      {time}
    </span>
  );
}

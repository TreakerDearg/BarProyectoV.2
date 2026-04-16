"use client";

import {
  Clock,
  CheckCircle,
  Flame,
  Truck,
} from "lucide-react";
import styles from "@/styles/Order/OrderCard.module.css";

interface Props {
  order: any;
}

export default function OrderCardHeader({ order }: Props) {
  const statusLabels: Record<string, string> = {
    pending: "PENDING",
    preparing: "MIXING",
    ready: "READY",
    delivered: "DELIVERED",
  };

  const statusIcons: Record<string, JSX.Element> = {
    pending: <Clock size={14} />,
    preparing: <Flame size={14} />,
    ready: <CheckCircle size={14} />,
    delivered: <Truck size={14} />,
  };

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>
          ORDER #{order._id.slice(-4)}
        </h2>
        <span className={styles.status}>
          {statusIcons[order.status]}
          {statusLabels[order.status]}
        </span>
      </div>

      <p className={styles.time}>
        {new Date(order.createdAt).toLocaleTimeString()}
      </p>
    </>
  );
}
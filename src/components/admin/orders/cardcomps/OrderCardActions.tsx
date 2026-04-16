"use client";

import { updateOrderStatus } from "@/services/orderService";
import styles from "@/styles/Order/OrderCard.module.css";

interface Props {
  order: any;
  refresh: () => void;
}

export default function OrderCardActions({
  order,
  refresh,
}: Props) {
  const changeStatus = async (status: string) => {
    await updateOrderStatus(order._id, status);
    refresh();
  };

  if (order.status === "pending") {
    return (
      <button
        onClick={() => changeStatus("preparing")}
        className={`${styles.button} ${styles.pink}`}
      >
        START MIXING
      </button>
    );
  }

  if (order.status === "preparing") {
    return (
      <button
        onClick={() => changeStatus("ready")}
        className={`${styles.button} ${styles.cyan}`}
      >
        MARK READY
      </button>
    );
  }

  if (order.status === "ready") {
    return (
      <button
        onClick={() => changeStatus("delivered")}
        className={`${styles.button} ${styles.green}`}
      >
        MARK SERVED
      </button>
    );
  }

  return null;
}
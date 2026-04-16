"use client";

import { motion } from "framer-motion";
import OrderCardHeader from "./cardcomps/OrderCardHeader";
import OrderCardBody from "./cardcomps/OrderCardBody";
import OrderCardActions from "./cardcomps/OrderCardActions";
import styles from "@/styles/Order/OrderCard.module.css";

interface Props {
  order: any;
  refresh: () => void;
}

// Animaciones de entrada
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
};

export default function OrderCard({ order, refresh }: Props) {
  // Clase dinámica según el estado del pedido
  const statusClass =
    styles[order.status as keyof typeof styles] || "";

  return (
    <motion.div
      className={`${styles.card} ${statusClass}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
    >
      {/* HEADER */}
      <OrderCardHeader order={order} />

      {/* BODY */}
      <OrderCardBody order={order} />

      {/* ACTIONS */}
      <OrderCardActions
        order={order}
        refresh={refresh}
      />
    </motion.div>
  );
}
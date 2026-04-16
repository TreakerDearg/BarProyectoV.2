"use client";

import { Martini } from "lucide-react";
import { motion } from "framer-motion";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import LiquidVisualization from "./visualizations/LiquidVisualization";
import LottieDrinkAnimation from "./animation/LottieDrinkAnimation";

import styles from "@/styles/Order/OrderCard.module.css";
import "react-circular-progressbar/dist/styles.css";

interface Props {
  order: any;
}

// Configuración visual según el estado del pedido
const statusConfig: Record<
  string,
  { progress: number; color: string; label: string }
> = {
  pending: {
    progress: 25,
    color: "#ec4899", // Neon Pink
    label: "Pending",
  },
  preparing: {
    progress: 60,
    color: "#22d3ee", // Neon Cyan
    label: "Mixing",
  },
  ready: {
    progress: 90,
    color: "#4ade80", // Neon Green
    label: "Ready",
  },
  delivered: {
    progress: 100,
    color: "#a1a1aa", // Gray
    label: "Delivered",
  },
};

export default function OrderCardBody({ order }: Props) {
  const config =
    statusConfig[order.status] || statusConfig.pending;

  return (
    <div className={styles.body}>
      {/* LISTA DE PRODUCTOS */}
      <div className={styles.items}>
        {order.items.map((item: any, idx: number) => (
          <motion.div
            key={idx}
            className={styles.itemRow}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className={styles.itemName}>
              <Martini size={14} color="#ec4899" />
              <span>
                {item.productId?.name || item.name}
              </span>
            </div>
            <span className={styles.quantity}>
              x{item.quantity}
            </span>
          </motion.div>
        ))}
      </div>

      {/* VISUALIZACIONES */}
      <div className={styles.visualContainer}>
        {/* Visualización de líquido */}
        <motion.div
          className={styles.liquidWrapper}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <LiquidVisualization
            percentage={config.progress}
            color={config.color}
          />
        </motion.div>

        {/* Animación Lottie cuando se está preparando */}
        {order.status === "preparing" && (
          <motion.div
            className={styles.lottieWrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <LottieDrinkAnimation />
          </motion.div>
        )}

        {/* Indicador circular */}
        <motion.div
          className={styles.progressWrapper}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <CircularProgressbar
            value={config.progress}
            text={`${config.progress}%`}
            styles={buildStyles({
              textColor: config.color,
              pathColor: config.color,
              trailColor: "#1f2937",
              textSize: "16px",
            })}
          />
        </motion.div>

        {/* Etiqueta del estado */}
        <span
          className={styles.statusLabel}
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {/* TOTAL */}
      <motion.p
        className={styles.total}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Total: ${order.total}
      </motion.p>
    </div>
  );
}
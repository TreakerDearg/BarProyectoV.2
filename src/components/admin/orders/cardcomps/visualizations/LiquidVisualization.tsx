"use client";

import { motion } from "framer-motion";

interface LiquidVisualizationProps {
  percentage?: number;
  color?: string;
}

export default function LiquidVisualization({
  percentage = 0,
  color = "#22d3ee", // Neon Cyan por defecto
}: LiquidVisualizationProps) {
  // Asegurar que el porcentaje esté entre 0 y 100
  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div
      style={{
        width: 80,
        height: 80,
        border: `2px solid ${color}`,
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        background: "#020617",
        boxShadow: `0 0 12px ${color}55`,
      }}
    >
      {/* Líquido animado */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${safePercentage}%` }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          background: `linear-gradient(180deg, ${color}, ${color}AA)`,
        }}
      />

      {/* Onda animada */}
      <motion.div
        animate={{ x: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: `${safePercentage}%`,
          width: "120%",
          height: "8px",
          background: color,
          opacity: 0.6,
          borderRadius: "50%",
        }}
      />

      {/* Porcentaje */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: "bold",
          color: color,
          textShadow: `0 0 6px ${color}`,
        }}
      >
        {safePercentage}%
      </div>
    </div>
  );
}
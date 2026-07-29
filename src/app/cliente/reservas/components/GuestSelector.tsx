"use client";

import { motion } from "framer-motion";
import { Users, Plus, Minus } from "lucide-react";
import { useState } from "react";
import ui from "../../cliente-ui.module.css";

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8];

export default function GuestSelector({
  value,
  onChange,
  min = 1,
  max = 20,
}: GuestSelectorProps) {
  const [isCustom, setIsCustom] = useState(!guestOptions.includes(value));

  const handleSelect = (num: number) => {
    onChange(num);
    setIsCustom(false);
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + 1));
    if (value + 1 > 8) setIsCustom(true);
  };

  const handleDecrement = () => {
    onChange(Math.max(min, value - 1));
    if (value - 1 <= 8) setIsCustom(false);
  };

  return (
    <div className={ui.guestSelector}>
      <div className={ui.guestSelectorHeader}>
        <Users className={ui.guestSelectorIcon} />
        <h3 className={ui.guestSelectorTitle}>Cantidad de Personas</h3>
      </div>

      {/* Quick Selection Cards */}
      <div className={ui.guestSelectorGrid}>
        {guestOptions.map((num) => (
          <motion.button
            key={num}
            type="button"
            onClick={() => handleSelect(num)}
            className={`${ui.guestSelectorCard} ${
              value === num ? ui.guestSelectorCardActive : ""
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={ui.guestSelectorCardNumber}>{num}</span>
            <span className={ui.guestSelectorCardLabel}>
              {num === 1 ? "persona" : "personas"}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Custom Counter */}
      <div className={ui.guestSelectorCustom}>
        <motion.button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={ui.guestSelectorButton}
          whileHover={{ scale: value > min ? 1.1 : 1 }}
          whileTap={{ scale: value > min ? 0.9 : 1 }}
        >
          <Minus className={ui.guestSelectorButtonIcon} />
        </motion.button>

        <div className={ui.guestSelectorValue}>
          <span className={ui.guestSelectorNumber}>{value}</span>
          <span className={ui.guestSelectorLabel}>
            {value === 1 ? "persona" : "personas"}
          </span>
        </div>

        <motion.button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className={ui.guestSelectorButton}
          whileHover={{ scale: value < max ? 1.1 : 1 }}
          whileTap={{ scale: value < max ? 0.9 : 1 }}
        >
          <Plus className={ui.guestSelectorButtonIcon} />
        </motion.button>
      </div>

      {/* Hint */}
      {isCustom && value > 8 && (
        <p className={ui.guestSelectorHint}>
          Para grupos grandes, contáctanos directamente
        </p>
      )}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Users, Plus, Minus } from "lucide-react";
import ui from "../../cliente-ui.module.css";

interface NewGuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function NewGuestSelector({ value, onChange, min = 1, max = 20 }: NewGuestSelectorProps) {
  const handleIncrement = () => {
    onChange(Math.min(max, value + 1));
  };

  const handleDecrement = () => {
    onChange(Math.max(min, value - 1));
  };

  return (
    <div className={ui.newGuestSelector}>
      <div className={ui.newGuestSelectorTitle}>
        <Users className="inline-block w-5 h-5 mr-2" />
        ¿Cuántas personas?
      </div>
      <p className={ui.newGuestSelectorSubtitle}>
        Seleccioná la cantidad de personas para tu reserva
      </p>

      <div className={ui.newGuestCounter}>
        <motion.button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={ui.newGuestButton}
          whileHover={value > min ? { scale: 1.1 } : {}}
          whileTap={value > min ? { scale: 0.9 } : {}}
        >
          <Minus className="w-5 h-5" />
        </motion.button>

        <div>
          <div className={ui.newGuestValue}>{value}</div>
          <div className={ui.newGuestLabel}>
            {value === 1 ? "persona" : "personas"}
          </div>
        </div>

        <motion.button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className={ui.newGuestButton}
          whileHover={value < max ? { scale: 1.1 } : {}}
          whileTap={value < max ? { scale: 0.9 } : {}}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { UtensilsCrossed, Wine, Pizza, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import styles from "./CategoryFilter.module.css";

export type CategoryFilterOption = {
  value: string;
  label: string;
  icon?: typeof UtensilsCrossed;
};

interface CategoryFilterProps {
  options: CategoryFilterOption[];
  value: string;
  onChange: (value: string) => void;
  showAllOption?: boolean;
}

const DEFAULT_FILTERS: CategoryFilterOption[] = [
  { value: "all", label: "Todo", icon: Pizza },
  { value: "food", label: "Comidas", icon: UtensilsCrossed },
  { value: "drink", label: "Bebidas", icon: Wine },
  { value: "dessert", label: "Postres", icon: Coffee },
];

interface CategoryPillsProps {
  options?: CategoryFilterOption[];
  value: string;
  onChange: (value: string) => void;
  showAllOption?: boolean;
  variant?: "default" | "bento";
}

export function CategoryPills({
  options = DEFAULT_FILTERS,
  value,
  onChange,
  showAllOption = true,
  variant = "default",
}: CategoryPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const filters = showAllOption
    ? options
    : options.filter((opt) => opt.value !== "all");

  return (
    <div className={styles.pillsContainer} ref={scrollRef}>
      <div className={styles.pillsWrapper}>
        {filters.map((option, index) => {
          const Icon = option.icon;
          const isActive = value === option.value;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={clsx(
                styles.pill,
                isActive && styles.pillActive,
                variant === "bento" && styles.pillBento,
                isActive && variant === "bento" && styles.pillBentoActive,
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {Icon && (
                <Icon
                  className={clsx(styles.pillIcon, isActive && styles.pillIconActive)}
                />
              )}
              <span className={styles.pillLabel}>{option.label}</span>
              {isActive && (
                <motion.div
                  className={styles.pillIndicator}
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function CategoryFilter({
  options,
  value,
  onChange,
  showAllOption,
}: CategoryFilterProps) {
  return (
    <CategoryPills
      options={options}
      value={value}
      onChange={onChange}
      showAllOption={showAllOption}
    />
  );
}

export { DEFAULT_FILTERS };
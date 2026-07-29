"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, Wine, Pizza, Coffee, Dessert, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { memo } from "react";
import styles from "./CategoryCard.module.css";

export type CategoryCardProps = {
  id: string;
  label: string;
  icon?: React.ElementType;
  image?: string;
  count?: number;
  description?: string;
  isActive?: boolean;
  onClick?: () => void;
  variant?: "default" | "featured" | "compact";
};

const DEFAULT_ICONS: Record<string, React.ElementType> = {
  comida: UtensilsCrossed,
  bebida: Wine,
  trago: Wine,
  cocktail: Wine,
  postre: Dessert,
  dessert: Dessert,
  pizza: Pizza,
  café: Coffee,
  coffee: Coffee,
  default: UtensilsCrossed,
};

function getCategoryIcon(categoryName: string): React.ElementType {
  const normalized = categoryName.toLowerCase();
  
  for (const [key, icon] of Object.entries(DEFAULT_ICONS)) {
    if (normalized.includes(key) && key !== "default") {
      return icon;
    }
  }
  
  return DEFAULT_ICONS.default;
}

export const CategoryCard = memo(function CategoryCard({
  id,
  label,
  icon: IconProp,
  image,
  count,
  description,
  isActive = false,
  onClick,
  variant = "default",
}: CategoryCardProps) {
  const Icon = IconProp || getCategoryIcon(label);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={clsx(
        styles.card,
        styles[variant],
        isActive && styles.cardActive,
        image && styles.cardWithImage
      )}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Gradient */}
      <div className={styles.cardBackground} />
      
      {/* Glow Effect */}
      <div className={styles.cardGlow} />

      {/* Image or Icon */}
      <div className={styles.cardVisual}>
        {image ? (
          <div className={styles.cardImage}>
            <img src={image} alt={label} className={styles.cardImageImg} />
            <div className={styles.cardImageOverlay} />
          </div>
        ) : (
          <div className={clsx(styles.cardIcon, isActive && styles.cardIconActive)}>
            <Icon className={styles.cardIconSvg} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{label}</h3>
          {count !== undefined && (
            <span className={styles.cardCount}>{count}</span>
          )}
        </div>
        
        {description && variant !== "compact" && (
          <p className={styles.cardDescription}>{description}</p>
        )}
        
        <div className={styles.cardFooter}>
          <span className={styles.cardAction}>
            {isActive ? "Seleccionado" : "Explorar"}
          </span>
          <ChevronRight className={styles.cardArrow} />
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          className={styles.cardIndicator}
          layoutId={`category-${id}`}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
});

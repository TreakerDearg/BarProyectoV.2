"use client";

import { useState } from "react";
import { Plus, Minus, UtensilsCrossed, Wine, Check } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import type { ProductBrief } from "@/lib/types/api";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: ProductBrief;
  variant?: "default" | "featured" | "compact";
  showAddToCart?: boolean;
}

function getProductTypeLabel(type: string | undefined): string {
  const normalized = type?.toLowerCase() ?? "";
  if (normalized === "food" || normalized === "comida") return "Comida";
  if (normalized === "drink" || normalized === "bebida" || normalized === "cocktail") {
    return "Bebida";
  }
  if (normalized === "dessert" || normalized === "postre") return "Postre";
  return "Especial";
}

function isDrink(type: string | undefined): boolean {
  const normalized = (type ?? "").toLowerCase();
  return normalized === "drink" || normalized === "bebida" || normalized === "cocktail";
}

function formatPrice(price: number | undefined): string {
  if (typeof price !== "number" || !Number.isFinite(price)) return "$0";
  return price.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

export function ProductCard({
  product,
  variant = "default",
  showAddToCart = true,
}: ProductCardProps) {
  const { addItem, updateQty, getItemQty, isCartOpen, setIsCartOpen } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const isAvailable = product.available !== false;
  const currentQty = getItemQty(product._id);
  const price = product.dynamicPrice ?? product.price ?? 0;
  const isDrinkType = isDrink(product.type);
  const typeLabel = getProductTypeLabel(product.type);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    
    setIsAdding(true);
    addItem({ product, quantity: 1, notes: "" });
    
    setTimeout(() => setIsAdding(false), 300);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQty(product._id, currentQty + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentQty > 1) {
      updateQty(product._id, currentQty - 1);
    } else {
      updateQty(product._id, 0);
    }
  };

  return (
    <motion.article
      className={clsx(
        styles.card,
        !isAvailable && styles.cardDisabled,
        variant === "featured" && styles.cardFeatured,
        variant === "compact" && styles.cardCompact,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background decoration */}
      <div className={styles.cardGlow} />
      
      {/* Status indicator */}
      <div className={styles.statusBar}>
        <div className={clsx(
          styles.statusDot,
          isAvailable ? styles.statusAvailable : styles.statusUnavailable,
        )} />
        <span className={clsx(
          styles.statusText,
          isAvailable ? styles.statusTextAvailable : styles.statusTextUnavailable,
        )}>
          {isAvailable ? "Disponible" : "No disponible"}
        </span>
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        {/* Type badge */}
        <div className={styles.typeBadge}>
          {isDrinkType ? (
            <Wine className={styles.typeIcon} />
          ) : (
            <UtensilsCrossed className={styles.typeIcon} />
          )}
          <span>{typeLabel}</span>
        </div>

        {/* Product info */}
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          {product.description && (
            <p className={styles.productDescription}>{product.description}</p>
          )}
        </div>

        {/* Price and actions */}
        <div className={styles.cardFooter}>
          <div className={styles.priceContainer}>
            <span className={styles.price}>{formatPrice(price)}</span>
          </div>

          {showAddToCart && (
            <div className={styles.actionContainer}>
              {currentQty > 0 ? (
                <div className={styles.quantityControl}>
                  <motion.button
                    type="button"
                    onClick={handleDecrement}
                    className={styles.qtyButton}
                    whileTap={{ scale: 0.9 }}
                    disabled={!isAvailable}
                  >
                    <Minus className={styles.qtyIcon} />
                  </motion.button>
                  <span className={styles.qtyValue}>{currentQty}</span>
                  <motion.button
                    type="button"
                    onClick={handleIncrement}
                    className={styles.qtyButtonActive}
                    whileTap={{ scale: 0.9 }}
                    disabled={!isAvailable}
                  >
                    <Plus className={styles.qtyIcon} />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isAvailable || isAdding}
                  className={clsx(styles.addButton, isAdding && styles.addButtonSuccess)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isAdding ? (
                    <Check className={styles.addButtonIcon} />
                  ) : (
                    <>
                      <Plus className={styles.addButtonIcon} />
                      <span>Agregar</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Decorative corner */}
      <div className={styles.cardCorner} />
    </motion.article>
  );
}
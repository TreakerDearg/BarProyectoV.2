"use client";

import { useRef, useEffect, useState, memo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { UtensilsCrossed, Wine, Pizza, Coffee, Dessert, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import styles from "./CategoryNavigation.module.css";

export type CategoryOption = {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: number;
};

interface CategoryNavigationProps {
  categories: CategoryOption[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  showCount?: boolean;
}

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

export const CategoryNavigation = memo(function CategoryNavigation({
  categories,
  activeCategory,
  onCategoryChange,
  showCount = true,
}: CategoryNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const { scrollXProgress } = useScroll({
    container: scrollRef,
  });
  
  const scaleX = useTransform(scrollXProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        setCanScrollLeft(scrollRef.current.scrollLeft > 0);
        setCanScrollRight(
          scrollRef.current.scrollLeft <
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth
        );
      }
    };

    checkScroll();
    const container = scrollRef.current;
    container?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    
    return () => {
      container?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === "left"
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className={styles.categoryNav}>
      <div className={styles.categoryNavInner}>
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <motion.button
            type="button"
            onClick={() => scroll("left")}
            className={styles.scrollButton}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            aria-label="Scroll left"
          >
            <ChevronLeft className={styles.scrollButtonIcon} />
          </motion.button>
        )}

        {/* Categories Container */}
        <div className={styles.categoryScroll} ref={scrollRef}>
          <div className={styles.categoryList}>
            {categories.map((category, index) => {
              const Icon = category.icon || getCategoryIcon(category.label);
              const isActive = activeCategory === category.id;
              
              return (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => onCategoryChange(category.id)}
                  className={clsx(
                    styles.categoryButton,
                    isActive && styles.categoryButtonActive
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.categoryButtonContent}>
                    <div className={clsx(
                      styles.categoryIcon,
                      isActive && styles.categoryIconActive
                    )}>
                      <Icon className={styles.categoryIconSvg} />
                    </div>
                    
                    <div className={styles.categoryText}>
                      <span className={styles.categoryLabel}>{category.label}</span>
                      {showCount && category.count !== undefined && (
                        <span className={styles.categoryCount}>{category.count}</span>
                      )}
                    </div>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      className={styles.categoryIndicator}
                      layoutId="activeCategory"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <motion.button
            type="button"
            onClick={() => scroll("right")}
            className={styles.scrollButton}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            aria-label="Scroll right"
          >
            <ChevronRight className={styles.scrollButtonIcon} />
          </motion.button>
        )}
      </div>

      {/* Progress Bar */}
      <motion.div
        className={styles.progressBar}
        style={{ scaleX }}
      />
    </nav>
  );
});

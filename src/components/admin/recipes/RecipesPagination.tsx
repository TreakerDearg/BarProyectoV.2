"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "@/styles/recipes/RecipesPagination.module.css";

interface RecipesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function RecipesPagination({
  currentPage,
  totalPages,
  onPageChange,
}: RecipesPaginationProps) {
  if (totalPages <= 1) return null;

  const generatePages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.navButton}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={18} />
      </button>

      <div className={styles.pages}>
        {generatePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${styles.pageButton} ${
              currentPage === page ? styles.active : ""
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className={styles.navButton}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
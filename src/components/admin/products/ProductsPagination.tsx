"use client";

import { useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import styles from "@/styles/products/ProductsPagination.module.css";

interface ProductsPaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}

export default function ProductsPagination({
  currentPage,
  setCurrentPage,
  totalPages,
}: ProductsPaginationProps) {
  /* ================================
     LOCAL STORAGE
  ================================= */
  useEffect(() => {
    const savedPage = localStorage.getItem("products_currentPage");
    if (savedPage) {
      const page = Number(savedPage);
      if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
      }
    }
  }, [setCurrentPage, totalPages]);

  useEffect(() => {
    localStorage.setItem(
      "products_currentPage",
      currentPage.toString()
    );
  }, [currentPage]);

  /* ================================
     NAVEGACIÓN
  ================================= */
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const generatePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        title="Primera página"
      >
        <ChevronsLeft size={16} />
      </button>

      <button
        className={styles.button}
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        title="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>

      {generatePages().map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`${styles.pageButton} ${
            currentPage === page ? styles.active : ""
          }`}
        >
          {page}
        </button>
      ))}

      <button
        className={styles.button}
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="Página siguiente"
      >
        <ChevronRight size={16} />
      </button>

      <button
        className={styles.button}
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        title="Última página"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}
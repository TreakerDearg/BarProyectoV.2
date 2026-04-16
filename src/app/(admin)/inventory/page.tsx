"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import InventoryHeader from "@/components/admin/inventory/InventoryHeader";
import InventoryFilters from "@/components/admin/inventory/InventoryFilters";
import InventoryGrid from "@/components/admin/inventory/InventoryGrid";
import InventoryForm from "@/components/admin/inventory/InventoryForm";
import InventoryControls from "@/components/admin/inventory/InventoryControls";
import InventoryPagination from "@/components/admin/inventory/InventoryPagination";
import {
  getInventory,
  InventoryItem,
} from "@/services/inventoryService";
import { getStockStatus } from "@/components/admin/inventory/CardComps/cardStyles";
import styles from "@/styles/Inventory.module.css";

/* ================================
   NORMALIZADOR DE TEXTO
================================ */
const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/* ================================
   CLAVES DE LOCAL STORAGE
================================ */
const STORAGE_KEYS = {
  search: "inventory_search",
  category: "inventory_category",
  sortBy: "inventory_sortBy",
  sortOrder: "inventory_sortOrder",
  currentPage: "inventory_currentPage",
};

export default function InventoryPage() {
  /* ================================
     ESTADOS
  ================================= */
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] =
    useState<InventoryItem | null>(null);

  // Estados persistentes
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  /* ================================
     CARGAR PREFERENCIAS
  ================================= */
  useEffect(() => {
    if (typeof window === "undefined") return;

    setSearch(localStorage.getItem(STORAGE_KEYS.search) || "");
    setCategory(
      localStorage.getItem(STORAGE_KEYS.category) || "all"
    );
    setSortBy(
      localStorage.getItem(STORAGE_KEYS.sortBy) || "name"
    );
    setSortOrder(
      (localStorage.getItem(
        STORAGE_KEYS.sortOrder
      ) as "asc" | "desc") || "asc"
    );
    setCurrentPage(
      Number(
        localStorage.getItem(STORAGE_KEYS.currentPage)
      ) || 1
    );
  }, []);

  /* ================================
     GUARDAR PREFERENCIAS
  ================================= */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.search, search);
    localStorage.setItem(STORAGE_KEYS.category, category);
    localStorage.setItem(STORAGE_KEYS.sortBy, sortBy);
    localStorage.setItem(STORAGE_KEYS.sortOrder, sortOrder);
    localStorage.setItem(
      STORAGE_KEYS.currentPage,
      currentPage.toString()
    );
  }, [search, category, sortBy, sortOrder, currentPage]);

  /* ================================
     CARGAR INVENTARIO
  ================================= */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener el inventario:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ================================
     CATEGORÍAS DINÁMICAS
  ================================= */
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        items
          .map((item) => item.category)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    return ["all", ...uniqueCategories];
  }, [items]);

  /* ================================
     FILTRADO
  ================================= */
  const filteredItems = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return items.filter((item) => {
      const matchesSearch = normalizeText(item.name).includes(
        normalizedSearch
      );

      const matchesCategory =
        category === "all" ||
        normalizeText(item.category) ===
          normalizeText(category);

      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  /* ================================
     ORDENAMIENTO
  ================================= */
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "stock") {
        comparison = a.stock - b.stock;
      } else if (sortBy === "category") {
        comparison = a.category.localeCompare(b.category);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredItems, sortBy, sortOrder]);

  /* ================================
     PAGINACIÓN
  ================================= */
  const totalPages = Math.ceil(
    sortedItems.length / itemsPerPage
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(start, start + itemsPerPage);
  }, [sortedItems, currentPage]);

  /* Reiniciar página al filtrar */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sortBy, sortOrder]);

  /* ================================
     MÉTRICAS DEL INVENTARIO
  ================================= */
  const metrics = useMemo(() => {
    const summary = {
      total: items.length,
      critical: 0,
      low: 0,
      optimal: 0,
    };

    items.forEach((item) => {
      const status = getStockStatus(item.stock);
      summary[status]++;
    });

    return summary;
  }, [items]);

  /* ================================
     RENDER
  ================================= */
  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* HEADER */}
        <InventoryHeader
          totalItems={metrics.total}
          criticalItems={metrics.critical}
          lowStockItems={metrics.low}
          optimalItems={metrics.optimal}
        />

        {/* FORMULARIO CRUD */}
        <InventoryForm
          onCreated={load}
          editingItem={editingItem}
          onCancelEdit={() => setEditingItem(null)}
        />

        {/* FILTROS */}
        <InventoryFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          categories={categories}
        />

        {/* CONTROLES DE ORDENAMIENTO */}
        <InventoryControls
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* GRID */}
        <InventoryGrid
          items={paginatedItems}
          refresh={load}
          onEdit={setEditingItem}
          loading={loading}
        />

        {/* PAGINACIÓN */}
        {!loading && totalPages > 1 && (
          <InventoryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </AdminLayout>
  );
}
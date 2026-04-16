"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import ProductsHeader from "@/components/admin/products/ProductsHeader";
import ProductsFilters from "@/components/admin/products/ProductsFilters";
import ProductsControls from "@/components/admin/products/ProductsControls";
import ProductsGrid from "@/components/admin/products/ProductsGrid";
import ProductsPagination from "@/components/admin/products/ProductsPagination";
import ProductModal from "@/components/admin/products/ProductModal";
import { getProducts, Product } from "@/services/productService";
import styles from "@/styles/products/ProductsPage.module.css";

/* ================================
   NORMALIZADOR DE TEXTO
================================ */
const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const itemsPerPage = 6;

  /* ================================
     CARGAR PRODUCTOS
  ================================= */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      setProducts([]);
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
    const unique = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ).sort((a, b) => a!.localeCompare(b!));

    return ["all", ...unique];
  }, [products]);

  /* ================================
     FILTRADO
  ================================= */
  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return products.filter((product) => {
      const matchesSearch = normalizeText(product.name).includes(
        normalizedSearch
      );

      const matchesCategory =
        category === "all" ||
        normalizeText(product.category || "") ===
          normalizeText(category);

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  /* ================================
     ORDENAMIENTO
  ================================= */
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "price") {
        comparison = a.price - b.price;
      } else if (sortBy === "category") {
        comparison = (a.category || "").localeCompare(
          b.category || ""
        );
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredProducts, sortBy, sortOrder]);

  /* ================================
     PAGINACIÓN
  ================================= */
  const totalPages = Math.ceil(
    sortedProducts.length / itemsPerPage
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sortBy, sortOrder]);

  /* ================================
     MÉTRICAS
  ================================= */
  const metrics = useMemo(() => {
    return {
      total: products.length,
      categories: categories.length - 1,
      averagePrice:
        products.length > 0
          ? (
              products.reduce((acc, p) => acc + p.price, 0) /
              products.length
            ).toFixed(2)
          : "0.00",
      highestPrice:
        products.length > 0
          ? Math.max(...products.map((p) => p.price))
          : 0,
    };
  }, [products, categories]);

  /* ================================
     RENDER
  ================================= */
  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* HEADER */}
        <ProductsHeader
          metrics={metrics}
          onAdd={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
        />

        {/* FILTROS */}
        <ProductsFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          categories={categories}
        />

        {/* CONTROLES */}
        <ProductsControls
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* GRID */}
        <ProductsGrid
          products={paginatedProducts}
          loading={loading}
          onEdit={(product) => {
            setEditingProduct(product);
            setIsModalOpen(true);
          }}
          refresh={load}
        />

        {/* PAGINACIÓN */}
        {!loading && totalPages > 1 && (
          <ProductsPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        )}

        {/* MODAL */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={load}
          editingProduct={editingProduct}
        />
      </div>
    </AdminLayout>
  );
}
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  RefreshCcw,
  Loader2,
  Wine,
  UtensilsCrossed,
  LayoutGrid,
} from "lucide-react";

import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

import type { Product } from "../../../types/product";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<"all" | "drink" | "food">("all");

  /* =========================
     FETCH
  ========================= */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Error loading products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* =========================
     FILTERED
  ========================= */
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ? true : p.type === filter;

      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  /* =========================
     STATS INTELIGENTES
  ========================= */
  const stats = useMemo(() => {
    const drinks = products.filter((p) => p.type === "drink");
    const food = products.filter((p) => p.type === "food");

    const avgMargin = (list: Product[]) => {
      if (!list.length) return 0;

      const total = list.reduce((acc, p) => {
        if (!p.price || !p.cost) return acc;
        return acc + (p.price - p.cost) / p.price;
      }, 0);

      return Math.round((total / list.length) * 100);
    };

    return {
      total: products.length,
      drinks: drinks.length,
      food: food.length,
      avgMargin: avgMargin(products),
    };
  }, [products]);

  /* =========================
     SAVE
  ========================= */
  const handleSave = async (product: Product) => {
    try {
      if (product._id) {
        const updated = await updateProduct(
          product._id,
          product
        );

        setProducts((prev) =>
          prev.map((p) =>
            p._id === updated._id ? updated : p
          )
        );
      } else {
        const created = await createProduct(product);

        setProducts((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      setError("Error saving product");
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete product?")) return;

    try {
      await deleteProduct(id);

      setProducts((prev) =>
        prev.filter((p) => p._id !== id)
      );
    } catch (err) {
      console.error(err);
      setError("Error deleting product");
    }
  };

  const isEmpty = !loading && filtered.length === 0;

  /* =========================
     UI
  ========================= */
  return (
    <div className="flex flex-col h-full text-white space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            PRODUCT CONTROL
          </h1>
          <p className="text-xs text-gray-500">
            Manage menu, pricing and profitability
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            className="p-2 border border-obsidian rounded-lg hover:bg-obsidian/50"
          >
            <RefreshCcw size={16} />
          </button>

          <button
            onClick={() => {
              setSelectedProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-bold"
          >
            <Plus size={16} />
            NEW PRODUCT
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded text-xs">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="TOTAL" value={stats.total} />
        <Stat label="DRINKS" value={stats.drinks} icon={<Wine size={14} />} />
        <Stat label="FOOD" value={stats.food} icon={<UtensilsCrossed size={14} />} />
        <Stat label="AVG MARGIN" value={`${stats.avgMargin}%`} />
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3">

        {/* SEARCH */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2 top-2.5 text-gray-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-8 pr-3 py-2 bg-obsidian border border-obsidian rounded-lg text-sm outline-none"
          />
        </div>

        {/* FILTERS */}
        <div className="flex border border-obsidian rounded-lg overflow-hidden text-xs">
          {[
            { key: "all", label: "ALL" },
            { key: "drink", label: "DRINKS" },
            { key: "food", label: "FOOD" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 font-bold tracking-widest ${
                filter === f.key
                  ? "bg-amber-500 text-black"
                  : "bg-obsidian hover:bg-obsidian/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="text-center text-gray-500 py-20">
          <LayoutGrid className="mx-auto mb-3 opacity-40" />
          <p>No products found</p>
          <p className="text-xs mt-2">
            Try adjusting filters or create a new product
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
          {filtered.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={(p) => {
                setSelectedProduct(p);
                setIsModalOpen(true);
              }}
              onDelete={() => handleDelete(product._id!)}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <ProductForm
          product={selectedProduct}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

/* =========================
   STAT COMPONENT PRO
========================= */
function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-4 border border-obsidian rounded-xl bg-obsidian/20">
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-black text-white">
        {value}
      </p>
    </div>
  );
}
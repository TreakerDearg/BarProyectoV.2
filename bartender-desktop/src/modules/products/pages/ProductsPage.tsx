import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     FETCH PRODUCTS
  ========================= */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProducts();

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Error al cargar productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* =========================
     SAVE (CREATE / UPDATE)
  ========================= */
  const handleSave = async (product: Product) => {
    try {
      if (product._id) {
        await updateProduct(product._id, product);
      } else {
        await createProduct(product);
      }

      setIsModalOpen(false);
      setSelectedProduct(null);

      fetchProducts(); // simple refresh (luego lo optimizamos)
    } catch (err) {
      console.error("Error saving product:", err);
      setError("Error al guardar producto");
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id: string) => {
    try {
      if (!confirm("¿Eliminar producto?")) return;

      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Error al eliminar producto");
    }
  };

  /* =========================
     UI STATES
  ========================= */
  const isEmpty = !loading && products.length === 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Productos</h1>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-semibold"
        >
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400">Cargando productos...</p>
      )}

      {/* EMPTY STATE */}
      {isEmpty && (
        <div className="text-gray-500 text-center py-10">
          No hay productos registrados todavía.
        </div>
      )}

      {/* GRID */}
      {!loading && (
        <div className="grid grid-cols-4 gap-4">
          {products.map((product) => (
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
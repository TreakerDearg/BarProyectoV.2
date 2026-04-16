import { useEffect, useState } from "react";
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
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async (product: Product) => {
    if (product._id) {
      await updateProduct(product._id, product);
    } else {
      await createProduct(product);
    }
    setIsModalOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar producto?")) {
      await deleteProduct(id);
      fetchProducts();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg"
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onEdit={(p) => {
              setSelectedProduct(p);
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

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
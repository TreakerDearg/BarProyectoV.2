import { useEffect, useState } from "react";
import type { Order, OrderItem } from "../types/order";
import { getProducts } from "../../../modules/products/services/productService";
import type { Product } from "../../../types/product";

interface Props {
  onSave: (order: Order) => void;
  onClose: () => void;
}

export default function OrderForm({ onSave, onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [tableNumber, setTableNumber] = useState(1);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const addProduct = (product: Product) => {
    const existing = items.find(
      (item) => item.product._id === product._id
    );

    if (existing) {
      setItems(
        items.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          product,
          quantity: 1,
          price: product.price,
        },
      ]);
    }
  };

  const calculateTotal = () =>
    items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      tableNumber,
      items,
      status: "pending",
      total: calculateTotal(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-xl w-[600px]"
      >
        <h2 className="text-xl font-bold mb-4">Nuevo Pedido</h2>

        <input
          type="number"
          value={tableNumber}
          onChange={(e) =>
            setTableNumber(Number(e.target.value))
          }
          className="w-full p-2 mb-3 rounded bg-gray-800"
          placeholder="Número de Mesa"
          required
        />

        <div className="grid grid-cols-2 gap-2 mb-4 max-h-40 overflow-y-auto">
          {products.map((product) => (
            <button
              key={product._id}
              type="button"
              onClick={() => addProduct(product)}
              className="bg-gray-800 p-2 rounded hover:bg-gray-700 text-left"
            >
              {product.name} - ${product.price}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Resumen</h3>
          {items.map((item, index) => (
            <p key={index} className="text-sm">
              {item.product.name} x{item.quantity}
            </p>
          ))}
        </div>

        <p className="font-bold text-amber-400 mb-4">
          Total: ${calculateTotal().toFixed(2)}
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 text-black rounded"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
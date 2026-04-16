import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "../../../types/product";

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-md">
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover rounded-lg mb-3"
        />
      )}

      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-400">{product.description}</p>

      <div className="flex justify-between items-center mt-3">
        <span className="text-amber-400 font-bold">
          ${product.price.toFixed(2)}
        </span>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
          {product.category}
        </span>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => onEdit(product)}
          className="p-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => onDelete(product._id!)}
          className="p-2 bg-red-500 rounded hover:bg-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
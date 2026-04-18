import { Pencil, Trash2, Star, AlertTriangle } from "lucide-react";
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
  const margin =
    product.price && product.cost
      ? Math.round(((product.price - product.cost) / product.price) * 100)
      : 0;

  return (
    <div className="group bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-4 hover:border-amber-500 transition-all shadow-lg relative overflow-hidden">

      {/* FEATURED BADGE */}
      {product.featured && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-yellow-400 text-xs bg-yellow-400/10 px-2 py-1 rounded-full">
          <Star size={12} />
          Destacado
        </div>
      )}

      {/* IMAGE */}
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover rounded-xl mb-3 group-hover:scale-[1.02] transition-transform"
        />
      ) : (
        <div className="w-full h-40 bg-gray-800 rounded-xl mb-3 flex items-center justify-center text-gray-600 text-sm">
          Sin imagen
        </div>
      )}

      {/* TITLE */}
      <h3 className="text-lg font-bold text-white">
        {product.name}
      </h3>

      {/* DESCRIPTION */}
      <p className="text-sm text-gray-400 line-clamp-2">
        {product.description || "Sin descripción"}
      </p>

      {/* META INFO */}
      <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-400">
        <span className="bg-gray-800 px-2 py-1 rounded">
          {product.category}
        </span>

        <span className="bg-gray-800 px-2 py-1 rounded">
          {product.type}
        </span>

        {product.available ? (
          <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded">
            Disponible
          </span>
        ) : (
          <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded flex items-center gap-1">
            <AlertTriangle size={12} />
            No disponible
          </span>
        )}
      </div>

      {/* PRICING */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <span className="text-amber-400 font-bold text-lg">
            ${product.price.toFixed(2)}
          </span>

          <p className="text-xs text-gray-500">
            Costo: ${product.cost?.toFixed(2) || 0}
          </p>
        </div>

        {/* MARGIN */}
        <div
          className={`text-xs px-2 py-1 rounded ${
            margin >= 40
              ? "bg-green-500/10 text-green-400"
              : margin >= 20
              ? "bg-yellow-500/10 text-yellow-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {margin}% margen
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 mt-4 opacity-80 group-hover:opacity-100 transition">
        <button
          onClick={() => onEdit(product)}
          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => product._id && onDelete(product._id)}
          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
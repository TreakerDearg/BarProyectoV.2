"use client";

import { updateProduct, deleteProduct } from "@/services/productService";

export default function ProductItem({ product, refresh }: any) {
  return (
    <div className="card flex flex-col gap-2">
      <input
        value={product.name}
        onChange={(e) =>
          updateProduct(product._id, { name: e.target.value })
        }
      />

      <input
        type="number"
        value={product.price}
        onChange={(e) =>
          updateProduct(product._id, {
            price: Number(e.target.value),
          })
        }
      />

      <input
        value={product.category || ""}
        onChange={(e) =>
          updateProduct(product._id, {
            category: e.target.value,
          })
        }
      />

      <button
        onClick={() => {
          deleteProduct(product._id);
          refresh();
        }}
        className="text-red-400 text-sm"
      >
        Eliminar
      </button>
    </div>
  );
}
"use client";

import { useState } from "react";
import { createProduct } from "@/services/productService";

export default function ProductForm({ onCreated }: any) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
  });

  const handleSubmit = async () => {
    if (!form.name) return;

    await createProduct({
      name: form.name,
      price: Number(form.price),
      category: form.category,
    });

    setForm({ name: "", price: "", category: "" });
    onCreated(); // refrescar lista
  };

  return (
    <div className="card flex gap-2 flex-wrap mb-6">
      <input
        placeholder="Nombre"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <input
        placeholder="Precio"
        type="number"
        value={form.price}
        onChange={(e) =>
          setForm({ ...form, price: e.target.value })
        }
      />

      <input
        placeholder="Categoría"
        value={form.category}
        onChange={(e) =>
          setForm({ ...form, category: e.target.value })
        }
      />

      <button
        onClick={handleSubmit}
        className="bg-[var(--neon-purple)] px-4 rounded"
      >
        + Crear
      </button>
    </div>
  );
}
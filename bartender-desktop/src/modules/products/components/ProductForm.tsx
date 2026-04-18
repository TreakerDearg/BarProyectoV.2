import { useEffect, useState } from "react";
import type { Product } from "../../../types/product";

interface Props {
  product?: Product | null;
  onSave: (product: Product) => void;
  onClose: () => void;
}

/* =========================
   EMPTY STATE
========================= */
const EMPTY_FORM: Product = {
  name: "",
  description: "",
  price: 0,
  cost: 0,
  category: "",
  subcategory: "",
  type: "drink",
  image: "",
  available: true,
  featured: false,
  tags: [],
  preparationTime: 0,
};

export default function ProductForm({
  product,
  onSave,
  onClose,
}: Props) {
  const [formData, setFormData] = useState<Product>(EMPTY_FORM);

  /* =========================
     INIT SAFE
  ========================= */
  useEffect(() => {
    if (product) {
      setFormData({
        ...EMPTY_FORM,
        ...product,
        tags: product.tags ?? [],
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [product]);

  /* =========================
     HANDLE CHANGE (ROBUSTO)
  ========================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const checked =
      (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price" ||
            name === "cost" ||
            name === "preparationTime"
          ? Number(value)
          : value,
    }));
  };

  /* =========================
     TAGS HANDLER SIMPLE
  ========================= */
  const handleTags = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: value
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    }));
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      ...formData,
      price: Number(formData.price),
      cost: Number(formData.cost),
    });
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="w-[600px] bg-gray-950 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl"
      >
        {/* HEADER */}
        <h2 className="text-xl font-bold">
          {product ? "Editar Producto" : "Nuevo Producto"}
        </h2>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-2 gap-3">
          <input
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            className="input"
          />

          <input
            name="category"
            placeholder="Categoría"
            value={formData.category}
            onChange={handleChange}
            className="input"
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="input"
          >
            <option value="drink">Bebida</option>
            <option value="food">Comida</option>
          </select>

          <input
            name="subcategory"
            placeholder="Subcategoría"
            value={formData.subcategory}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* DESCRIPCIÓN */}
        <input
          name="description"
          placeholder="Descripción"
          value={formData.description}
          onChange={handleChange}
          className="input"
        />

        {/* PRECIOS */}
        <div className="grid grid-cols-2 gap-3">
          <input
            name="price"
            type="number"
            placeholder="Precio"
            value={formData.price}
            onChange={handleChange}
            className="input"
          />

          <input
            name="cost"
            type="number"
            placeholder="Costo"
            value={formData.cost}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* IMAGE */}
        <input
          name="image"
          placeholder="URL imagen"
          value={formData.image}
          onChange={handleChange}
          className="input"
        />

        {/* TAGS */}
        <input
          placeholder="Tags (separados por coma)"
          value={formData.tags.join(", ")}
          onChange={(e) => handleTags(e.target.value)}
          className="input"
        />

        {/* TIME */}
        <input
          name="preparationTime"
          type="number"
          placeholder="Tiempo preparación (min)"
          value={formData.preparationTime}
          onChange={handleChange}
          className="input"
        />

        {/* CHECKBOXES */}
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
            />
            Disponible
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
            />
            Destacado
          </label>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
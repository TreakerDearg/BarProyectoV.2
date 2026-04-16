import { useState, useEffect } from "react";
import type { Product } from "../../../types/product";

interface Props {
  product?: Product | null;
  onSave: (product: Product) => void;
  onClose: () => void;
}

export default function ProductForm({
  product,
  onSave,
  onClose,
}: Props) {
  const [formData, setFormData] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    available: true,
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: Number(formData.price),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-xl w-96 space-y-3"
      >
        <h2 className="text-xl font-bold">
          {product ? "Editar Producto" : "Nuevo Producto"}
        </h2>

        <input
          name="name"
          placeholder="Nombre"
          className="w-full p-2 rounded bg-gray-800"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          name="description"
          placeholder="Descripción"
          className="w-full p-2 rounded bg-gray-800"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          placeholder="Precio"
          className="w-full p-2 rounded bg-gray-800"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <input
          name="category"
          placeholder="Categoría"
          className="w-full p-2 rounded bg-gray-800"
          value={formData.category}
          onChange={handleChange}
          required
        />

        <input
          name="image"
          placeholder="URL de Imagen"
          className="w-full p-2 rounded bg-gray-800"
          value={formData.image}
          onChange={handleChange}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
          />
          Disponible
        </label>

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
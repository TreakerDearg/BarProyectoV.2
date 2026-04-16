import { useEffect, useState } from "react";
import type { Menu } from "../../../types/menu";
import { getProducts } from "../../products/services/productService";
import type { Product } from "../../../types/product";

interface Props {
  menu?: Menu | null;
  onSave: (menu: Menu) => void;
  onClose: () => void;
}

export default function MenuForm({ menu, onSave, onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Menu>({
    name: "",
    description: "",
    category: "",
    products: [],
    available: true,
  });

  useEffect(() => {
    if (menu) setFormData(menu);
    fetchProducts();
  }, [menu]);

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleProductSelect = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.includes(id)
        ? prev.products.filter((pid) => pid !== id)
        : [...prev.products, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-xl w-[500px] space-y-3"
      >
        <h2 className="text-xl font-bold">
          {menu ? "Editar Menú" : "Nuevo Menú"}
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
          name="category"
          placeholder="Categoría"
          className="w-full p-2 rounded bg-gray-800"
          value={formData.category}
          onChange={handleChange}
          required
        />

        {/* Selección de Productos */}
        <div>
          <label className="block mb-2 font-semibold">
            Productos
          </label>
          <div className="max-h-40 overflow-y-auto bg-gray-800 p-2 rounded">
            {products.map((product) => (
              <label
                key={product._id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={formData.products.includes(product._id!)}
                  onChange={() =>
                    handleProductSelect(product._id!)
                  }
                />
                {product.name}
              </label>
            ))}
          </div>
        </div>

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
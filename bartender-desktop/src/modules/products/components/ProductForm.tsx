import { useEffect, useMemo, useState } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import type { Product } from "../../../types/product";

/* ========================= */
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
/* ========================= */

export default function ProductForm({ product, onSave, onClose }: any) {
  const [formData, setFormData] = useState<Product>(EMPTY_FORM);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const steps = ["Info", "Pricing", "Media", "Extras"];

  useEffect(() => {
    if (product) {
      setFormData({ ...EMPTY_FORM, ...product });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [product]);

  /* ========================= */
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["price", "cost", "preparationTime"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  /* ========================= */
  const margin = useMemo(() => {
    if (!formData.price || !formData.cost) return 0;
    return Math.round(
      ((formData.price - formData.cost) / formData.price) * 100
    );
  }, [formData]);

  /* ========================= */
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  /* ========================= */
  const handleSubmit = () => {
    if (!formData.name) return setError("Nombre requerido");
    if (!formData.price) return setError("Precio requerido");

    onSave(formData);
  };

  /* ========================= */
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

      <div className="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">
              {product ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-xs text-gray-500">
              Paso {step + 1} de {steps.length} — {steps[step]}
            </p>
          </div>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY (SCROLL CONTROLADO) */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">

          {/* STEP 1 */}
          {step === 0 && (
            <>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre" />
              <Input name="category" value={formData.category} onChange={handleChange} placeholder="Categoría" />
              <Input name="subcategory" value={formData.subcategory} onChange={handleChange} placeholder="Subcategoría" />

              <select name="type" value={formData.type} onChange={handleChange} className="input">
                <option value="drink">Bebida</option>
                <option value="food">Comida</option>
              </select>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                placeholder="Descripción"
              />
            </>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <>
              <Input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Precio" />
              <Input name="cost" type="number" value={formData.cost} onChange={handleChange} placeholder="Costo" />

              <div className="text-sm">
                Margen:
                <span className="ml-2 font-bold text-amber-400">
                  {margin}%
                </span>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <>
              <Input name="image" value={formData.image} onChange={handleChange} placeholder="URL Imagen" />

              {formData.image && (
                <img
                  src={formData.image}
                  className="h-32 w-full object-cover rounded-lg"
                />
              )}

              <Input
                value={formData.tags.join(", ")}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value.split(",").map((t: string) => t.trim()),
                  })
                }
                placeholder="tags separados por coma"
              />
            </>
          )}

          {/* STEP 4 */}
          {step === 3 && (
            <>
              <Input
                name="preparationTime"
                type="number"
                value={formData.preparationTime}
                onChange={handleChange}
                placeholder="Tiempo preparación"
              />

              <label className="flex gap-2">
                <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} />
                Disponible
              </label>

              <label className="flex gap-2">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                Destacado
              </label>
            </>
          )}

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-800 flex justify-between">

          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-2 text-gray-400"
          >
            <ChevronLeft size={16} />
            Atrás
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={next}
              className="flex items-center gap-2 bg-amber-500 px-4 py-2 rounded"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-green-500 px-4 py-2 rounded"
            >
              Guardar
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

/* ========================= */
function Input(props: any) {
  return (
    <input
      {...props}
      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm outline-none"
    />
  );
}
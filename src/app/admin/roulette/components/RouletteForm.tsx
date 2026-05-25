"use client";

import { useEffect, useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import type { RouletteDrink } from "../services/rouletteService";

const EMPTY_FORM: Partial<RouletteDrink> = {
  name: "",
  weight: 10,
  color: "#D4A340",
  category: "general",
  price: 0,
  rarity: "COMMON",
  pityThreshold: undefined,
  active: true,
};

const CATEGORY_OPTIONS = [
  "general",
  "premium",
  "shots",
  "cocktails",
  "mocktails",
  "beers",
  "wines",
];

const RARITY_OPTIONS = [
  { value: "COMMON", label: "Común", color: "bg-gray-500" },
  { value: "RARE", label: "Raro", color: "bg-blue-500" },
  { value: "EPIC", label: "Épico", color: "bg-purple-500" },
  { value: "LEGENDARY", label: "Legendario", color: "bg-amber-500" },
];

interface RouletteFormProps {
  drink?: RouletteDrink | null;
  onSave: (drink: Partial<RouletteDrink>) => Promise<void>;
  onClose: () => void;
}

export default function RouletteForm({ drink, onSave, onClose }: RouletteFormProps) {
  const [formData, setFormData] = useState<Partial<RouletteDrink>>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (drink) {
      setFormData({ ...EMPTY_FORM, ...drink });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [drink]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name?.trim()) {
      return setError("El nombre es requerido");
    }
    if (!formData.weight || formData.weight <= 0) {
      return setError("El peso debe ser mayor a 0");
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">
            {drink ? "Editar Trago" : "Nuevo Trago"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
              placeholder="Ej: Mojito Clásico"
              required
            />
          </div>

          {/* Categoría y Rareza */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Categoría
              </label>
              <select
                name="category"
                value={formData.category || "general"}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Rareza
              </label>
              <select
                name="rarity"
                value={formData.rarity || "COMMON"}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
              >
                {RARITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Peso y Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Peso *
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight || 10}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">
                Mayor peso = mayor probabilidad
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="color"
                  value={formData.color || "#D4A340"}
                  onChange={handleChange}
                  className="w-12 h-10 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  name="color"
                  value={formData.color || "#D4A340"}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
                  placeholder="#D4A340"
                />
              </div>
            </div>
          </div>

          {/* Precio y Pity Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Precio
              </label>
              <input
                type="number"
                name="price"
                value={formData.price || 0}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Pity Threshold
              </label>
              <input
                type="number"
                name="pityThreshold"
                value={formData.pityThreshold || ""}
                onChange={handleChange}
                min="1"
                placeholder="Opcional"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Spins sin ganar para garantizar
              </p>
            </div>
          </div>

          {/* Activo */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active ?? true}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, active: e.target.checked }))
              }
              className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="active" className="text-sm text-zinc-300">
              Activo en ruleta
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-medium hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

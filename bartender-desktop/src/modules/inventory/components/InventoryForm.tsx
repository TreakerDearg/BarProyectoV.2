import { useEffect, useMemo, useState } from "react";
import {
  Package,
  AlertTriangle,
  Tag,
  DollarSign,
  Warehouse,
} from "lucide-react";

import type { InventoryItem } from "../types/inventory";

interface Props {
  item?: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}

const EMPTY_FORM: InventoryItem = {
  name: "",
  stock: 0,
  minStock: 5,
  maxStock: 100,
  unit: "unit",
  sector: "bar",
  category: "",
  cost: 0,
  supplier: "",
  location: "storage",
  isActive: false
};

const UNIT_OPTIONS = ["ml", "l", "g", "kg", "unit", "oz", "portion"];
const SECTOR_OPTIONS = ["bar", "kitchen", "general"];
const LOCATION_OPTIONS = ["bar", "kitchen", "storage"];

export default function InventoryForm({
  item,
  onSave,
  onClose,
}: Props) {
  const [formData, setFormData] = useState<InventoryItem>(EMPTY_FORM);
  const [errors, setErrors] = useState<string[]>([]);

  /* =========================
     INIT / EDIT MODE
  ========================= */
  useEffect(() => {
    setFormData(item ? { ...EMPTY_FORM, ...item } : EMPTY_FORM);
    setErrors([]);
  }, [item]);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: ["stock", "minStock", "maxStock", "cost"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  /* =========================
     VALIDATION
  ========================= */
  const validate = () => {
    const err: string[] = [];

    if (!formData.name.trim()) err.push("Nombre requerido");
    if (!formData.category.trim()) err.push("Categoría requerida");

    if (formData.stock < 0) err.push("Stock inválido");
    if (formData.minStock < 0) err.push("Min stock inválido");
    if (formData.maxStock <= 0) err.push("Max stock inválido");

    if (formData.minStock > formData.maxStock) {
      err.push("Min stock no puede ser mayor a max stock");
    }

    setErrors(err);
    return err.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSave(formData);
  };

  /* =========================
     DERIVED STATE
  ========================= */
  const stockPercent = useMemo(() => {
    if (!formData.maxStock) return 0;
    return Math.min(
      (formData.stock / formData.maxStock) * 100,
      100
    );
  }, [formData.stock, formData.maxStock]);

  const isLowStock = formData.stock <= formData.minStock;

  /* =========================
     UI
  ========================= */
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="w-[560px] bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-3xl shadow-2xl p-6 space-y-5"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Warehouse size={18} />
              {item ? "Editar insumo" : "Nuevo insumo"}
            </h2>

            <p className="text-xs text-gray-500">
              Gestión de inventario del bar
            </p>
          </div>

          {isLowStock && (
            <span className="flex items-center gap-1 text-red-400 text-xs">
              <AlertTriangle size={14} />
              Stock bajo
            </span>
          )}
        </div>

        {/* ERRORES */}
        {errors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm text-red-300">
            {errors.map((e, i) => (
              <p key={i}>• {e}</p>
            ))}
          </div>
        )}

        {/* =========================
            BASIC INFO
        ========================= */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Package className="absolute left-3 top-3 text-gray-500" size={16} />
            <input
              name="name"
              placeholder="Nombre del insumo"
              value={formData.name}
              onChange={handleChange}
              className="input pl-10"
            />
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-3 text-gray-500" size={16} />
            <input
              name="category"
              placeholder="Categoría"
              value={formData.category}
              onChange={handleChange}
              className="input pl-10"
            />
          </div>
        </div>

        {/* =========================
            STOCK PANEL VISUAL
        ========================= */}
        <div className="bg-gray-800/40 border border-gray-800 p-4 rounded-2xl space-y-3">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Stock actual</span>
            <span>{formData.stock} unidades</span>
          </div>

          <input
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            className="input"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              name="minStock"
              type="number"
              placeholder="Mínimo"
              value={formData.minStock}
              onChange={handleChange}
              className="input"
            />

            <input
              name="maxStock"
              type="number"
              placeholder="Máximo"
              value={formData.maxStock}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* PROGRESS BAR */}
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isLowStock ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{ width: `${stockPercent}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 text-right">
            {Math.round(stockPercent)}% capacidad
          </p>
        </div>

        {/* =========================
            SELECTS
        ========================= */}
        <div className="grid grid-cols-3 gap-2">
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="input"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>

          <select
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            className="input"
          >
            {SECTOR_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input"
          >
            {LOCATION_OPTIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* =========================
            COST / SUPPLIER
        ========================= */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 text-gray-500" size={16} />
            <input
              name="cost"
              type="number"
              placeholder="Costo"
              value={formData.cost}
              onChange={handleChange}
              className="input pl-10"
            />
          </div>

          <input
            name="supplier"
            placeholder="Proveedor"
            value={formData.supplier}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* =========================
            ACTIONS
        ========================= */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm"
          >
            Guardar insumo
          </button>
        </div>
      </form>
    </div>
  );
}
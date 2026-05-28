"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  Package,
  Tag,
  DollarSign,
  Loader2,
  Zap,
  Target,
  ShieldCheck
} from "lucide-react";

import ImageUploader from "../../../components/shared/ImageUploader";

import type { InventoryItem } from "../types/inventory";

interface Props {
  item?: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}

const EMPTY_FORM: any = {
  name: "",
  stock: 0,
  minStock: 5,
  maxStock: 100,
  unit: "unit",
  sector: "bar",
  category: "",
  cost: 0,
  supplier: "",
  location: "Bóveda Central",
  isActive: true,
  image: "",
  imagePublicId: ""
};

const UNIT_OPTIONS = ["ml", "l", "g", "kg", "unit", "oz", "portion", "box"];
const SECTOR_OPTIONS = ["bar", "kitchen", "general"];
const LOCATION_OPTIONS = ["Bóveda Central", "Barra Principal", "Cocina VIP", "Bodega Externa"];

export default function InventoryForm({
  item,
  onSave,
  onClose,
}: Props) {
  const [formData, setFormData] = useState<InventoryItem>(EMPTY_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(item ? { ...EMPTY_FORM, ...item } : EMPTY_FORM);
    setErrors([]);
  }, [item]);

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

  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const validate = () => {
    const err: string[] = [];
    if (!formData.name.trim()) err.push("Se requiere identificar el insumo");
    if (!formData.category.trim()) err.push("Categoría Umbra requerida");
    if (formData.minStock > formData.maxStock) err.push("Conflicto en límites de stock");
    setErrors(err);
    return err.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const stockPercent = useMemo(() => {
    if (!formData.maxStock) return 0;
    return Math.min((formData.stock / formData.maxStock) * 100, 100);
  }, [formData.stock, formData.maxStock]);

  const isCritical = formData.stock <= formData.minStock;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-fade-in">
      
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-6xl bg-surface-2 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-6 bg-surface-3 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold/20 rounded-xl">
              <Package className="text-gold" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {item ? "Editar Inventario" : "Nuevo Inventario"}
              </h2>
              <p className="text-sm text-muted">
                Gestión de inventario
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} className="text-muted" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* ERRORS */}
          {errors.length > 0 && (
            <div className="p-5 bg-red/5 border border-red/20 rounded-2xl space-y-2 animate-shake">
              {errors.map((e, i) => (
                <p key={i} className="text-[9px] font-black text-red uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={10} /> {e}
                </p>
              ))}
            </div>
          )}

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Gin Mare Premium"
                  className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Ej: Destilados"
                  className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Imagen</label>
              <ImageUploader
                onImageUpload={handleImageUpload}
                currentImage={formData.image}
                folder="inventory"
                mode="advanced"
                label="Subir imagen"
              />
            </div>
          </div>

          {/* STOCK LOGISTICS */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Actual</label>
                <input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white text-center focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Mínimo</label>
                <input name="minStock" type="number" value={formData.minStock} onChange={handleChange} className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white text-center focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Máximo</label>
                <input name="maxStock" type="number" value={formData.maxStock} onChange={handleChange} className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white text-center focus:outline-none focus:border-gold" />
              </div>
            </div>

            <div className="bg-surface-3 p-4 rounded-lg border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">Nivel de Stock</span>
                <span className={`text-sm font-bold ${isCritical ? 'text-red-400' : 'text-green-400'}`}>{stockPercent.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div className={`h-full ${isCritical ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${stockPercent}%` }} />
              </div>
            </div>
          </div>

          {/* SPECS & ORIGIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Unidad de Medida</label>
                <select name="unit" value={formData.unit} onChange={handleChange} className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold">
                  {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sector</label>
                <select name="sector" value={formData.sector} onChange={handleChange} className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold">
                  {SECTOR_OPTIONS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Costo por Unidad</label>
                <input name="cost" type="number" value={formData.cost} onChange={handleChange} className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ubicación</label>
                <select name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold">
                  {LOCATION_OPTIONS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-surface-3 border-t border-white/10 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-3 rounded-lg bg-gold text-black font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : item ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
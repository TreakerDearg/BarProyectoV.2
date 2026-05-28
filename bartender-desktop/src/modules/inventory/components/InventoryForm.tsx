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
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 md:p-8 animate-fade-in overflow-y-auto">
      
      {/* ATMOSPHERE */}
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[150px] -z-10 animate-pulse-slow" />
      <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-7xl glass-royale rounded-[3rem] overflow-hidden shadow-royale border border-white/5 animate-float my-auto"
      >
        {/* HEADER */}
        <div className="p-10 md:p-14 bg-surface-3/50 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="p-5 bg-grad-gold rounded-2xl shadow-gold-glow">
              <Package className="text-bg" size={36} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-grad-gold tracking-tighter uppercase leading-none">
                {item ? "Audit de Insumo" : "Ingreso a Bóveda"}
              </h2>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.5em] mt-2">
                Logística Umbra VIP v3.0
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-16 h-16 rounded-full flex items-center justify-center border border-white/10 hover:border-gold-border text-muted hover:text-gold transition-all">
            <X size={32} />
          </button>
        </div>

        <div className="p-12 md:p-16 space-y-12">
          
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                <Target size={14} /> Identificación de Activo
              </p>
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Nombre Estratégico</label>
                  <div className="relative group">
                    <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold transition-colors" size={18} />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ej: Gin Mare Premium"
                      className="input-royale !pl-14"
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Clasificación Umbra</label>
                  <div className="relative group">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold transition-colors" size={18} />
                    <input
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="Ej: Destilados G"
                      className="input-royale !pl-14"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                <ShieldCheck size={14} /> Imagen del Insumo
              </p>
              <ImageUploader
                onImageUpload={handleImageUpload}
                currentImage={formData.image}
                folder="inventory"
                mode="advanced"
                label="Subir foto del insumo"
              />
            </div>
          </div>

          {/* STOCK LOGISTICS */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                <Zap size={14} /> Control de Existencias
              </p>
              <div className={`px-4 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${isCritical ? 'bg-red/10 border-red/30 text-red animate-pulse' : 'bg-lime/10 border-lime/30 text-lime'}`}>
                {isCritical ? 'ESTADO CRÍTICO' : 'ESTADO ESTABLE'}
              </div>
            </div>
            
            <div className="bg-surface-3/30 p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-1">Stock Actual</label>
                  <input name="stock" type="number" value={formData.stock} onChange={handleChange} className="input-royale text-center text-2xl font-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-1">Límite Mínimo</label>
                  <input name="minStock" type="number" value={formData.minStock} onChange={handleChange} className="input-royale text-center text-2xl font-black border-red/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-1">Capacidad Máx</label>
                  <input name="maxStock" type="number" value={formData.maxStock} onChange={handleChange} className="input-royale text-center text-2xl font-black" />
                </div>
              </div>

              {/* DYNAMIC PROGRESS */}
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black text-muted uppercase tracking-widest">
                  <span>Proyección de Bóveda</span>
                  <span className={isCritical ? 'text-red' : 'text-gold'}>{stockPercent.toFixed(0)}% OCUPACIÓN</span>
                </div>
                <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red shadow-red-glow' : 'bg-grad-gold shadow-gold-glow'}`}
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SPECS & ORIGIN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                <ShieldCheck size={14} /> Especificaciones Técnicas
              </p>
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Unidad de Medida</label>
                  <select name="unit" value={formData.unit} onChange={handleChange} className="input-royale appearance-none cursor-pointer">
                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Sector Operativo</label>
                  <select name="sector" value={formData.sector} onChange={handleChange} className="input-royale appearance-none cursor-pointer">
                    {SECTOR_OPTIONS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                <DollarSign size={14} /> Costos y Ubicación
              </p>
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Costo por Unidad</label>
                  <div className="relative group">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-300 transition-colors" size={18} />
                    <input name="cost" type="number" value={formData.cost} onChange={handleChange} className="input-royale !pl-14 text-emerald-400 font-mono font-bold text-xl" />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Ubicación Bóveda</label>
                  <select name="location" value={formData.location} onChange={handleChange} className="input-royale appearance-none cursor-pointer">
                    {LOCATION_OPTIONS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-10 bg-surface-3 border-t border-white/10 flex gap-6 shadow-royale">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-16 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.4em] text-muted hover:text-ivory hover:bg-white/5 transition-all"
          >
            CANCELAR
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] h-16 rounded-[1.5rem] bg-grad-gold text-bg shadow-gold/30 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
            <span className="text-sm font-black uppercase tracking-[0.3em]">{item ? 'CONFIRMAR AUDIT' : 'REGISTRAR INSUMO'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  X, 
  Users, 
  MapPin, 
  AlertCircle, 
  Save, 
  Hash, 
  MessageSquare,
  Tag,
  Plus,
  Maximize,
  Square,
  Circle,
  Layout
} from "lucide-react";
import type { Table } from "../types/table";

interface Props {
  table?: Table | null;
  onSave: (table: Table) => void;
  onClose: () => void;
  existingTables?: Table[];
}

const emptyTable: Table = {
  number: 0,
  capacity: 4,
  status: "available",
  location: "indoor",
  notes: "",
  tags: [],
  _id: "",
  orders: [],
  x: 50,
  y: 50,
  width: 120,
  height: 120,
  shape: "square"
};

export default function TableForm({
  table,
  onSave,
  onClose,
  existingTables = [],
}: Props) {
  const [formData, setFormData] = useState<Table>(emptyTable);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const nextTableNumber = useMemo(() => {
    const numbers = existingTables.map((t) => t.number || 0);
    return numbers.length ? Math.max(...numbers) + 1 : 1;
  }, [existingTables]);

  useEffect(() => {
    if (table) {
      setFormData({
        ...emptyTable,
        ...table,
        tags: table.tags || [],
      });
    } else {
      setFormData({
        ...emptyTable,
        number: nextTableNumber,
      });
    }
  }, [table, nextTableNumber]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["capacity", "number", "x", "y", "width", "height"].includes(name) ? Number(value) : value,
    }));
  };

  const addTag = () => {
    const val = tagInput.trim().toLowerCase();
    if (!val || formData.tags?.some(t => t.label === val)) return;
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), { label: val, type: "other", priority: "low" }]
    }));
    setTagInput("");
  };

  const removeTag = (label: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t.label !== label)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.capacity < 1) {
      setError("La capacidad mínima debe ser de 1 persona.");
      return;
    }

    if (!table && existingTables.some(t => t.number === formData.number)) {
      setError(`El número de mesa ${formData.number} ya se encuentra registrado.`);
      return;
    }

    onSave(formData);
  };

  return (
    <div className="w-full max-w-5xl glass-royale rounded-[3rem] border-white/5 overflow-hidden shadow-royale relative">
      {/* HEADER */}
      <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-surface-3/50">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-grad-gold shadow-gold-glow">
            <Layout size={28} className="text-bg" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-grad-gold tracking-tight uppercase leading-none">
              {table ? "Configurar Activo" : "Registrar Activo"}
            </h2>
            <p className="text-[10px] text-muted font-bold uppercase tracking-[0.3em] mt-2">
              Management · Central Core
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-14 h-14 rounded-full flex items-center justify-center hover:bg-white/5 hover:text-gold transition-all border border-white/5"
        >
          <X size={28} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest flex items-center gap-3 animate-fade-in">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* SECTION 1: BASIC SPECS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="space-y-6">
              <div className="flex items-center gap-2">
                 <Hash size={12} className="text-gold opacity-50" />
                 <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Especificaciones Base</h3>
              </div>

             <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Identificador</label>
                 <div className="relative">
                   <Hash size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold/50" />
                   <input
                     type="number"
                     name="number"
                     value={formData.number}
                     onChange={handleChange}
                     className="input !pl-14 !py-4 rounded-2xl border-white/5"
                     placeholder="0"
                     required
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Capacidad Máxima</label>
                 <div className="relative">
                   <Users size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold/50" />
                   <input
                     type="number"
                     name="capacity"
                     value={formData.capacity}
                     onChange={handleChange}
                     className="input !pl-14 !py-4 rounded-2xl border-white/5"
                     min="1"
                     required
                   />
                 </div>
               </div>
             </div>
           </div>

           <div className="space-y-6">
              <div className="flex items-center gap-2">
                 <Maximize size={12} className="text-gold opacity-50" />
                 <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Atributos Físicos (Plano)</h3>
              </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Forma</label>
                   <div className="grid grid-cols-3 gap-3">
                     {[
                       { val: 'rect', icon: <Square size={20} />, label: 'Rectángulo' },
                       { val: 'circle', icon: <Circle size={20} />, label: 'Círculo' },
                       { val: 'square', icon: <Square size={20} className="rotate-45" />, label: 'Cuadrado' }
                     ].map((s) => (
                       <button
                         key={s.val}
                         type="button"
                         onClick={() => setFormData(prev => ({ ...prev, shape: s.val as any }))}
                         className={`
                           flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 aspect-square
                           ${formData.shape === s.val
                             ? "bg-gold/10 border-gold/40 text-gold shadow-gold-glow/20"
                             : "bg-white/5 border-white/10 text-muted hover:border-white/20 hover:bg-white/10"}
                         `}
                       >
                         <div className={`p-3 rounded-xl ${formData.shape === s.val ? "bg-gold/20" : "bg-white/5"}`}>
                           {s.icon}
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-wider">{s.label}</span>
                       </button>
                     ))}
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Ubicación</label>
                   <div className="relative">
                      <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold/50" />
                      <select
                         name="location"
                         value={formData.location}
                         onChange={handleChange}
                         className="input !pl-14 !py-4 rounded-2xl border-white/5 appearance-none cursor-pointer"
                      >
                         <option value="indoor">Salón Interior</option>
                         <option value="outdoor">Terraza / Exterior</option>
                         <option value="bar">Barra / Counter</option>
                      </select>
                   </div>
                </div>

                {/* Dimensiones Físicas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Ancho (px)</label>
                    <input
                      type="number"
                      name="width"
                      value={formData.width || 120}
                      onChange={handleChange}
                      className="input !py-3 rounded-xl border-white/5 text-center text-xs font-bold"
                      min="60"
                      max="250"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Alto (px)</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height || 120}
                      onChange={handleChange}
                      className="input !py-3 rounded-xl border-white/5 text-center text-xs font-bold"
                      min="60"
                      max="250"
                      required
                    />
                  </div>
                </div>
             </div>
           </div>
        </div>

        {/* SECTION 2: NOTES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={12} className="text-gold opacity-50" />
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Notas de Activo</h3>
          </div>
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            className="input !p-6 min-h-[120px] resize-none rounded-[2rem] border-white/5 bg-black/20"
            placeholder="Especificaciones técnicas o detalles especiales..."
          />
        </div>

        {/* SECTION 3: TAGS */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <Tag size={12} className="text-gold opacity-50" />
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Etiquetas de Alerta Alimentaria</h3>
           </div>
           
           {/* Preset Tags for Food Allergies/Diets */}
           <div className="flex flex-wrap gap-2">
              {[
                { label: "Celíaco", type: "allergy" as const, priority: "high" as const },
                { label: "Alergia frutos secos", type: "allergy" as const, priority: "high" as const },
                { label: "Alergia mariscos", type: "allergy" as const, priority: "high" as const },
                { label: "Sin lactosa", type: "diet" as const, priority: "medium" as const },
                { label: "Vegetariano", type: "diet" as const, priority: "medium" as const },
              ].map((preset) => {
                const isActive = formData.tags?.some(t => t.label === preset.label);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => isActive ? removeTag(preset.label) : setFormData(prev => ({
                      ...prev,
                      tags: [...(prev.tags || []), { label: preset.label, type: preset.type, priority: preset.priority }]
                    }))}
                    className={`
                      px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all
                      ${isActive
                        ? preset.priority === 'high'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : 'bg-white/5 text-muted border-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    {preset.label}
                  </button>
                );
              })}
           </div>

           {/* Custom Tag Input */}
           <div className="flex gap-4 pt-2">
             <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input !px-6 !py-4 rounded-2xl border-white/5 bg-white/5 flex-1"
                placeholder="Añadir etiqueta personalizada..."
             />
             <button
                type="button"
                onClick={addTag}
                className="btn btn-ghost !p-4 rounded-2xl border border-white/5"
             >
                <Plus size={20} />
             </button>
           </div>

           {/* All Tags Display */}
           <div className="flex flex-wrap gap-2">
              {formData.tags?.map((t, i) => (
                <span key={i} className={`
                  px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-3 border
                  ${t.priority === 'high'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : t.priority === 'medium'
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    : 'bg-white/5 text-gold/80 border-white/10'
                  }
                `}>
                  {t.label}
                  <button type="button" onClick={() => removeTag(t.label)} className="hover:text-white transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
           </div>
        </div>

        {/* FINAL ACTIONS */}
        <div className="pt-6 grid grid-cols-2 gap-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost !py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest border border-white/5 hover:bg-white/5"
          >
            Descartar
          </button>
          <button
            type="submit"
            className="btn btn-gold !py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-gold-glow flex items-center justify-center gap-3"
          >
            <Save size={20} />
            {table ? "Actualizar" : "Registrar Mesa"}
          </button>
        </div>
      </form>
    </div>
  );
}
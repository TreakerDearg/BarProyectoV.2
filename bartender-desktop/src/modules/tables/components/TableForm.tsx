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
    <div className="w-full max-w-4xl glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative">
      {/* HEADER */}
      <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center bg-surface-3/50">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gold/15 text-gold">
            <Layout size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-ivory tracking-tight">
              {table ? "Editar mesa" : "Nueva mesa"}
            </h2>
            <p className="text-xs text-muted mt-1">
              {table ? `Mesa ${table.number}` : `Mesa ${nextTableNumber}`}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X size={20} className="text-muted" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest flex items-center gap-3 animate-fade-in">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* SECTION 1: BASIC SPECS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <Hash size={12} className="text-gold opacity-50" />
                 <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Información básica</h3>
              </div>

             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Número de mesa</label>
                 <div className="relative">
                   <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" />
                   <input
                     type="number"
                     name="number"
                     value={formData.number}
                     onChange={handleChange}
                     className="input !pl-12 !py-3 rounded-xl border-white/5"
                     placeholder="0"
                     required
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Capacidad</label>
                 <div className="relative">
                   <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" />
                   <input
                     type="number"
                     name="capacity"
                     value={formData.capacity}
                     onChange={handleChange}
                     className="input !pl-12 !py-3 rounded-xl border-white/5"
                     min="1"
                     required
                   />
                 </div>
               </div>
             </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <Maximize size={12} className="text-gold opacity-50" />
                 <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Ubicación</h3>
              </div>

             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Zona</label>
                   <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" />
                      <select
                         name="location"
                         value={formData.location}
                         onChange={handleChange}
                         className="input !pl-12 !py-3 rounded-xl border-white/5 appearance-none cursor-pointer"
                      >
                         <option value="indoor">Salón interior</option>
                         <option value="outdoor">Terraza</option>
                         <option value="bar">Barra</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Forma</label>
                   <div className="grid grid-cols-3 gap-2">
                     {[
                       { val: 'rect', icon: <Square size={18} />, label: 'Rect' },
                       { val: 'circle', icon: <Circle size={18} />, label: 'Círc' },
                       { val: 'square', icon: <Square size={18} className="rotate-45" />, label: 'Cuad' }
                     ].map((s) => (
                       <button
                         key={s.val}
                         type="button"
                         onClick={() => setFormData(prev => ({ ...prev, shape: s.val as any }))}
                         className={`
                           flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 aspect-square
                           ${formData.shape === s.val
                             ? "bg-gold/10 border-gold/40 text-gold"
                             : "bg-white/5 border-white/10 text-muted hover:border-white/20 hover:bg-white/10"}
                         `}
                       >
                         <div className={`p-2 rounded-lg ${formData.shape === s.val ? "bg-gold/20" : "bg-white/5"}`}>
                           {s.icon}
                         </div>
                         <span className="text-[8px] font-black uppercase tracking-wider">{s.label}</span>
                       </button>
                     ))}
                   </div>
                </div>
             </div>
           </div>
        </div>

        {/* SECTION 2: NOTES */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={12} className="text-gold opacity-50" />
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Notas</h3>
          </div>
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            className="input !p-4 min-h-[80px] resize-none rounded-xl border-white/5 bg-black/20"
            placeholder="Detalles adicionales..."
          />
        </div>

        {/* FINAL ACTIONS */}
        <div className="pt-4 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost !py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-white/5 hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-gold !py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-gold-glow flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {table ? "Guardar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}
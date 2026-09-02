"use client";

import { useEffect, useState, useMemo } from "react";
import {
  X, Users, MapPin, Save, Hash, MessageSquare,
  Square, Circle, Layout, ChevronRight, Check,
  GlassWater, Flame, Sofa,
} from "lucide-react";
import type { Table } from "../types/table";

interface Props {
  table?: Table | null;
  onSave: (table: Table) => void;
  onClose: () => void;
  existingTables?: Table[];
}

const EMPTY: Table = {
  number:   0,
  capacity: 4,
  status:   "available",
  location: "indoor",
  notes:    "",
  tags:     [],
  _id:      "",
  orders:   [],
  x:        50,
  y:        50,
  width:    120,
  height:   120,
  shape:    "square",
};

// ── Sub-componentes de sección ────────────────────────────────────

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 rounded-lg bg-gold/10 border border-gold/20 text-gold">{icon}</div>
      <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em]">{title}</h3>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">
      {children}{required && <span className="text-gold ml-1">*</span>}
    </label>
  );
}

function InputField({
  icon, type = "text", name, value, onChange, placeholder, min, max, required, className = "",
}: {
  icon?: React.ReactNode; type?: string; name: string; value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; min?: number; max?: number; required?: boolean; className?: string;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/50 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        required={required}
        className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-ivory text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/10 outline-none transition-all placeholder:text-muted/40 ${icon ? "pl-10 pr-4" : "px-4"} ${className}`}
      />
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────

export default function TableForm({ table, onSave, onClose, existingTables = [] }: Props) {
  const [formData, setFormData] = useState<Table>(EMPTY);
  const [error,    setError]    = useState<string | null>(null);

  const nextNumber = useMemo(() => {
    const nums = existingTables.map((t) => t.number || 0);
    return nums.length ? Math.max(...nums) + 1 : 1;
  }, [existingTables]);

  useEffect(() => {
    setFormData(table
      ? { ...EMPTY, ...table, tags: table.tags || [] }
      : { ...EMPTY, number: nextNumber }
    );
    setError(null);
  }, [table, nextNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = ["capacity", "number", "x", "y", "width", "height"];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.number || formData.number <= 0) {
      setError("El número de mesa es obligatorio"); return;
    }
    if (formData.capacity < 1) {
      setError("La capacidad mínima es 1 persona"); return;
    }
    if (!table && existingTables.some((t) => t.number === formData.number)) {
      setError(`La Mesa #${formData.number} ya existe`); return;
    }
    onSave(formData);
  };

  const LOCATION_OPTIONS = [
    { value: "indoor",  label: "Salón interior", icon: <Sofa       size={16} />, color: "text-violet-400 border-violet-500/30 bg-violet-500/10"  },
    { value: "outdoor", label: "Terraza",         icon: <GlassWater size={16} />, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"},
    { value: "bar",     label: "Barra",           icon: <Flame      size={16} />, color: "text-amber-400 border-amber-500/30 bg-amber-500/10"     },
  ];

  const SHAPE_OPTIONS = [
    { value: "rect",   label: "Rectangular", icon: <Square size={20} className="scale-x-125" />    },
    { value: "square", label: "Cuadrada",    icon: <Square size={20} />                             },
    { value: "circle", label: "Circular",    icon: <Circle size={20} />                             },
  ];

  const CAPACITY_PRESETS = [2, 4, 6, 8];

  return (
    <div className="w-full bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 bg-surface-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gold/15 border border-gold/25 text-gold">
            <Layout size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ivory">
              {table ? `Editar Mesa #${table.number}` : "Registrar nueva mesa"}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {table ? "Modificar configuración del activo" : `Se asignará como Mesa #${nextNumber}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted hover:text-ivory transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* BODY — dos columnas en desktop, una en mobile */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "thin" }}
      >
        {/* Error global */}
        {error && (
          <div className="mx-6 mt-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            <X size={15} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/6">

          {/* ── COLUMNA IZQUIERDA ──────────────────────────────── */}
          <div className="p-6 space-y-6">

            {/* Número y capacidad */}
            <div>
              <SectionHeader title="Identificación" icon={<Hash size={15} />} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Número de mesa</FieldLabel>
                  <InputField
                    icon={<Hash size={15} />}
                    type="number"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder={String(nextNumber)}
                    min={1}
                    required
                  />
                </div>
                <div>
                  <FieldLabel required>Capacidad (personas)</FieldLabel>
                  <InputField
                    icon={<Users size={15} />}
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min={1}
                    max={30}
                    required
                  />
                </div>
              </div>

              {/* Presets de capacidad */}
              <div className="flex gap-2 mt-3">
                {CAPACITY_PRESETS.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, capacity: cap }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.capacity === cap
                        ? "bg-gold/20 border-gold/40 text-gold"
                        : "bg-white/5 border-white/10 text-muted hover:border-white/20 hover:text-ivory"
                    }`}
                  >
                    {cap} <span className="text-[9px] font-normal">pax</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <SectionHeader title="Ubicación" icon={<MapPin size={15} />} />
              <div className="space-y-2">
                {LOCATION_OPTIONS.map((loc) => (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, location: loc.value as Table["location"] }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      formData.location === loc.value
                        ? loc.color
                        : "bg-white/3 border-white/8 text-muted hover:bg-white/8 hover:text-ivory"
                    }`}
                  >
                    <span className={formData.location === loc.value ? "" : "text-muted/50"}>
                      {loc.icon}
                    </span>
                    {loc.label}
                    {formData.location === loc.value && (
                      <Check size={14} className="ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ── COLUMNA DERECHA ────────────────────────────────── */}
          <div className="p-6 space-y-6">

            {/* Forma */}
            <div>
              <SectionHeader title="Forma de la mesa" icon={<Square size={15} />} />
              <div className="grid grid-cols-3 gap-3">
                {SHAPE_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, shape: s.value as Table["shape"] }))}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all aspect-square ${
                      formData.shape === s.value
                        ? "bg-gold/15 border-gold/40 text-gold"
                        : "bg-white/4 border-white/8 text-muted/60 hover:border-white/20 hover:text-muted"
                    }`}
                  >
                    <span className={formData.shape === s.value ? "text-gold" : ""}>{s.icon}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <SectionHeader title="Notas de servicio" icon={<MessageSquare size={15} />} />
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                placeholder="Observaciones de la mesa, preferencias de la zona…"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/10 outline-none transition-all resize-none placeholder:text-muted/40"
              />
            </div>

            {/* Vista previa del código actual si la mesa ya está abierta */}
            {table?.tableCode && table.status === "occupied" && (
              <div className="p-4 rounded-xl bg-gold/8 border border-gold/25 text-center">
                <p className="text-[9px] font-black text-gold/60 uppercase tracking-[0.3em] mb-1">Código activo</p>
                <p className="text-4xl font-black text-gold tracking-[0.25em] font-mono">{table.tableCode}</p>
                <p className="text-[10px] text-muted/60 mt-1">Se regenera al abrir una nueva sesión</p>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between gap-3 px-6 py-5 border-t border-white/8 bg-surface-2 flex-shrink-0">
          <div className="text-xs text-muted">
            {table ? "Los cambios se aplican al instante" : "Se asigna el próximo número disponible"}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-muted hover:text-ivory text-sm font-semibold transition-colors hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg,#8F7020 0%,#D4AF37 55%,#E6C766 100%)",
                color: "#09090B",
                boxShadow: "0 4px 16px rgba(212,163,64,0.25)",
              }}
            >
              <Save size={15} />
              {table ? "Guardar cambios" : "Crear mesa"}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

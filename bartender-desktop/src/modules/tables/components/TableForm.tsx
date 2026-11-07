"use client";

/**
 * TableForm — Formulario de creación / edición de mesa.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Lógica completamente preservada. Solo cambian colores, bordes y fondos.
 */
import { useState, useMemo } from "react";
import {
  X, Users, MapPin, Save, Hash, MessageSquare,
  Square, Circle, Layout, ChevronRight, Check,
  GlassWater, Flame, Sofa,
} from "lucide-react";
import type { Table } from "../types/table";

interface Props {
  table?:          Table | null;
  onSave:          (table: Table) => void;
  onClose:         () => void;
  existingTables?: Table[];
}

const EMPTY: Table = {
  number: 0, capacity: 4, status: "available",
  location: "indoor", notes: "", tags: [], _id: "",
  orders: [], x: 50, y: 50, width: 120, height: 120, shape: "square",
};

/* ── Sub-componentes ────────────────────────────────────────── */
function SectionLabel({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div
        className="p-1.5 rounded-lg"
        style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.25)", color: "#F0B429" }}
      >
        {icon}
      </div>
      <h3 className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "#566270" }}>
        {children}
      </h3>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#566270" }}>
      {children}
      {required && <span style={{ color: "#F0B429" }} className="ml-1">*</span>}
    </label>
  );
}

function InputField({
  icon, type = "text", name, value, onChange, placeholder, min, max, required,
}: {
  icon?: React.ReactNode; type?: string; name: string; value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; min?: number; max?: number; required?: boolean;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(240,180,41,0.50)" }}>
          {icon}
        </span>
      )}
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} min={min} max={max} required={required}
        className="w-full rounded-xl py-3 text-sm outline-none transition-all"
        style={{
          background:  "#21283A",
          border:      "1px solid #30363D",
          color:       "#E6EDF3",
          paddingLeft: icon ? "2.5rem" : "1rem",
          paddingRight:"1rem",
        }}
        onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(240,180,41,0.50)"; }}
        onBlur={(e)  => { (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D"; }}
      />
    </div>
  );
}

/* ── Componente principal ───────────────────────────────────── */
export default function TableForm({ table, onSave, onClose, existingTables = [] }: Props) {
  const nextNumber = useMemo(() => {
    const nums = existingTables.map((t) => t.number || 0);
    return nums.length ? Math.max(...nums) + 1 : 1;
  }, [existingTables]);

  const initialFormData = useMemo(() => table
    ? { ...EMPTY, ...table, tags: table.tags || [] }
    : { ...EMPTY, number: nextNumber },
  [table, nextNumber]);

  const [formData, setFormData] = useState<Table>(initialFormData);
  const [error,    setError]    = useState<string | null>(null);

  const resetForm = () => { setFormData(initialFormData); setError(null); };

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
    if (!formData.number || formData.number <= 0) { setError("El número de mesa es obligatorio"); return; }
    if (formData.capacity < 1)                    { setError("La capacidad mínima es 1 persona"); return; }
    if (!table && existingTables.some((t) => t.number === formData.number)) {
      setError(`La Mesa #${formData.number} ya existe`); return;
    }
    onSave(formData);
  };

  const LOCATION_OPTIONS = [
    { value: "indoor",  label: "Salón interior", icon: <Sofa size={15} />,       color: "#A371F7", bg: "rgba(163,113,247,0.10)", border: "rgba(163,113,247,0.30)" },
    { value: "outdoor", label: "Terraza",         icon: <GlassWater size={15} />, color: "#3FB950", bg: "rgba(63,185,80,0.10)",   border: "rgba(63,185,80,0.30)"   },
    { value: "bar",     label: "Barra",           icon: <Flame size={15} />,      color: "#F0B429", bg: "rgba(240,180,41,0.10)",  border: "rgba(240,180,41,0.30)"  },
  ];

  const SHAPE_OPTIONS = [
    { value: "rect",   label: "Rectangular", icon: <Square size={22} className="scale-x-125" /> },
    { value: "square", label: "Cuadrada",    icon: <Square size={22} /> },
    { value: "circle", label: "Circular",    icon: <Circle size={22} /> },
  ];

  const CAPACITY_PRESETS = [2, 4, 6, 8];

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      style={{ background: "#1C2333", border: "1px solid #30363D" }}
    >

      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-5 flex-shrink-0"
        style={{ borderBottom: "1px solid #30363D", background: "#161B22" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: "rgba(240,180,41,0.15)", border: "1px solid rgba(240,180,41,0.25)", color: "#F0B429" }}
          >
            <Layout size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#E6EDF3" }}>
              {table ? `Editar Mesa #${table.number}` : "Registrar nueva mesa"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#566270" }}>
              {table ? "Modificar configuración" : `Se asignará como Mesa #${nextNumber}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: "#21283A", border: "1px solid #30363D", color: "#566270" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
        >
          <X size={17} />
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}>

        {/* Error */}
        {error && (
          <div
            className="mx-6 mt-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(248,81,73,0.10)", border: "1px solid rgba(248,81,73,0.30)", color: "#FF6B63" }}
          >
            <X size={14} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderTop: error ? "none" : undefined }}>

          {/* ── Columna izquierda ──────────────────────────── */}
          <div className="p-6 space-y-6" style={{ borderRight: "1px solid #30363D" }}>

            {/* Número y capacidad */}
            <div>
              <SectionLabel icon={<Hash size={14} />}>Identificación</SectionLabel>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Número de mesa</FieldLabel>
                  <InputField
                    icon={<Hash size={14} />}
                    type="number" name="number" value={formData.number}
                    onChange={handleChange} placeholder={String(nextNumber)} min={1} required
                  />
                </div>
                <div>
                  <FieldLabel required>Capacidad</FieldLabel>
                  <InputField
                    icon={<Users size={14} />}
                    type="number" name="capacity" value={formData.capacity}
                    onChange={handleChange} min={1} max={30} required
                  />
                </div>
              </div>

              {/* Presets de capacidad */}
              <div className="flex gap-2 mt-3">
                {CAPACITY_PRESETS.map((cap) => {
                  const isActive = formData.capacity === cap;
                  return (
                    <button
                      key={cap} type="button"
                      onClick={() => setFormData((p) => ({ ...p, capacity: cap }))}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background:  isActive ? "rgba(240,180,41,0.20)" : "#21283A",
                        border:      `1px solid ${isActive ? "rgba(240,180,41,0.40)" : "#30363D"}`,
                        color:       isActive ? "#F0B429" : "#566270",
                      }}
                    >
                      {cap} <span style={{ fontSize: 9, fontWeight: 400 }}>pax</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <SectionLabel icon={<MapPin size={14} />}>Ubicación</SectionLabel>
              <div className="space-y-2">
                {LOCATION_OPTIONS.map((loc) => {
                  const isActive = formData.location === loc.value;
                  return (
                    <button
                      key={loc.value} type="button"
                      onClick={() => setFormData((p) => ({ ...p, location: loc.value as Table["location"] }))}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                      style={{
                        background:  isActive ? loc.bg     : "#21283A",
                        border:      `1px solid ${isActive ? loc.border : "#30363D"}`,
                        color:       isActive ? loc.color : "#8B949E",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = loc.border;
                          (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363D";
                          (e.currentTarget as HTMLButtonElement).style.color = "#8B949E";
                        }
                      }}
                    >
                      <span style={{ color: isActive ? loc.color : "#566270" }}>{loc.icon}</span>
                      {loc.label}
                      {isActive && <Check size={14} className="ml-auto" style={{ color: loc.color }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Columna derecha ────────────────────────────── */}
          <div className="p-6 space-y-6">

            {/* Forma */}
            <div>
              <SectionLabel icon={<Square size={14} />}>Forma de la mesa</SectionLabel>
              <div className="grid grid-cols-3 gap-3">
                {SHAPE_OPTIONS.map((s) => {
                  const isActive = formData.shape === s.value;
                  return (
                    <button
                      key={s.value} type="button"
                      onClick={() => setFormData((p) => ({ ...p, shape: s.value as Table["shape"] }))}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all aspect-square"
                      style={{
                        background:  isActive ? "rgba(240,180,41,0.15)" : "#21283A",
                        borderColor: isActive ? "rgba(240,180,41,0.50)" : "#30363D",
                        color:       isActive ? "#F0B429"               : "rgba(139,148,158,0.60)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) (e.currentTarget as HTMLButtonElement).style.borderColor = "#3D444D";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363D";
                      }}
                    >
                      {s.icon}
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notas */}
            <div>
              <SectionLabel icon={<MessageSquare size={14} />}>Notas de servicio</SectionLabel>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                placeholder="Observaciones de la mesa, preferencias de la zona…"
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                style={{
                  background: "#21283A",
                  border:     "1px solid #30363D",
                  color:      "#E6EDF3",
                }}
                onFocus={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(240,180,41,0.50)"; }}
                onBlur={(e)  => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "#30363D"; }}
              />
            </div>

            {/* Código activo (solo si la mesa está abierta) */}
            {table?.tableCode && table.status === "occupied" && (
              <div
                className="p-4 rounded-xl text-center"
                style={{ background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.25)" }}
              >
                <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(240,180,41,0.60)" }}>
                  Código activo
                </p>
                <p className="text-4xl font-black tracking-[0.25em] font-mono" style={{ color: "#F0B429" }}>
                  {table.tableCode}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "#566270" }}>
                  Se regenera al abrir una nueva sesión
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div
          className="flex items-center justify-between gap-3 px-6 py-5 flex-shrink-0"
          style={{ borderTop: "1px solid #30363D", background: "#161B22" }}
        >
          <p className="text-xs" style={{ color: "#566270" }}>
            {table ? "Los cambios se aplican al instante" : "Se asigna el próximo número disponible"}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ border: "1px solid #30363D", color: "#8B949E", background: "transparent" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
              style={{
                background: "#F0B429",
                color:      "#0D1117",
                boxShadow:  "0 4px 16px rgba(240,180,41,0.25)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F5C842"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0B429"; }}
            >
              <Save size={14} />
              {table ? "Guardar cambios" : "Crear mesa"}
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

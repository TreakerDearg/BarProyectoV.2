"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  User,
  Phone,
  Users,
  Calendar,
  Clock,
  FileText,
  Loader2,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Crown,
  Wallet,
  Star,
  Timer,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import type { Reservation } from "../types/reservation";
import { getAvailableTables } from "../services/reservationService";

/* =========================
   TYPES
========================= */
interface TableOption {
  _id: string;
  number: number;
  capacity: number;
  location?: string;
}

interface Props {
  reservation?: Reservation | null;
  onSave: (reservation: any) => void;
  onClose: () => void;
}

/* =========================
   DURATION PRESETS
========================= */
const DURATION_PRESETS = [
  { label: "1h", hours: 1, desc: "Rápida" },
  { label: "1.5h", hours: 1.5, desc: "Normal" },
  { label: "2h", hours: 2, desc: "Estándar" },
  { label: "3h", hours: 3, desc: "Extendida" },
];

/* =========================
   LOCATION LABELS
========================= */
const LOCATION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  indoor: { label: "Interior / Salón", icon: "🏠", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  outdoor: { label: "Terraza / Exterior", icon: "☀️", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  bar: { label: "Barra / Bar", icon: "🍸", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  vip: { label: "Zona VIP", icon: "👑", color: "text-gold bg-gold/10 border-gold/20" },
  terraza: { label: "Terraza", icon: "🌿", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

const getLocationConfig = (loc: string) => {
  const key = loc?.toLowerCase() || "indoor";
  return LOCATION_LABELS[key] || { label: loc || "Otra Zona", icon: "📍", color: "text-muted bg-white/5 border-white/10" };
};

/* =========================
   COMPONENT
========================= */
export default function ReservationForm({
  reservation,
  onSave,
  onClose,
}: Props) {
  const [formData, setFormData] = useState<any>({
    customerName: "",
    customerPhone: "",
    startTime: "",
    endTime: "",
    guests: 1,
    tableId: "",
    notes: "",
    isVIP: false,
    deposit: 0,
  });

  const [tables, setTables] = useState<TableOption[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const isEditing = Boolean(reservation?._id);

  /* =========================
     INIT EDIT
  ========================= */
  useEffect(() => {
    if (!reservation) return;

    const startStr = reservation.startTime?.slice(0, 16) || "";
    const endStr = reservation.endTime?.slice(0, 16) || "";

    setFormData({
      customerName: reservation.customerName || "",
      customerPhone: reservation.customerPhone || "",
      startTime: startStr,
      endTime: endStr,
      guests: reservation.guests || 1,
      tableId: (reservation as any).table?._id || (typeof reservation.tableId === 'object' && reservation.tableId ? reservation.tableId._id : reservation.tableId) || "",
      notes: reservation.notes || "",
      isVIP: (reservation as any).isVIP || false,
      deposit: (reservation as any).deposit || 0,
    });

    // Detect preset duration
    if (startStr && endStr) {
      const diffMs = new Date(endStr).getTime() - new Date(startStr).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const matchingPreset = DURATION_PRESETS.find(p => Math.abs(p.hours - diffHours) < 0.1);
      if (matchingPreset) setSelectedDuration(matchingPreset.hours);
    }
  }, [reservation]);

  /* =========================
     APPLY DURATION PRESET
  ========================= */
  const applyDuration = (hours: number) => {
    setSelectedDuration(hours);

    if (!formData.startTime) return;

    const start = new Date(formData.startTime);
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);

    setFormData((prev: any) => ({
      ...prev,
      endTime: end.toISOString().slice(0, 16),
    }));
  };

  /* =========================
     AUTO END TIME (only if no preset selected and endTime is empty)
  ========================= */
  useEffect(() => {
    if (!formData.startTime || formData.endTime) return;

    const start = new Date(formData.startTime);
    const defaultHours = selectedDuration || 2;
    const end = new Date(start.getTime() + defaultHours * 60 * 60 * 1000);

    setFormData((prev: any) => ({
      ...prev,
      endTime: end.toISOString().slice(0, 16),
    }));

    if (!selectedDuration) setSelectedDuration(2);
  }, [formData.startTime]);

  /* =========================
     VALIDATION
  ========================= */
  const validation = useMemo(() => {
    const errors: string[] = [];

    if (!formData.customerName) errors.push("Nombre requerido");
    if (!formData.customerPhone) errors.push("Teléfono requerido");

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (!formData.startTime || !formData.endTime)
      errors.push("Horario incompleto");

    if (end <= start) errors.push("Horario inválido");

    return {
      valid: errors.length === 0,
      errors,
    };
  }, [formData]);

  /* =========================
     CAPACITY WARNING
  ========================= */
  const capacityWarning = useMemo(() => {
    if (!formData.tableId || tables.length === 0) return null;
    const selectedTable = tables.find(t => t._id === formData.tableId);
    if (!selectedTable) return null;
    if (formData.guests > selectedTable.capacity) {
      return {
        type: "danger" as const,
        message: `⚠️ La Mesa ${selectedTable.number} tiene capacidad para ${selectedTable.capacity} personas, pero se asignan ${formData.guests} invitados.`,
      };
    }
    if (formData.guests === selectedTable.capacity) {
      return {
        type: "warning" as const,
        message: `Mesa ${selectedTable.number} estará a capacidad máxima (${selectedTable.capacity}/${selectedTable.capacity}).`,
      };
    }
    return null;
  }, [formData.tableId, formData.guests, tables]);

  /* =========================
     GROUP TABLES BY LOCATION
  ========================= */
  const groupedTables = useMemo(() => {
    const groups: Record<string, TableOption[]> = {};
    for (const t of tables) {
      const loc = (t.location || "indoor").toLowerCase();
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(t);
    }
    // Sort tables within each group by number
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => a.number - b.number);
    }
    return groups;
  }, [tables]);

  /* =========================
     FETCH TABLES
  ========================= */
  useEffect(() => {
    const fetchTables = async () => {
      if (!validation.valid) return;

      try {
        setLoadingTables(true);

        const data = await getAvailableTables({
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          guests: Number(formData.guests),
        });

        setTables(data || []);

        if (data?.length === 1 && !formData.tableId) {
          setFormData((prev: any) => ({
            ...prev,
            tableId: data[0]._id,
          }));
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingTables(false);
      }
    };

    const t = setTimeout(fetchTables, 300);
    return () => clearTimeout(t);
  }, [formData.startTime, formData.endTime, formData.guests]);

  /* =========================
     HANDLER
  ========================= */
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "guests" || name === "deposit" ? Number(value) : value),
    }));
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);

    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    try {
      setLoading(true);

      await onSave({
        ...formData,
        _id: reservation?._id, // Pass ID so parent can decide PUT vs POST
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 md:p-8 animate-fade-in overflow-y-auto">
      
      {/* BACKGROUND GLOWS FOR MODAL */}
      <div className="fixed top-1/4 left-1/4 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
      <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" />

      <form
        onSubmit={handleSubmit}
        className={`
          w-full max-w-3xl bg-surface-2 rounded-[2.5rem] overflow-hidden shadow-royale animate-float border border-white/5
          ${formData.isVIP ? 'border-gold/30' : ''}
          transition-all duration-700 my-auto
        `}
      >
        {/* HEADER (ROYALE DESIGN) */}
        <div className={`p-8 border-b border-white/5 flex justify-between items-center ${formData.isVIP ? 'bg-grad-gold' : 'bg-surface-3'}`}>
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${formData.isVIP ? 'bg-bg text-gold shadow-2xl scale-110' : 'bg-gold-soft text-gold shadow-gold-glow'}`}>
              {formData.isVIP ? <Crown size={32} /> : <Star size={32} />}
            </div>
            <div>
              <h2 className={`text-3xl font-black tracking-tighter uppercase leading-none ${formData.isVIP ? 'text-bg' : 'text-grad-gold'}`}>
                {isEditing ? "Modificar Reserva" : "Nueva Reservación"}
              </h2>
              <p className={`text-[10px] font-black uppercase tracking-[0.5em] mt-2 ${formData.isVIP ? 'text-bg/60' : 'text-muted'}`}>
                {isEditing ? `EDITANDO · ID: ${reservation?._id?.slice(-8)}` : "Sistema de Ingreso Casino Royale"}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${formData.isVIP ? 'border-bg/20 hover:bg-bg/10 text-bg' : 'border-white/10 hover:border-gold-border text-muted hover:text-gold'}`}
          >
            <X size={28} />
          </button>
        </div>

        {/* CONTENT (SCROLLABLE AREA) */}
        <div className="p-100 md:p-44 space-y-22 max-h-[65vh] overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(212,163,64,0.03)_0%,transparent_50%)]">
          
          {/* ERROR FEEDBACK */}
          {error && (
            <div className="glass-red p-5 rounded-2xl flex items-center gap-5 animate-shake border-brand/30 shadow-lg shadow-brand/10">
              <AlertTriangle size={24} className="text-brand" />
              <p className="text-sm font-black uppercase tracking-widest text-ivory/90">{error}</p>
            </div>
          )}

          {/* CAPACITY WARNING */}
          {capacityWarning && (
            <div className={`p-5 rounded-2xl flex items-center gap-5 border ${
              capacityWarning.type === "danger" 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}>
              <AlertCircle size={24} className={capacityWarning.type === "danger" ? "text-red-500 animate-pulse" : "text-amber-500"} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                  {capacityWarning.type === "danger" ? "⚠️ Conflicto de Capacidad" : "Capacidad Ajustada"}
                </p>
                <p className="text-xs font-bold">{capacityWarning.message}</p>
              </div>
            </div>
          )}

          {/* VIP TOGGLE (HIGH ROLLER) */}
          <div className="flex items-center justify-between bg-surface-3/30 p-8 rounded-[2.5rem] border border-white/5 group hover:border-gold/20 transition-all shadow-inner">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${formData.isVIP ? 'bg-grad-gold text-bg shadow-gold-glow scale-110' : 'bg-surface-4 text-muted border border-white/5'}`}>
                <Crown size={28} className={formData.isVIP ? 'fill-current' : ''} />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black text-ivory uppercase tracking-tighter">Estado VIP / High Roller</p>
                <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em]">Tratamiento prioritario · Mesa Premium</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="isVIP" 
                checked={formData.isVIP} 
                onChange={handleChange} 
                className="sr-only peer"
              />
              <div className="w-16 h-9 bg-surface-4 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[6px] after:bg-muted after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gold peer-checked:after:bg-bg peer-checked:after:border-transparent" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* IDENTIFICATION COLUMN */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-gold">
                <div className="w-1.5 h-6 bg-gold rounded-full shadow-gold-glow" />
                <p className="text-xs font-black uppercase tracking-[0.5em]">Identificación</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Nombre Completo</label>
                  <div className="relative group/field">
                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within/field:text-gold transition-colors" />
                    <input 
                      name="customerName" 
                      value={formData.customerName} 
                      onChange={handleChange} 
                      className="input-royale !pl-14" 
                      placeholder="Escriba el nombre del cliente..." 
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Teléfono Directo</label>
                  <div className="relative group/field">
                    <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within/field:text-gold transition-colors" />
                    <input 
                      name="customerPhone" 
                      value={formData.customerPhone} 
                      onChange={handleChange} 
                      className="input-royale !pl-14" 
                      placeholder="+54 9..." 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LOGISTICS COLUMN */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-gold">
                <div className="w-1.5 h-6 bg-gold rounded-full shadow-gold-glow" />
                <p className="text-xs font-black uppercase tracking-[0.5em]">Logística</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Invitados</label>
                  <div className="relative group/field">
                    <Users size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold opacity-50 group-focus-within/field:opacity-100 transition-opacity" />
                    <input 
                      type="number"
                      name="guests" 
                      value={formData.guests} 
                      onChange={handleChange} 
                      className="input-royale !pl-14" 
                      min={1}
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Depósito ($)</label>
                  <div className="relative group/field">
                    <Wallet size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold opacity-50 group-focus-within/field:opacity-100 transition-opacity" />
                    <input 
                      type="number"
                      name="deposit" 
                      value={formData.deposit} 
                      onChange={handleChange} 
                      className="input-royale !pl-14" 
                      min={0}
                    />
                  </div>
                </div>
              </div>

              {/* TABLE SELECTOR WITH LOCATION GROUPING */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1 flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <MapPin size={12} className="text-gold" />
                    Mesa Asignada
                  </span>
                  {loadingTables && <Loader2 className="animate-spin text-gold" size={14} />}
                </label>
                <div className="relative group/field">
                  <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold opacity-50 group-focus-within/field:opacity-100 transition-opacity z-10" />
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <select
                    name="tableId"
                    value={formData.tableId}
                    onChange={handleChange}
                    className="input-royale !pl-14 !pr-12 appearance-none cursor-pointer"
                  >
                    <option value="">— Seleccionar Mesa —</option>
                    {Object.entries(groupedTables).map(([location, locationTables]) => {
                      const config = getLocationConfig(location);
                      return (
                        <optgroup key={location} label={`${config.icon} ${config.label}`}>
                          {locationTables.map((t) => (
                            <option key={t._id} value={t._id}>
                              Mesa {t.number} — Capacidad: {t.capacity} personas
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                {/* VISUAL TABLE TILES (grouped by location) */}
                {tables.length > 0 && (
                  <div className="space-y-4 mt-4">
                    {Object.entries(groupedTables).map(([location, locationTables]) => {
                      const config = getLocationConfig(location);
                      return (
                        <div key={location}>
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${config.color.split(' ')[0]}`}>
                            <span>{config.icon}</span>
                            {config.label}
                            <span className="text-muted/50">({locationTables.length})</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {locationTables.map((t) => {
                              const isSelected = formData.tableId === t._id;
                              const overCapacity = formData.guests > t.capacity;
                              return (
                                <button
                                  key={t._id}
                                  type="button"
                                  onClick={() => setFormData((prev: any) => ({ ...prev, tableId: t._id }))}
                                  className={`
                                    px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border
                                    ${isSelected
                                      ? 'bg-gold/20 text-gold border-gold/40 shadow-gold-glow scale-105'
                                      : overCapacity
                                      ? 'bg-red-500/5 text-red-400/50 border-red-500/10 opacity-50 line-through'
                                      : 'bg-surface-4 text-muted border-white/5 hover:border-white/20 hover:text-ivory'
                                    }
                                  `}
                                  title={overCapacity ? `Capacidad insuficiente (${t.capacity} max)` : `Mesa ${t.number} · ${t.capacity} personas`}
                                >
                                  M{t.number}
                                  <span className="text-[8px] ml-1 opacity-60">({t.capacity}p)</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CHRONOGRAM SECTION WITH QUICK DURATION */}
          <div className="bg-surface-3/40 p-10 rounded-[2.5rem] border border-white/5 space-y-10 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-gold">
                <div className="w-1.5 h-6 bg-gold rounded-full shadow-gold-glow" />
                <p className="text-xs font-black uppercase tracking-[0.5em]">Cronograma</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Check-in (Entrada)</label>
                <div className="relative group/field">
                  <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold/50 group-focus-within/field:text-gold transition-colors" />
                  <input 
                    type="datetime-local" 
                    name="startTime" 
                    value={formData.startTime} 
                    onChange={(e) => {
                      handleChange(e);
                      // Auto-recalculate endTime with selected duration
                      if (selectedDuration && e.target.value) {
                        const start = new Date(e.target.value);
                        const end = new Date(start.getTime() + selectedDuration * 60 * 60 * 1000);
                        setFormData((prev: any) => ({
                          ...prev,
                          startTime: e.target.value,
                          endTime: end.toISOString().slice(0, 16),
                        }));
                      }
                    }}
                    className="input-royale !pl-14" 
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Check-out (Salida)</label>
                <div className="relative group/field">
                  <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold/50 group-focus-within/field:text-gold transition-colors" />
                  <input 
                    type="datetime-local" 
                    name="endTime" 
                    value={formData.endTime} 
                    onChange={(e) => {
                      handleChange(e);
                      setSelectedDuration(null); // Deselect preset on manual edit
                    }}
                    className="input-royale !pl-14" 
                  />
                </div>
              </div>
            </div>

            {/* QUICK DURATION PRESETS */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Timer size={14} className="text-gold/60" />
                <p className="text-[9px] font-black text-muted uppercase tracking-widest">
                  Duración Rápida — Seleccioná cuánto tiempo estará el cliente
                </p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {DURATION_PRESETS.map((preset) => {
                  const isActive = selectedDuration === preset.hours;
                  return (
                    <button
                      key={preset.hours}
                      type="button"
                      onClick={() => applyDuration(preset.hours)}
                      disabled={!formData.startTime}
                      className={`
                        relative h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all border font-black
                        ${isActive
                          ? 'bg-gold/20 text-gold border-gold/40 shadow-[0_0_20px_rgba(212,163,64,0.15)] scale-105'
                          : 'bg-surface-4 text-muted border-white/5 hover:border-white/20 hover:text-ivory hover:bg-surface-3'
                        }
                        disabled:opacity-20 disabled:pointer-events-none
                      `}
                    >
                      <span className={`text-xl tracking-wider ${isActive ? 'text-gold' : ''}`}>
                        {preset.label}
                      </span>
                      <span className={`text-[8px] uppercase tracking-widest ${isActive ? 'text-gold/70' : 'text-muted/50'}`}>
                        {preset.desc}
                      </span>
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center shadow-gold-glow">
                          <CheckCircle size={10} className="text-bg" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {!formData.startTime && (
                <p className="text-[9px] text-amber-400/60 font-bold uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={10} />
                  Primero seleccioná la hora de entrada para usar los atajos de duración
                </p>
              )}
            </div>
          </div>

          {/* OBSERVATIONS */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-gold">
              <div className="w-1.5 h-6 bg-gold rounded-full shadow-gold-glow" />
              <p className="text-xs font-black uppercase tracking-[0.5em]">Observaciones Especiales</p>
            </div>
            <div className="relative group/field">
              <FileText size={18} className="absolute left-5 top-6 text-gold/50 group-focus-within/field:text-gold transition-colors" />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Preferencias de bebida, requerimientos dietéticos, etc..."
                className="input-royale !pl-14 min-h-[120px] resize-none py-6"
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS (STICKY) */}
        <div className="p-10 md:p-12 bg-surface-3 border-t border-white/10 flex gap-8 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-16 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.4em] text-muted hover:text-ivory hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            CANCELAR
          </button>
          <button
            type="submit"
            disabled={!validation.valid || loading}
            className={`
              flex-[2] h-16 rounded-[1.5rem] flex items-center justify-center gap-4 transition-all shadow-2xl
              ${formData.isVIP ? 'bg-grad-gold text-bg shadow-gold/30 hover:scale-[1.02]' : 'btn-gold hover:scale-[1.02]'}
              disabled:opacity-20 disabled:grayscale disabled:scale-100
            `}
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
            <span className="text-sm font-black uppercase tracking-[0.3em]">
              {isEditing ? "GUARDAR CAMBIOS" : "CONFIRMAR RESERVA"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
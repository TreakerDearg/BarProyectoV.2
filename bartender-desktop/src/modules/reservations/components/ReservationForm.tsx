"use client";

/**
 * ReservationForm — Modal lateral slide-in para crear/editar reservas.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Slide-in desde la derecha (480px). Toda la lógica preservada sin cambios.
 */
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Phone, Users, Calendar, Clock, FileText,
  Loader2, MapPin, CheckCircle, AlertTriangle, Crown,
  Wallet, Timer, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";

import type { Reservation, GuestDietaryRestriction } from "../types/reservation";
import { DIETARY_OPTIONS }      from "../types/reservation";
import { getDietaryIcon }       from "../utils/dietaryIcons";
import { getAvailableTables }   from "../services/reservationService";

/* ── Tipos internos ────────────────────────────────────────── */
interface TableOption {
  _id:       string;
  number:    number;
  capacity:  number;
  location?: string;
}

interface ReservationFormData {
  customerName:              string;
  customerPhone:             string;
  startTime:                 string;
  endTime:                   string;
  guests:                    number;
  tableId:                   string;
  notes:                     string;
  isVIP:                     boolean;
  deposit:                   number;
  guestDietaryRestrictions:  GuestDietaryRestriction[];
}

interface Props {
  reservation?: Reservation | null;
  onSave:  (reservation: ReservationFormData & { _id?: string }) => void;
  onClose: () => void;
}

/* ── Presets de duración (sin cambios) ─────────────────────── */
const DURATION_PRESETS = [
  { label: "1h",   hours: 1,   desc: "Rápida"   },
  { label: "1.5h", hours: 1.5, desc: "Normal"   },
  { label: "2h",   hours: 2,   desc: "Estándar" },
  { label: "3h",   hours: 3,   desc: "Larga"    },
];

/* ── Helpers de ubicación ──────────────────────────────────── */
const LOCATION_LABELS: Record<string, string> = {
  indoor:   "Salón interior",
  outdoor:  "Terraza",
  bar:      "Barra",
  vip:      "Zona VIP",
  terraza:  "Terraza",
};
const getLocationLabel = (loc: string) => LOCATION_LABELS[loc?.toLowerCase()] ?? loc ?? "Zona";

/* ── DarkInput reutilizable ────────────────────────────────── */
function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl py-2.5 px-3.5 text-sm outline-none transition-colors"
      style={{ background: "#21283A", border: "1px solid #30363D", color: "#E6EDF3" }}
      onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(240,180,41,0.50)"; props.onFocus?.(e); }}
      onBlur={(e)  => { (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D"; props.onBlur?.(e); }}
    />
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#566270" }}>
      {children}{required && <span style={{ color: "#F0B429" }} className="ml-1">*</span>}
    </label>
  );
}

/* ── Componente principal ──────────────────────────────────── */
export default function ReservationForm({ reservation, onSave, onClose }: Props) {
  const [formData, setFormData] = useState<ReservationFormData>({
    customerName: "", customerPhone: "", startTime: "", endTime: "",
    guests: 1, tableId: "", notes: "", isVIP: false, deposit: 0,
    guestDietaryRestrictions: [],
  });

  const [tables,          setTables]         = useState<TableOption[]>([]);
  const [loadingTables,   setLoadingTables]  = useState(false);
  const [loading,         setLoading]        = useState(false);
  const [error,           setError]          = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [showDietary,     setShowDietary]    = useState(false);

  const isEditing = Boolean(reservation?._id);

  /* ── Init edición ──────────────────────────────────────── */
  useEffect(() => {
    if (!reservation) return;
    const startStr = reservation.startTime?.slice(0, 16) || "";
    const endStr   = reservation.endTime?.slice(0, 16)   || "";
    setFormData({
      customerName:             reservation.customerName || "",
      customerPhone:            reservation.customerPhone || "",
      startTime:                startStr,
      endTime:                  endStr,
      guests:                   reservation.guests || 1,
      tableId:                  typeof reservation.tableId === "string" ? reservation.tableId : reservation.tableId?._id || "",
      notes:                    reservation.notes || "",
      isVIP:                    reservation.isVIP || false,
      deposit:                  reservation.deposit || 0,
      guestDietaryRestrictions: Array.isArray(reservation.guestDietaryRestrictions) ? reservation.guestDietaryRestrictions : [],
    });
    if (startStr && endStr) {
      const diffH = (new Date(endStr).getTime() - new Date(startStr).getTime()) / 3600000;
      const match = DURATION_PRESETS.find((p) => Math.abs(p.hours - diffH) < 0.1);
      if (match) setSelectedDuration(match.hours);
    }
  }, [reservation]);

  /* ── Duración preset ───────────────────────────────────── */
  const applyDuration = (hours: number) => {
    setSelectedDuration(hours);
    if (!formData.startTime) return;
    const start = new Date(formData.startTime);
    const end   = new Date(start.getTime() + hours * 3600000);
    setFormData((prev) => ({ ...prev, endTime: end.toISOString().slice(0, 16) }));
  };

  /* ── Auto end time ─────────────────────────────────────── */
  useEffect(() => {
    if (!formData.startTime || formData.endTime) return;
    const start = new Date(formData.startTime);
    const h     = selectedDuration || 2;
    const end   = new Date(start.getTime() + h * 3600000);
    setFormData((prev) => ({ ...prev, endTime: end.toISOString().slice(0, 16) }));
    if (!selectedDuration) setSelectedDuration(2);
  }, [formData.startTime, formData.endTime, selectedDuration]);

  /* ── Validación ────────────────────────────────────────── */
  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!formData.customerName)  errors.push("Nombre requerido");
    if (!formData.customerPhone) errors.push("Teléfono requerido");
    if (!formData.startTime || !formData.endTime) errors.push("Horario incompleto");
    if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime))
      errors.push("Horario inválido");
    return { valid: errors.length === 0, errors };
  }, [formData]);

  /* ── Alerta de capacidad ───────────────────────────────── */
  const capacityWarning = useMemo(() => {
    if (!formData.tableId || tables.length === 0) return null;
    const t = tables.find((t) => t._id === formData.tableId);
    if (!t) return null;
    if (formData.guests > t.capacity) return { type: "danger" as const, message: `La Mesa ${t.number} tiene capacidad máx. ${t.capacity}.` };
    if (formData.guests === t.capacity) return { type: "warning" as const, message: `Mesa ${t.number} estará a capacidad máxima.` };
    return null;
  }, [formData.tableId, formData.guests, tables]);

  /* ── Mesas agrupadas ───────────────────────────────────── */
  const groupedTables = useMemo(() => {
    const groups: Record<string, TableOption[]> = {};
    for (const t of tables) {
      const loc = (t.location || "indoor").toLowerCase();
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(t);
    }
    for (const key of Object.keys(groups)) groups[key].sort((a, b) => a.number - b.number);
    return groups;
  }, [tables]);

  /* ── Fetch mesas ───────────────────────────────────────── */
  useEffect(() => {
    const fetchTables = async () => {
      if (!validation.valid) return;
      try {
        setLoadingTables(true);
        const data = await getAvailableTables({
          startTime: new Date(formData.startTime).toISOString(),
          endTime:   new Date(formData.endTime).toISOString(),
          guests:    Number(formData.guests),
        });
        setTables(data || []);
        if (data?.length === 1 && !formData.tableId)
          setFormData((prev) => ({ ...prev, tableId: data[0]._id }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al consultar mesas");
      } finally {
        setLoadingTables(false);
      }
    };
    const t = setTimeout(fetchTables, 300);
    return () => clearTimeout(t);
  }, [formData.startTime, formData.endTime, formData.guests, formData.tableId, validation.valid]);

  /* ── Handler de cambios ────────────────────────────────── */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" && "checked" in e.target ? Boolean((e.target as HTMLInputElement).checked) : false;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "guests" || name === "deposit" ? Number(value) : value),
    }));
  };

  /* ── Submit ────────────────────────────────────────────── */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validation.valid) { setError(validation.errors[0]); return; }
    try {
      setLoading(true);
      await onSave({
        ...formData,
        _id:       reservation?._id,
        startTime: new Date(formData.startTime).toISOString(),
        endTime:   new Date(formData.endTime).toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la reserva");
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ────────────────────────────────────────────── */
  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Panel lateral */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 z-[101] flex flex-col"
        style={{ width: 480, background: "#1C2333", borderLeft: "1px solid #30363D" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid #30363D", background: "#161B22" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{
                background: formData.isVIP ? "rgba(240,180,41,0.15)" : "rgba(163,113,247,0.12)",
                border:     formData.isVIP ? "1px solid rgba(240,180,41,0.25)" : "1px solid rgba(163,113,247,0.25)",
                color:      formData.isVIP ? "#F0B429" : "#A371F7",
              }}
            >
              {formData.isVIP ? <Crown size={18} /> : <Calendar size={18} />}
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: "#E6EDF3" }}>
                {isEditing ? "Editar reserva" : "Nueva reserva"}
              </h2>
              <p className="text-[10px] mt-0.5" style={{ color: "#566270" }}>
                {isEditing ? `ID: ${reservation?._id?.slice(-8)}` : "Completá los datos del cliente"}
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

        {/* Body scrollable */}
        <form
          id="reservation-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
        >
          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(248,81,73,0.10)", border: "1px solid rgba(248,81,73,0.30)", color: "#FF6B63" }}
            >
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {/* Capacity warning */}
          {capacityWarning && (
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
              style={{
                background: capacityWarning.type === "danger" ? "rgba(248,81,73,0.08)" : "rgba(255,123,84,0.08)",
                border:     capacityWarning.type === "danger" ? "1px solid rgba(248,81,73,0.25)" : "1px solid rgba(255,123,84,0.25)",
                color:      capacityWarning.type === "danger" ? "#F85149" : "#FF7B54",
              }}
            >
              <AlertCircle size={14} /> {capacityWarning.message}
            </div>
          )}

          {/* ── Toggle VIP ──────────────────────────────── */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: formData.isVIP ? "rgba(240,180,41,0.08)" : "#21283A", border: `1px solid ${formData.isVIP ? "rgba(240,180,41,0.25)" : "#30363D"}` }}
          >
            <div className="flex items-center gap-3">
              <Crown size={16} style={{ color: formData.isVIP ? "#F0B429" : "#566270" }} />
              <div>
                <p className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Cliente VIP</p>
                <p className="text-[10px]" style={{ color: "#566270" }}>Tratamiento prioritario y mesa premium</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="isVIP" checked={formData.isVIP} onChange={handleChange} className="sr-only peer" />
              <div
                className="w-11 h-6 rounded-full peer transition-colors"
                style={{ background: formData.isVIP ? "#F0B429" : "#293042", border: "1px solid #30363D" }}
              >
                <div
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                  style={{ background: "#0D1117", transform: formData.isVIP ? "translateX(20px)" : "translateX(0)" }}
                />
              </div>
            </label>
          </div>

          {/* ── Cliente ─────────────────────────────────── */}
          <div className="space-y-3">
            <div
              className="flex items-center gap-2 pb-2"
              style={{ borderBottom: "1px solid #30363D" }}
            >
              <User size={13} style={{ color: "#F0B429" }} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#566270" }}>
                Datos del cliente
              </p>
            </div>
            <div>
              <FieldLabel required>Nombre completo</FieldLabel>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#566270" }} />
                <DarkInput
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Nombre del cliente"
                  style={{ paddingLeft: "2.25rem" }}
                  required
                />
              </div>
            </div>
            <div>
              <FieldLabel required>Teléfono</FieldLabel>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#566270" }} />
                <DarkInput
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="+54 9 ..."
                  style={{ paddingLeft: "2.25rem" }}
                  required
                />
              </div>
            </div>
          </div>

          {/* ── Logística ───────────────────────────────── */}
          <div className="space-y-3">
            <div
              className="flex items-center gap-2 pb-2"
              style={{ borderBottom: "1px solid #30363D" }}
            >
              <Users size={13} style={{ color: "#F0B429" }} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#566270" }}>
                Logística
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel required>Invitados</FieldLabel>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#566270" }} />
                  <DarkInput
                    type="number" name="guests" value={formData.guests}
                    onChange={handleChange} min={1} style={{ paddingLeft: "2.25rem" }}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Depósito ($)</FieldLabel>
                <div className="relative">
                  <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#566270" }} />
                  <DarkInput
                    type="number" name="deposit" value={formData.deposit}
                    onChange={handleChange} min={0} style={{ paddingLeft: "2.25rem" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Cronograma ──────────────────────────────── */}
          <div className="space-y-3">
            <div
              className="flex items-center gap-2 pb-2"
              style={{ borderBottom: "1px solid #30363D" }}
            >
              <Clock size={13} style={{ color: "#F0B429" }} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#566270" }}>
                Cronograma
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel required>Check-in</FieldLabel>
                <DarkInput
                  type="datetime-local" name="startTime" value={formData.startTime}
                  onChange={(e) => {
                    handleChange(e);
                    if (selectedDuration && e.target.value) {
                      const start = new Date(e.target.value);
                      const end   = new Date(start.getTime() + selectedDuration * 3600000);
                      setFormData((prev) => ({ ...prev, startTime: e.target.value, endTime: end.toISOString().slice(0, 16) }));
                    }
                  }}
                />
              </div>
              <div>
                <FieldLabel required>Check-out</FieldLabel>
                <DarkInput
                  type="datetime-local" name="endTime" value={formData.endTime}
                  onChange={(e) => { handleChange(e); setSelectedDuration(null); }}
                />
              </div>
            </div>

            {/* Presets de duración */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Timer size={11} style={{ color: "#566270" }} />
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#566270" }}>
                  Duración rápida
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_PRESETS.map((preset) => {
                  const isActive = selectedDuration === preset.hours;
                  return (
                    <button
                      key={preset.hours}
                      type="button"
                      onClick={() => applyDuration(preset.hours)}
                      disabled={!formData.startTime}
                      className="py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all disabled:opacity-30 disabled:pointer-events-none"
                      style={{
                        background:  isActive ? "rgba(240,180,41,0.15)" : "#21283A",
                        border:      `1px solid ${isActive ? "rgba(240,180,41,0.40)" : "#30363D"}`,
                        color:       isActive ? "#F0B429" : "#566270",
                      }}
                    >
                      <span className="text-sm font-black">{preset.label}</span>
                      <span className="text-[8px] uppercase tracking-wide">{preset.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Mesa ────────────────────────────────────── */}
          <div className="space-y-3">
            <div
              className="flex items-center justify-between pb-2"
              style={{ borderBottom: "1px solid #30363D" }}
            >
              <div className="flex items-center gap-2">
                <MapPin size={13} style={{ color: "#F0B429" }} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#566270" }}>
                  Mesa asignada
                </p>
              </div>
              {loadingTables && <Loader2 size={13} className="animate-spin" style={{ color: "#F0B429" }} />}
            </div>

            {tables.length === 0 ? (
              <div
                className="text-center py-6 rounded-xl"
                style={{ background: "#21283A", border: "1px solid #30363D" }}
              >
                <p className="text-xs" style={{ color: "#566270" }}>
                  {loadingTables ? "Cargando mesas…" : "Ingresá fecha, hora e invitados para ver mesas disponibles"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedTables).map(([location, locationTables]) => (
                  <div key={location}>
                    <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: "#566270" }}>
                      {getLocationLabel(location)} ({locationTables.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {locationTables.map((t) => {
                        const isSelected    = formData.tableId === t._id;
                        const overCapacity  = formData.guests > t.capacity;
                        return (
                          <button
                            key={t._id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, tableId: t._id }))}
                            disabled={overCapacity}
                            className="py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all disabled:opacity-40 disabled:pointer-events-none"
                            style={{
                              background:  isSelected ? "rgba(240,180,41,0.15)" : "#21283A",
                              border:      `1px solid ${isSelected ? "rgba(240,180,41,0.40)" : "#30363D"}`,
                              color:       isSelected ? "#F0B429" : overCapacity ? "#566270" : "#8B949E",
                            }}
                            title={overCapacity ? `Capacidad máx. ${t.capacity}` : `Mesa ${t.number} · ${t.capacity} personas`}
                          >
                            <span className="text-lg font-black">M{t.number}</span>
                            <span className="text-[9px]">{t.capacity} pax</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Restricciones dietéticas ─────────────────── */}
          <div>
            <button
              type="button"
              onClick={() => setShowDietary((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
              style={{
                background: showDietary ? "rgba(255,123,84,0.08)" : "#21283A",
                border:     `1px solid ${showDietary ? "rgba(255,123,84,0.25)" : "#30363D"}`,
              }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} style={{ color: showDietary ? "#FF7B54" : "#566270" }} />
                <div className="text-left">
                  <p className="text-xs font-bold" style={{ color: "#E6EDF3" }}>
                    Restricciones dietéticas
                  </p>
                  <p className="text-[9px]" style={{ color: "#566270" }}>
                    {formData.guestDietaryRestrictions.filter((g: GuestDietaryRestriction) => g.restrictions.length > 0).length > 0
                      ? `${formData.guestDietaryRestrictions.reduce((s: number, g: GuestDietaryRestriction) => s + g.restrictions.length, 0)} restricción(es) registradas`
                      : `${formData.guests} invitado${formData.guests > 1 ? "s" : ""} — clic para indicar restricciones`}
                  </p>
                </div>
              </div>
              {showDietary
                ? <ChevronUp  size={15} style={{ color: "#566270" }} />
                : <ChevronDown size={15} style={{ color: "#566270" }} />}
            </button>

            {showDietary && (
              <div className="mt-2 space-y-3">
                {Array.from({ length: Math.max(1, formData.guests) }, (_, idx) => {
                  const entry: GuestDietaryRestriction = formData.guestDietaryRestrictions[idx] ?? { guestName: "", restrictions: [], notes: "" };
                  const update = (updated: GuestDietaryRestriction) => {
                    const list = [...formData.guestDietaryRestrictions];
                    list[idx]  = updated;
                    setFormData((prev) => ({ ...prev, guestDietaryRestrictions: list }));
                  };
                  return (
                    <div
                      key={idx}
                      className="rounded-xl overflow-hidden"
                      style={{ background: "#21283A", border: "1px solid #30363D" }}
                    >
                      <div
                        className="flex items-center gap-2 px-4 py-2.5"
                        style={{ borderBottom: "1px solid #30363D" }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.25)" }}
                        >
                          <span className="text-[9px] font-black" style={{ color: "#F0B429" }}>{idx + 1}</span>
                        </div>
                        <input
                          type="text"
                          value={entry.guestName}
                          onChange={(e) => update({ ...entry, guestName: e.target.value })}
                          placeholder={`Nombre del invitado ${idx + 1}`}
                          className="flex-1 text-sm outline-none bg-transparent"
                          style={{ color: "#E6EDF3" }}
                        />
                      </div>
                      <div className="p-3">
                        <div className="grid grid-cols-2 gap-1.5">
                          {DIETARY_OPTIONS.map((opt) => {
                            const selected = entry.restrictions.includes(opt.value);
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  const next = selected
                                    ? entry.restrictions.filter((r) => r !== opt.value)
                                    : [...entry.restrictions, opt.value];
                                  update({ ...entry, restrictions: next });
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all text-left"
                                style={{
                                  background: selected ? "rgba(240,180,41,0.12)" : "#293042",
                                  border:     `1px solid ${selected ? "rgba(240,180,41,0.30)" : "#30363D"}`,
                                  color:      selected ? "#F0B429" : "#566270",
                                }}
                              >
                                <span className="flex-shrink-0">{getDietaryIcon(opt.iconName, 11)}</span>
                                <span className="truncate">{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        {entry.restrictions.length > 0 && (
                          <div className="mt-2 relative">
                            <FileText size={12} className="absolute left-3 top-3" style={{ color: "#566270" }} />
                            <input
                              type="text"
                              value={entry.notes ?? ""}
                              onChange={(e) => update({ ...entry, notes: e.target.value })}
                              placeholder="Nota adicional (ej: alérgico severo…)"
                              className="w-full rounded-lg py-2 text-xs outline-none transition-colors"
                              style={{ paddingLeft: "2rem", background: "#293042", border: "1px solid #30363D", color: "#E6EDF3" }}
                              onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(240,180,41,0.50)"; }}
                              onBlur={(e)  => { (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D"; }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Notas ───────────────────────────────────── */}
          <div>
            <FieldLabel>Notas de servicio</FieldLabel>
            <div className="relative">
              <FileText size={13} className="absolute left-3 top-3" style={{ color: "#566270" }} />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Preferencias, requerimientos especiales…"
                rows={3}
                className="w-full rounded-xl py-2.5 text-sm outline-none transition-colors resize-none"
                style={{ paddingLeft: "2.25rem", paddingRight: "0.875rem", background: "#21283A", border: "1px solid #30363D", color: "#E6EDF3" }}
                onFocus={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(240,180,41,0.50)"; }}
                onBlur={(e)  => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "#30363D"; }}
              />
            </div>
          </div>
        </form>

        {/* Footer fijo */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-6 py-4"
          style={{ borderTop: "1px solid #30363D", background: "#161B22" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="reservation-form"
            disabled={!validation.valid || loading}
            className="flex-[2] py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: "#F0B429", color: "#0D1117", boxShadow: "0 4px 16px rgba(240,180,41,0.25)" }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#F5C842"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0B429"; }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            {isEditing ? "Guardar cambios" : "Confirmar reserva"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

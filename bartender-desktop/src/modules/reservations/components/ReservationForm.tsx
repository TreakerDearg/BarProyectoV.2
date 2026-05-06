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
  ShieldCheck,
  Zap,
  Star
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
}

interface Props {
  reservation?: Reservation | null;
  onSave: (reservation: any) => void;
  onClose: () => void;
}

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

  /* =========================
     INIT EDIT
  ========================= */
  useEffect(() => {
    if (!reservation) return;

    setFormData({
      customerName: reservation.customerName || "",
      customerPhone: reservation.customerPhone || "",
      startTime: reservation.startTime?.slice(0, 16) || "",
      endTime: reservation.endTime?.slice(0, 16) || "",
      guests: reservation.guests || 1,
      tableId: (reservation as any).table?._id || reservation.tableId || "",
      notes: reservation.notes || "",
      isVIP: (reservation as any).isVIP || false,
      deposit: (reservation as any).deposit || 0,
    });
  }, [reservation]);

  /* =========================
     AUTO END TIME
  ========================= */
  useEffect(() => {
    if (!formData.startTime || formData.endTime) return;

    const start = new Date(formData.startTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    setFormData((prev: any) => ({
      ...prev,
      endTime: end.toISOString().slice(0, 16),
    }));
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
                {reservation ? "Protocolo de Edición" : "Nueva Reservación"}
              </h2>
              <p className={`text-[10px] font-black uppercase tracking-[0.5em] mt-2 ${formData.isVIP ? 'text-bg/60' : 'text-muted'}`}>
                {reservation ? `ID DE RASTREO: ${reservation._id?.slice(-8)}` : "Sistema de Ingreso Casino Royale"}
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
        <div className="p-8 md:p-12 space-y-12 max-h-[65vh] overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(212,163,64,0.03)_0%,transparent_50%)]">
          
          {/* ERROR FEEDBACK */}
          {error && (
            <div className="glass-red p-5 rounded-2xl flex items-center gap-5 animate-shake border-brand/30 shadow-lg shadow-brand/10">
              <AlertTriangle size={24} className="text-brand" />
              <p className="text-sm font-black uppercase tracking-widest text-ivory/90">{error}</p>
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

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1 flex justify-between">
                  Mesa Asignada
                  {loadingTables && <Loader2 className="animate-spin text-gold" size={14} />}
                </label>
                <div className="relative group/field">
                  <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold opacity-50 group-focus-within/field:opacity-100 transition-opacity" />
                  <select
                    name="tableId"
                    value={formData.tableId}
                    onChange={handleChange}
                    className="input-royale !pl-14 appearance-none cursor-pointer"
                  >
                    <option value="">Selección Automática</option>
                    {tables.map((t) => (
                      <option key={t._id} value={t._id}>
                        Mesa {t.number} — Cap. {t.capacity}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* CHRONOGRAM SECTION */}
          <div className="bg-surface-3/40 p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-inner">
            <div className="flex items-center gap-4 text-gold">
              <div className="w-1.5 h-6 bg-gold rounded-full shadow-gold-glow" />
              <p className="text-xs font-black uppercase tracking-[0.5em]">Cronograma de Apuesta</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Check-in (Entrada)</label>
                <div className="relative group/field">
                  <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold/50 group-focus-within/field:text-gold transition-colors" />
                  <input 
                    type="datetime-local" 
                    name="startTime" 
                    value={formData.startTime} 
                    onChange={handleChange} 
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
                    onChange={handleChange} 
                    className="input-royale !pl-14" 
                  />
                </div>
              </div>
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
        <div className="p-8 md:p-10 bg-surface-3 border-t border-white/10 flex gap-6 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
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
              {reservation ? "GUARDAR CAMBIOS" : "CONFIRMAR RESERVA"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
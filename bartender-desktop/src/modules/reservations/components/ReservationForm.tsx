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
  Utensils,
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
  status?: string;
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
  });

  const [tables, setTables] = useState<TableOption[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     LOAD EDIT MODE
  ========================= */
  useEffect(() => {
    if (!reservation) return;

    setFormData({
      customerName: reservation.customerName || "",
      customerPhone: reservation.customerPhone || "",
      startTime: reservation.startTime?.slice(0, 16) || "",
      endTime: reservation.endTime?.slice(0, 16) || "",
      guests: reservation.guests || 1,
      tableId: (reservation as any).tableId?._id || "",
      notes: reservation.notes || "",
    });
  }, [reservation]);

  /* =========================
     AUTO END TIME (SMART)
     - solo si no hay endTime
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
     VALID DATES MEMO
  ========================= */
  const isDateValid = useMemo(() => {
    if (!formData.startTime || !formData.endTime) return false;

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    return end > start;
  }, [formData.startTime, formData.endTime]);

  /* =========================
     FETCH TABLES (SMART + DEBOUNCE SIMPLE)
  ========================= */
  useEffect(() => {
    const fetchTables = async () => {
      if (!formData.startTime || !formData.endTime || !formData.guests) return;
      if (!isDateValid) return;

      try {
        setLoadingTables(true);
        setError(null);

        const data = await getAvailableTables({
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          guests: Number(formData.guests),
        });

        setTables(data || []);
      } catch (err: any) {
        setError(err.message || "Error cargando mesas");
      } finally {
        setLoadingTables(false);
      }
    };

    const timeout = setTimeout(fetchTables, 400); // anti spam requests
    return () => clearTimeout(timeout);
  }, [formData.startTime, formData.endTime, formData.guests]);

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     SUBMIT (CLEAN)
  ========================= */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);

    if (!formData.customerName || !formData.customerPhone) {
      return setError("Nombre y teléfono requeridos");
    }

    if (!isDateValid) {
      return setError("Rango de tiempo inválido");
    }

    try {
      setLoading(true);

      await onSave({
        ...formData,
        guests: Number(formData.guests),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        tableId: formData.tableId || null,
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 font-mono">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-void/90 border border-obsidian/60 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 flex flex-col space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF007F] to-[#00FFFF]" />

        {/* HEADER */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
              {reservation ? "EDIT_BOOKING" : "NEW_BOOKING"}
            </h2>
            <p className="text-[9px] text-[#00FFFF] font-bold tracking-widest uppercase mt-1">NIGHT_OPS // PROTOCOL_04</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition bg-obsidian/50 p-1.5 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-bar-red/10 border border-bar-red/30 text-bar-red p-3 rounded text-[10px] tracking-widest font-bold uppercase">
            ERR: {error}
          </div>
        )}

        {/* CLIENT */}
        <div>
          <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-2">Client Details</p>
          <div className="grid grid-cols-2 gap-3">
            <Input icon={<User size={14} />} name="customerName" value={formData.customerName} onChange={handleChange} placeholder="FULL_NAME" />
            <Input icon={<Phone size={14} />} name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder="CONTACT_NO" />
          </div>
        </div>

        {/* GUESTS */}
        <div>
          <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-2">Party Size</p>
          <Input
            icon={<Users size={14} />}
            name="guests"
            type="number"
            value={formData.guests}
            onChange={handleChange}
            placeholder="HEADCOUNT"
          />
        </div>

        {/* TIME */}
        <div>
          <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-2">Time Slot</p>
          <div className="grid grid-cols-2 gap-3">
            <Input icon={<Calendar size={14} />} type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} />
            <Input icon={<Clock size={14} />} type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} />
          </div>
        </div>

        {/* TABLE SELECT */}
        <div>
          <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-2 flex items-center justify-between">
            <span>Assignment</span>
            {loadingTables && <span className="text-[#00FFFF] flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> SCANNING...</span>}
          </p>
          <div className="bg-obsidian/30 border border-obsidian rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-400 font-bold tracking-widest uppercase">
              <MapPin size={12} className="text-[#8B5CF6]" /> Target Zone / Table
            </div>

            <select
              name="tableId"
              value={formData.tableId}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-white text-xs font-bold tracking-wider appearance-none cursor-pointer"
            >
              <option value="" className="bg-void">AUTO_ASSIGN (SYSTEM DEFAULT)</option>
              {tables.map((t) => (
                <option key={t._id} value={t._id} className="bg-void">
                  T-{t.number} [{t.capacity} PAX]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* NOTES */}
        <div>
           <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-2">Operational Directives</p>
           <div className="relative">
             <FileText className="absolute left-3 top-3 text-gray-500" size={14} />
             <textarea
               name="notes"
               value={formData.notes}
               onChange={handleChange}
               placeholder="VIP_STATUS, ALLERGIES, SPECIAL_REQ..."
               rows={2}
               className="w-full pl-9 p-3 bg-obsidian/30 text-white rounded-lg border border-obsidian focus:border-[#FF007F]/50 outline-none text-xs custom-scrollbar resize-none transition"
             />
           </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t border-obsidian/40">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-obsidian/50 hover:bg-obsidian border border-obsidian text-white rounded-lg text-xs font-bold tracking-widest uppercase transition"
          >
            Abort
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#FF007F] hover:bg-[#D90066] text-white rounded-lg text-xs font-black tracking-widest uppercase transition shadow-[0_0_15px_rgba(255,0,127,0.3)] flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={14} />}
            Commit Booking
          </button>
        </div>

      </form>
    </div>
  );
}

/* =========================
   INPUT COMPONENT
========================= */
function Input({
  icon,
  ...props
}: any) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        {icon}
      </div>

      <input
        {...props}
        className="w-full pl-9 p-3 bg-obsidian/30 text-white rounded-lg border border-obsidian focus:border-[#00FFFF]/50 outline-none text-xs transition uppercase"
      />
    </div>
  );
}
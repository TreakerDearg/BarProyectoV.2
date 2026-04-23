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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

      <form
        onSubmit={handleSubmit}
        className="w-[580px] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 space-y-5"
      >

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {reservation ? "Editar Reserva" : "Nueva Reserva"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X />
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* CLIENT */}
        <div className="grid grid-cols-2 gap-3">
          <Input icon={<User size={16} />} name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Nombre" />
          <Input icon={<Phone size={16} />} name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder="Teléfono" />
        </div>

        {/* GUESTS */}
        <Input
          icon={<Users size={16} />}
          name="guests"
          type="number"
          value={formData.guests}
          onChange={handleChange}
          placeholder="Cantidad de personas"
        />

        {/* TIME */}
        <div className="grid grid-cols-2 gap-3">
          <Input icon={<Calendar size={16} />} type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} />
          <Input icon={<Clock size={16} />} type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} />
        </div>

        {/* TABLE SELECT */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-2">
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
            <MapPin size={14} /> Mesa disponible
          </div>

          <select
            name="tableId"
            value={formData.tableId}
            onChange={handleChange}
            className="w-full bg-transparent outline-none"
          >
            <option value="">Asignar automáticamente</option>

            {loadingTables && <option>Cargando mesas...</option>}

            {tables.map((t) => (
              <option key={t._id} value={t._id}>
                Mesa {t.number} · {t.capacity} personas
              </option>
            ))}
          </select>
        </div>

        {/* NOTES */}
        <div className="relative">
          <FileText className="absolute left-2 top-3 text-gray-500" size={16} />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notas (VIP, alergias, etc.)"
            className="w-full pl-8 p-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-semibold flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            Guardar
          </button>
        </div>

      </form>
    </div>
  );
}

/* =========================
   INPUT COMPONENT (mini UI system)
========================= */
function Input({
  icon,
  ...props
}: any) {
  return (
    <div className="relative">
      <div className="absolute left-2 top-3 text-gray-500">
        {icon}
      </div>

      <input
        {...props}
        className="w-full pl-8 p-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-amber-500 outline-none"
      />
    </div>
  );
}
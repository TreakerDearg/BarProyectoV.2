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
      tableId: (reservation as any).table?._id || "",
      notes: reservation.notes || "",
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

        // 🔥 AUTO SELECT si hay 1 sola
        if (data?.length === 1) {
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
    const { name, value } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: name === "guests" ? Number(value) : value,
    }));
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-void border border-obsidian rounded-xl p-6 space-y-5"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {reservation ? "Editar Reserva" : "Nueva Reserva"}
          </h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2 text-xs">
          {validation.valid ? (
            <span className="text-green-400 flex items-center gap-1">
              <CheckCircle size={14} /> Datos OK
            </span>
          ) : (
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle size={14} /> {validation.errors[0]}
            </span>
          )}
        </div>

        {/* CLIENT */}
        <div className="grid grid-cols-2 gap-3">
          <Input icon={<User size={14} />} name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Nombre" />
          <Input icon={<Phone size={14} />} name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder="Teléfono" />
        </div>

        {/* GUESTS */}
        <Input icon={<Users size={14} />} name="guests" type="number" value={formData.guests} onChange={handleChange} />

        {/* TIME */}
        <div className="grid grid-cols-2 gap-3">
          <Input icon={<Calendar size={14} />} type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} />
          <Input icon={<Clock size={14} />} type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} />
        </div>

        {/* TABLES */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Mesas disponibles</span>
            {loadingTables && <Loader2 className="animate-spin" size={14} />}
          </div>

          <select
            name="tableId"
            value={formData.tableId}
            onChange={handleChange}
            className="w-full bg-gray-900 p-2 rounded"
          >
            <option value="">Auto</option>
            {tables.map((t) => (
              <option key={t._id} value={t._id}>
                Mesa {t.number} ({t.capacity})
              </option>
            ))}
          </select>
        </div>

        {/* NOTES */}
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Notas..."
          className="w-full bg-gray-900 p-2 rounded text-sm"
        />

        {/* ACTIONS */}
        <button
          type="submit"
          disabled={!validation.valid || loading}
          className="w-full py-2 bg-amber-500 disabled:opacity-40 rounded flex justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={14} />}
          Guardar
        </button>
      </form>
    </div>
  );
}

/* =========================
   INPUT
========================= */
function Input({ icon, ...props }: any) {
  return (
    <div className="relative">
      <div className="absolute left-2 top-2 text-gray-400">
        {icon}
      </div>
      <input {...props} className="w-full pl-8 p-2 bg-gray-900 rounded text-sm" />
    </div>
  );
}
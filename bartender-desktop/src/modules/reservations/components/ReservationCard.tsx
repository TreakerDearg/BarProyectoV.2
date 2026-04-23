"use client";

import {
  Trash2,
  Pencil,
  Clock,
  Users,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
} from "lucide-react";

import type { Reservation } from "../types/reservation";

const statusConfig: any = {
  pending: {
    label: "Pendiente",
    color: "text-yellow-300",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    icon: AlertCircle,
  },
  confirmed: {
    label: "Confirmada",
    color: "text-green-300",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    icon: CheckCircle2,
  },
  seated: {
    label: "EN MESA",
    color: "text-blue-300",
    bg: "bg-blue-500/10 animate-pulse",
    border: "border-blue-500/40",
    icon: Sparkles,
  },
  cancelled: {
    label: "Cancelada",
    color: "text-red-300",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: XCircle,
  },
};

export default function ReservationCard({
  reservation,
  onEdit,
  onDelete,
}: any) {
  const status =
    statusConfig[reservation.status] ?? statusConfig.pending;

  const StatusIcon = status.icon;

  const table =
    typeof reservation.tableId === "object"
      ? reservation.tableId?.number
      : "Auto";

  return (
    <div
      className={`relative group rounded-2xl border ${status.border} bg-gradient-to-b from-gray-900 to-gray-950 p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
    >
      {/* glow effect when seated */}
      {reservation.status === "seated" && (
        <div className="absolute inset-0 rounded-2xl bg-blue-500/5 blur-xl" />
      )}

      {/* HEADER */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <h3 className="text-white font-semibold text-lg">
            {reservation.customerName}
          </h3>

          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Phone size={14} />
            {reservation.customerPhone}
          </div>
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${status.bg} ${status.color} ${status.border}`}
        >
          <StatusIcon size={12} />
          {status.label}
        </div>
      </div>

      {/* INFO */}
      <div className="space-y-2 text-sm text-gray-300 relative z-10">
        <div className="flex items-center gap-2">
          <Clock size={14} />
          {new Date(reservation.startTime).toLocaleTimeString()} →{" "}
          {new Date(reservation.endTime).toLocaleTimeString()}
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={14} />
          Mesa <span className="text-white font-semibold">{table}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users size={14} />
          {reservation.guests} personas
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800 relative z-10">
        <span className="text-[11px] text-gray-500">
          #{reservation._id?.slice(-6)}
        </span>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(reservation)}
            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => onDelete(reservation._id)}
            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
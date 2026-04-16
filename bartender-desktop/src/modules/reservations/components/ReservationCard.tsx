import { Trash2, Pencil } from "lucide-react";
import type { Reservation } from "../types/reservation";

interface Props {
  reservation: Reservation;
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
}

export default function ReservationCard({
  reservation,
  onEdit,
  onDelete,
}: Props) {
  const statusColors = {
    pending: "bg-yellow-500",
    confirmed: "bg-green-500",
    cancelled: "bg-red-500",
    completed: "bg-blue-500",
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-bold">
        {reservation.customerName}
      </h3>

      <p className="text-sm text-gray-400">
        📞 {reservation.customerPhone}
      </p>

      <p className="text-sm text-gray-400">
        📅 {reservation.date} ⏰ {reservation.time}
      </p>

      <p className="text-sm text-gray-400">
        🪑 Mesa {reservation.tableNumber} - 👥 {reservation.guests} personas
      </p>

      <span
        className={`inline-block mt-2 px-2 py-1 text-xs text-white rounded ${
          statusColors[reservation.status]
        }`}
      >
        {reservation.status}
      </span>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => onEdit(reservation)}
          className="p-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => onDelete(reservation._id!)}
          className="p-2 bg-red-500 rounded hover:bg-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
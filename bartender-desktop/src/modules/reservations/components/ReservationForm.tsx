import { useEffect, useState } from "react";
import type { Reservation } from "../types/reservation";

interface Props {
  reservation?: Reservation | null;
  onSave: (reservation: Reservation) => void;
  onClose: () => void;
}

export default function ReservationForm({
  reservation,
  onSave,
  onClose,
}: Props) {
  const [formData, setFormData] = useState<Reservation>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    date: "",
    time: "",
    guests: 1,
    tableNumber: 1,
    status: "pending",
    notes: "",
  });

  useEffect(() => {
    if (reservation) {
      setFormData(reservation);
    }
  }, [reservation]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      guests: Number(formData.guests),
      tableNumber: Number(formData.tableNumber),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <form className="bg-gray-900 p-6 rounded-xl w-[500px]" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">
          {reservation ? "Editar Reserva" : "Nueva Reserva"}
        </h2>

        <input
          name="customerName"
          placeholder="Nombre del Cliente"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.customerName}
          onChange={handleChange}
          required
        />

        <input
          name="customerPhone"
          placeholder="Teléfono"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.customerPhone}
          onChange={handleChange}
          required
        />

        <input
          name="customerEmail"
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.customerEmail}
          onChange={handleChange}
        />

        <input
          type="date"
          name="date"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <input
          type="time"
          name="time"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.time}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="guests"
          placeholder="Número de Personas"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.guests}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="tableNumber"
          placeholder="Número de Mesa"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.tableNumber}
          onChange={handleChange}
          required
        />

        <select
          name="status"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmada</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>

        <textarea
          name="notes"
          placeholder="Notas adicionales"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.notes}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 text-black rounded"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
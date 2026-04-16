import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ReservationCard from "../components/ReservationCard";
import ReservationForm from "../components/ReservationForm";
import {
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} from "../services/reservationService";
import type { Reservation } from "../types/reservation";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReservations = async () => {
    const data = await getReservations();
    setReservations(data);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSave = async (reservation: Reservation) => {
    if (reservation._id) {
      await updateReservation(reservation._id, reservation);
    } else {
      await createReservation(reservation);
    }
    setIsModalOpen(false);
    setSelectedReservation(null);
    fetchReservations();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar reserva?")) {
      await deleteReservation(id);
      fetchReservations();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reservas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg"
        >
          <Plus size={18} /> Nueva Reserva
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation._id}
            reservation={reservation}
            onEdit={(r) => {
              setSelectedReservation(r);
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isModalOpen && (
        <ReservationForm
          reservation={selectedReservation}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReservation(null);
          }}
        />
      )}
    </div>
  );
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const RESERVATION_API = `${API_URL}/reservations`;

// Obtener todas las reservaciones
export const getReservations = async () => {
  const res = await fetch(RESERVATION_API);
  if (!res.ok) throw new Error("Error al obtener las reservaciones");
  return res.json();
};

// Crear una reservación
export const createReservation = async (data: any) => {
  const res = await fetch(RESERVATION_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al crear la reservación");
  return res.json();
};

// Actualizar estado de una reservación
export const updateReservationStatus = async (
  id: string,
  status: string
) => {
  const res = await fetch(`${RESERVATION_API}/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Error al actualizar el estado");
  return res.json();
};

// Eliminar una reservación
export const deleteReservation = async (id: string) => {
  const res = await fetch(`${RESERVATION_API}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Error al eliminar la reservación");
};
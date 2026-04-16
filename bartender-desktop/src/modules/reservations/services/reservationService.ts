import { api } from "../../../services/api";
import type { Reservation } from "../types/reservation";

export const getReservations = async (): Promise<Reservation[]> => {
  const { data } = await api.get("/reservations");
  return data;
};

export const createReservation = async (
  reservation: Reservation
): Promise<Reservation> => {
  const { data } = await api.post("/reservations", reservation);
  return data;
};

export const updateReservation = async (
  id: string,
  reservation: Partial<Reservation>
): Promise<Reservation> => {
  const { data } = await api.put(`/reservations/${id}`, reservation);
  return data;
};

export const deleteReservation = async (
  id: string
): Promise<void> => {
  await api.delete(`/reservations/${id}`);
};
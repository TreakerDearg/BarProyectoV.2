import Reservation from "../models/Reservation.js";
import Table from "../models/Table.js";

export const getReservations = async (req, res) => {
  const reservations = await Reservation.find()
    .populate("tableId")
    .sort({ date: -1 });

  res.json(reservations);
};

export const createReservation = async (req, res) => {
  const { tableId, date } = req.body;

  const existing = await Reservation.findOne({
    tableId,
    date,
    status: { $ne: "cancelled" },
  });

  if (existing) {
    return res
      .status(400)
      .json({ error: "La mesa ya está reservada" });
  }

  const reservation = new Reservation(req.body);
  await reservation.save();

  res.status(201).json(reservation);
};

export const updateReservationStatus = async (req, res) => {
  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  res.json(reservation);
};

export const deleteReservation = async (req, res) => {
  await Reservation.findByIdAndDelete(req.params.id);
  res.json({ message: "Reservación eliminada" });
};
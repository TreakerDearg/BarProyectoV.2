const toId = (value) => value?._id?.toString?.() || value?.toString?.() || null;

export const toReservationDTO = (reservation) => {
  if (!reservation) return null;

  const source = typeof reservation.toObject === "function"
    ? reservation.toObject()
    : reservation;

  const table = source.tableId && typeof source.tableId === "object"
    ? {
        id: toId(source.tableId),
        number: source.tableId.number ?? null,
        capacity: source.tableId.capacity ?? null,
        status: source.tableId.status ?? null,
        location: source.tableId.location ?? null,
      }
    : null;

  return {
    id: toId(source._id),
    customerName: source.customerName || "",
    customerPhone: source.customerPhone || "",
    customerEmail: source.customerEmail || "",
    guests: Number(source.guests) || 0,
    startTime: source.startTime || null,
    endTime: source.endTime || null,
    tableId: table?.id || toId(source.tableId),
    table,
    status: source.status || "pending",
    notes: source.notes || "",
    source: source.source || "admin",
    isVIP: Boolean(source.isVIP),
    deposit: Number(source.deposit) || 0,
    tags: Array.isArray(source.tags) ? source.tags : [],
    guestDietaryRestrictions: Array.isArray(source.guestDietaryRestrictions)
      ? source.guestDietaryRestrictions
      : [],
    createdAt: source.createdAt || null,
    updatedAt: source.updatedAt || null,
  };
};

export const toReservationListDTO = (reservations = []) => reservations.map(toReservationDTO);

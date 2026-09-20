const toId = (value) => value?._id?.toString?.() || value?.toString?.() || null;

export const toOrderDTO = (order) => {
  if (!order) return null;

  const source = typeof order.toObject === "function" ? order.toObject() : order;
  return {
    id: toId(source._id),
    status: source.status || "pending",
    sessionStatus: source.sessionStatus || "open",
    table: toId(source.table),
    sessionId: source.sessionId || null,
    userId: toId(source.userId),
    notes: source.notes || "",
    priority: source.priority || "normal",
    items: (source.items || []).map((item) => ({
      id: toId(item._id),
      productId: toId(item.product),
      menuId: toId(item.menu),
      name: item.name || "",
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
      type: item.type || "drink",
      status: item.status || "pending",
      notes: item.notes || "",
    })),
    subtotal: Number(source.subtotal) || 0,
    discountTotal: Number(source.discountTotal) || 0,
    total: Number(source.total) || 0,
    createdAt: source.createdAt || null,
    updatedAt: source.updatedAt || null,
    closedAt: source.closedAt || null,
  };
};

export const toOrderListDTO = (orders = []) => orders.map(toOrderDTO);

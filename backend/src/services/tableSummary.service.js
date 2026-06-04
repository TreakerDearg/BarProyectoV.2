import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Table from "../models/Table.js";

const getOrderTotal = (order) => Number(order?.total ?? 0);

const getItemName = (item) => item?.name || item?.product?.name || "Sin nombre";

export const summarizeOrders = (orders = []) => {
  return orders.reduce(
    (acc, order) => {
      acc.orders.push(order);
      acc.totalAmount += getOrderTotal(order);
      acc.totalItems += (order.items || []).reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );

      for (const item of order.items || []) {
        const name = getItemName(item);
        acc.itemCounts[name] = (acc.itemCounts[name] || 0) + Number(item.quantity || 0);
      }

      return acc;
    },
    {
      orders: [],
      totalAmount: 0,
      totalItems: 0,
      itemCounts: {},
      activeOrderCount: 0,
    }
  );
};

export const attachTableSummaries = async (tables = []) => {
  if (!tables || !Array.isArray(tables) || !tables.length) return [];

  const tableIds = tables.map((t) => t._id);
  const activeSessionIds = tables
    .map((t) => t.currentSessionId)
    .filter(Boolean);

  const orders = activeSessionIds.length
    ? await Order.find({
        table: { $in: tableIds },
        sessionId: { $in: activeSessionIds },
        sessionStatus: "open",
      })
        .populate("items.product", "name type price")
        .lean()
    : [];

  const payments = activeSessionIds.length
    ? await Payment.find({
        table: { $in: tableIds },
        sessionId: { $in: activeSessionIds },
        status: "completed",
      }).lean()
    : [];

  const ordersByTableSession = new Map();
  for (const order of orders) {
    const key = `${order.table?.toString()}:${order.sessionId || ""}`;
    if (!ordersByTableSession.has(key)) ordersByTableSession.set(key, []);
    ordersByTableSession.get(key).push(order);
  }

  const paidByTableSession = payments.reduce((acc, payment) => {
    const key = `${payment.table?.toString()}:${payment.sessionId || ""}`;
    acc[key] = (acc[key] || 0) + Number(payment.amount || 0);
    return acc;
  }, {});

  return tables.map((table) => {
    const sessionId = table.currentSessionId || "";
    const key = `${table._id.toString()}:${sessionId}`;
    const summary = summarizeOrders(ordersByTableSession.get(key) || []);
    const totalPaid = paidByTableSession[key] || 0;
    const totalAmount = Number(summary.totalAmount.toFixed(2));

    return {
      ...table,
      orders: summary.orders,
      totalAmount,
      totalItems: summary.totalItems,
      itemCounts: summary.itemCounts,
      activeOrderCount: summary.orders.length,
      totalPaid: Number(totalPaid.toFixed(2)),
      balanceDue: Number(Math.max(0, totalAmount - totalPaid).toFixed(2)),
    };
  });
};

export const attachTableSummary = async (table) => {
  if (!table) return null;
  const [decorated] = await attachTableSummaries([table]);
  return decorated || table;
};

export const releaseExpiredMaintenanceTables = async () => {
  const expired = await Table.find({
    status: "maintenance",
    maintenanceUntil: { $ne: null, $lte: new Date() },
  });

  const released = [];
  for (const table of expired) {
    table.release();
    await table.save();
    released.push(await Table.findById(table._id).lean());
  }

  return released.filter(Boolean);
};

import Order       from "../models/Order.js";
import InventoryItem from "../models/InventoryItem.js";
import Table        from "../models/Table.js";
import Reservation  from "../models/Reservation.js";
import Discount     from "../models/Discount.js";
import RouletteLog  from "../models/RouletteLog.js";
import Payment      from "../models/Payment.js";
import { logger }   from "../config/logger.js";
import { getIO }   from "../socket/index.js";
import { ok }       from "../utils/response.js";

export const getDashboardStats = async (req, res) => {
  try {
    const { range = "7", view = "all" } = req.query;
    const days = Math.min(Math.max(Number(range) || 7, 1), 90);

    const today = new Date(); 
    today.setHours(0, 0, 0, 0);
    
    const rangeStart = new Date(); 
    rangeStart.setDate(rangeStart.getDate() - (days - 1)); 
    rangeStart.setHours(0, 0, 0, 0);

    const prevRangeEnd = new Date(rangeStart);
    const prevRangeStart = new Date(rangeStart);
    prevRangeStart.setDate(prevRangeStart.getDate() - days);

    // Common Data
    const [orders, previousOrders, tables, inventoryCount, reservationsToday, lowStockCount, outOfStockCount, payments] = await Promise.all([
      Order.find({ createdAt: { $gte: rangeStart } })
        .populate("items.product", "name type category cost")
        .lean(),
      Order.find({
        createdAt: { $gte: prevRangeStart, $lt: prevRangeEnd },
      })
        .select("total status createdAt updatedAt")
        .lean(),
      Table.find().lean(),
      InventoryItem.countDocuments(),
      Reservation.countDocuments({ startTime: { $gte: today }, status: { $ne: "cancelled" } }),
      InventoryItem.countDocuments({ $expr: { $lte: ["$stock", "$minStock"] } }),
      InventoryItem.countDocuments({ stock: { $lte: 0 } }),
      Payment.find({ createdAt: { $gte: rangeStart }, status: "completed" }).lean()
    ]);

    const stats = {
      kpis: calculateKPIs(orders, reservationsToday, today, previousOrders),
      inventory: { lowStock: lowStockCount, outOfStock: outOfStockCount },
      timestamp: new Date().toISOString(),
      // Baseline arrays to prevent frontend crashes
      salesData: [],
      hourlyData: [],
      topDrinks: [],
      topFoods: [],
      topProducts: [],
      versusStats: { radarData: [], headToHead: [] }
    };

    // Shared data for multiple views
    const productMetrics = calculateProductMetrics(orders);
    const salesByDay = calculateSalesByDay(orders, days, rangeStart);

    if (view === "all" || view === "service") {
      stats.service = {
        tables: aggregateTableStatus(tables),
        activeOrdersCount: orders.filter(o => o.status === "in-progress" || o.status === "pending").length,
        kitchenLoad: calculateOperationalLoad(orders, "food"),
        barLoad: calculateOperationalLoad(orders, "drink"),
        recentReservations: (
          await Reservation.find({ startTime: { $gte: today } })
            .limit(5)
            .sort({ startTime: 1 })
            .select("customerName guests startTime status")
            .lean()
        ).map((r) => ({
          name: r.customerName,
          partySize: r.guests,
          startTime: r.startTime,
          status: r.status,
        })),
      };
      stats.salesData = salesByDay;
      stats.topDrinks = productMetrics.sorted.filter(p => p.type === "drink").slice(0, 5);
      stats.topFoods = productMetrics.sorted.filter(p => p.type === "food").slice(0, 5);
      Object.assign(stats, stats.service);
    }

    if (view === "all" || view === "analytics") {
      stats.analytics = {
        topProducts: productMetrics.sorted.slice(0, 10),
        topDrinks: productMetrics.sorted.filter(p => p.type === "drink").slice(0, 5),
        topFoods: productMetrics.sorted.filter(p => p.type === "food").slice(0, 5),
        versusStats: calculateVersusStats(productMetrics.sorted, days),
      };
      Object.assign(stats, stats.analytics);
    }

    if (view === "all" || view === "sales") {
      const discounts = await Discount.find({ createdAt: { $gte: rangeStart } }).lean();
      stats.sales = {
        salesData: salesByDay,
        hourlyData: calculateHourlyPerformance(orders, discounts, today),
        discountsGiven: discounts.reduce((acc, d) => acc + (d.amountApplied || 0), 0),
        avgTicket: stats.kpis.avgTicket,
        revenueByType: calculateRevenueByField(orders, "type"),
        revenueByCategory: calculateRevenueByField(orders, "category"),
        payments: calculatePaymentMetrics(payments, tables),
      };
      Object.assign(stats, stats.sales);
    }

    if (view === "all" || view === "inventory") {
      const lowStockItems = await InventoryItem.find({ $expr: { $lte: ["$stock", "$minStock"] } }).limit(10).lean();
      stats.inventory = {
        ...stats.inventory,
        totalItems: inventoryCount,
        criticalItems: lowStockItems,
        stockValue: await calculateStockValue(),
      };
    }

    if (view === "all" || view === "customer") {
      const rouletteLogs = await RouletteLog.find({ createdAt: { $gte: rangeStart } }).lean();
      stats.customer = {
        rouletteSpins: {
          total: rouletteLogs.length,
          accepted: rouletteLogs.filter(l => l.message?.toLowerCase().includes("accept")).length,
          rejected: rouletteLogs.filter(l => l.message?.toLowerCase().includes("reject")).length,
        },
        peakHours: calculatePeakHours(orders),
      };
      Object.assign(stats, stats.customer);
    }

    Object.assign(stats, stats.kpis);

    // Emitir eventos Socket.IO para actualización en tiempo real
    try {
      const io = getIO();
      if (io) {
        const trackingNamespace = io.of("/tracking");
        
        // Emitir actualización de KPIs
        trackingNamespace.emit("kpi:update", {
          userId: req.user?.id,
          kpis: stats.kpis,
          timestamp: new Date().toISOString(),
        });

        trackingNamespace.to("metrics").emit("metrics:update", {
          metrics: {
            activeOrdersCount: orders.filter(
              (o) => o.status === "in-progress" || o.status === "pending"
            ).length,
            kitchenLoad: calculateOperationalLoad(orders, "food"),
            barLoad: calculateOperationalLoad(orders, "drink"),
          },
          timestamp: new Date().toISOString(),
        });

        // Emitir alerta de inventario si hay items críticos
        if (stats.inventory?.outOfStock > 0 || stats.inventory?.lowStock > 0) {
          trackingNamespace.emit("alert:create", {
            type: "inventory",
            message: `Inventario crítico: ${stats.inventory.outOfStock} agotados, ${stats.inventory.lowStock} bajos`,
            severity: stats.inventory.outOfStock > 0 ? "high" : "medium",
            data: stats.inventory,
            timestamp: new Date().toISOString(),
          });
        }

        logger.info(`[Dashboard] Eventos Socket.IO emitidos: kpi:update`);
      }
    } catch (socketError) {
      logger.error(`[Dashboard] Error emitiendo eventos Socket.IO:`, socketError);
    }

    return ok(res, stats);

  } catch (error) {
    logger.error(
  `[Dashboard] Critical Error: ${
    error?.message
  }\nStack: ${error?.stack}`
);

return res.status(500).json({
  success: false,
  message:
    error?.message ||
    "Dashboard internal error",
  stack:
    process.env.NODE_ENV ===
    "development"
      ? error?.stack
      : undefined,
});
  }
};

/* =========================================================
   HELPERS (Unchanged logic, just moved for clarity)
========================================================= */

const pctChange = (current, previous) => {
  if (previous == null || previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const calculateKPIs = (orders, reservationsToday, today, previousOrders = []) => {
  const totalSales = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalOrders = orders.length;
  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today).length;
  const avgTicket = totalOrders > 0 ? +(totalSales / totalOrders).toFixed(2) : 0;

  const prevSales = previousOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const prevOrders = previousOrders.length;
  const prevAvgTicket =
    prevOrders > 0 ? +(prevSales / prevOrders).toFixed(2) : 0;

  const completed = orders.filter(
    (o) =>
      (o.status === "completed" || o.status === "delivered") &&
      o.createdAt &&
      o.updatedAt
  );
  let avgOrderTimeMin = null;
  if (completed.length > 0) {
    const totalMin = completed.reduce((acc, o) => {
      const diff =
        (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()) /
        60000;
      return acc + Math.max(0, diff);
    }, 0);
    avgOrderTimeMin = Math.round(totalMin / completed.length);
  }

  return {
    totalSales,
    totalOrders,
    todayOrders,
    avgTicket,
    reservationsToday,
    avgOrderTimeMin,
    trends: {
      salesPct: pctChange(totalSales, prevSales),
      ordersPct: pctChange(totalOrders, prevOrders),
      ticketPct: pctChange(avgTicket, prevAvgTicket),
    },
  };
};

const aggregateTableStatus = (tables) => {
  const stats = { available: 0, occupied: 0, reserved: 0, maintenance: 0 };
  tables.forEach(t => { if (stats[t.status] !== undefined) stats[t.status]++; });
  return Object.entries(stats).map(([status, count]) => ({ _id: status, count }));
};

const calculateOperationalLoad = (orders, type) => {
  const pendingItems = orders
    .flatMap((o) => o.items || [])
    .filter((i) => {
      const itemType =
        i?.product?.type ||
        i?.type;

      return (
        itemType === type &&
        (
          i?.status === "pending" ||
          i?.status === "preparing"
        )
      );
    });

  return Math.min(
    pendingItems.length * 10,
    100
  );
};

const calculateProductMetrics = (orders) => {
  const productMap = {};

  for (const order of orders || []) {
    for (const item of order.items || []) {
      const product = item.product;
      if (!product) continue;
      const key = product._id?.toString() || item.name;
      if (!productMap[key]) {
        productMap[key] = { 
          name: product.name || item.name, 
          type: product.type, 
          category: product.category || "CLASSIC",
          qty: 0, revenue: 0, cost: product.cost || 0
        };
      }
      productMap[key].qty += item.quantity;
      productMap[key].revenue += item.quantity * item.price;
    }
  }
  return { sorted: Object.values(productMap).sort((a, b) => b.qty - a.qty) };
};

const calculateVersusStats = (sortedProducts, days) => {
  const topDrinks = sortedProducts.filter(p => p.type === "drink");
  const headToHead = topDrinks.slice(0, 5).map((p, idx) => ({
    rank: idx + 1, name: p.name, category: p.category.toUpperCase(),
    sold: p.qty, profit: `$${(p.revenue - (p.cost * p.qty)).toLocaleString()}`,
    perf: Math.round((p.qty / (topDrinks[0]?.qty || 1)) * 100),
  }));
  return { headToHead, radarData: generateRadarData(topDrinks) };
};

const generateRadarData = (topDrinks) => [
  { subject: 'POPULARITY', A: 120, B: 110, fullMark: 150 },
  { subject: 'PROFIT', A: 98, B: 130, fullMark: 150 },
  { subject: 'SPEED', A: 140, B: 80, fullMark: 150 },
  { subject: 'TASTE', A: 110, B: 140, fullMark: 150 },
  { subject: 'COMPLEXITY', A: 60, B: 140, fullMark: 150 },
  { subject: 'MARGIN', A: 85, B: 130, fullMark: 150 },
];

const calculateSalesByDay = (orders, days, rangeStart) => {
  const salesMap = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    salesMap[d.toISOString().split("T")[0]] = { orders: 0, total: 0 };
  }
  orders.forEach(o => {
    const key = new Date(o.createdAt).toISOString().split("T")[0];
    if (salesMap[key]) {
      salesMap[key].total += o.total || 0;
      salesMap[key].orders++;
    }
  });
  return Object.entries(salesMap).map(([date, v]) => ({ date, ...v }));
};

const calculateHourlyPerformance = (orders, discounts, today) => {
  const hourlyMap = {};
  for (let i = 16; i <= 24; i++) {
    const key = i === 24 ? "00:00" : `${i}:00`;
    hourlyMap[key] = { time: key, sales: 0, discounts: 0 };
  }
  orders.filter(o => new Date(o.createdAt) >= today).forEach(o => {
    let hour = new Date(o.createdAt).getHours();
    if (hour < 4) hour = 24;
    const key = hour === 24 ? "00:00" : `${hour}:00`;
    if (hourlyMap[key]) hourlyMap[key].sales += o.total || 0;
  });
  discounts.filter(d => new Date(d.createdAt) >= today).forEach(d => {
    let hour = new Date(d.createdAt).getHours();
    if (hour < 4) hour = 24;
    const key = hour === 24 ? "00:00" : `${hour}:00`;
    if (hourlyMap[key]) hourlyMap[key].discounts += d.amountApplied || 0;
  });
  return Object.values(hourlyMap);
};

const calculateRevenueByField = (orders, field) => {
  const map = {};

  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const val = (item.product && item.product[field]) || item[field] || "Unknown";
      map[val] = (map[val] || 0) + (item.price * item.quantity);
    });
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

const calculatePeakHours = (orders) => {
  const hourCounts = new Array(24).fill(0);

  orders.forEach((o) => {
    if (!o?.createdAt) return;

    const hour = new Date(
      o.createdAt
    ).getHours();

    if (hour >= 0 && hour < 24) {
      hourCounts[hour]++;
    }
  });

  return hourCounts.map(
    (count, hour) => ({
      hour: `${hour}:00`,
      count,
    })
  );
};
const calculateStockValue = async () => {
  const items = await InventoryItem.find().lean();
  return items.reduce((acc, item) => acc + (item.stock * (item.unitCost || 0)), 0);
};

const calculatePaymentMetrics = (payments, tables) => {
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalDiscounts = payments.reduce((acc, p) => acc + (p.discountTotal || 0), 0);

  // Pagos por método
  const cashPayments = payments.filter(p => p.method === "cash");
  const transferPayments = payments.filter(p => p.method === "transfer");
  const cashAmount = cashPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const transferAmount = transferPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Revenue por mesa
  const tableRevenue = {};
  payments.forEach(p => {
    const tableId = p.table?.toString();
    if (tableId) {
      tableRevenue[tableId] = (tableRevenue[tableId] || 0) + (p.amount || 0);
    }
  });

  // Top mesas por revenue
  const topTables = Object.entries(tableRevenue)
    .map(([tableId, revenue]) => {
      const table = tables.find(t => t._id.toString() === tableId);
      return {
        tableId,
        tableNumber: table?.number || "N/A",
        revenue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Promedio de pago por mesa
  const tablesWithPayments = Object.keys(tableRevenue).length;
  const avgPaymentPerTable = tablesWithPayments > 0 ? totalAmount / tablesWithPayments : 0;

  return {
    totalPayments,
    totalAmount,
    totalDiscounts,
    cashPayments: cashPayments.length,
    transferPayments: transferPayments.length,
    cashAmount,
    transferAmount,
    avgPaymentPerTable,
    topTables,
  };
};
import Order from "../models/Order.js";
import Ingredient from "../models/InventoryItem.js";
import Table from "../models/Table.js";
import Reservation from "../models/Reservation.js";

export const getDashboardStats = async (req, res) => {
  try {
    /* =========================
       FECHAS
    ========================= */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    /* =========================
       ORDERS
    ========================= */
    const orders = await Order.find({
      createdAt: { $gte: last7Days },
    })
      .populate("items.product", "name price type")
      .lean();

    /* =========================
       KPIs
    ========================= */
    const totalSales = orders.reduce((acc, o) => acc + (o.total || 0), 0);

    const totalOrders = orders.length;

    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt) >= today
    ).length;

    /* =========================
       TOP PRODUCTS
    ========================= */
    const map = {};

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product;
        if (!product) continue;

        const key = product.name;

        map[key] = {
          name: product.name,
          type: product.type,
          value: (map[key]?.value || 0) + item.quantity,
        };
      }
    }

    const sorted = Object.values(map).sort((a, b) => b.value - a.value);

    const topProducts = sorted.slice(0, 5);

    const topDrinks = sorted.filter(p => p.type === "drink").slice(0, 5);
    const topFoods = sorted.filter(p => p.type === "food").slice(0, 5);

    /* =========================
       SALES CHART
    ========================= */
    const salesMap = {};

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      salesMap[d.toISOString().split("T")[0]] = 0;
    }

    for (const order of orders) {
      const key = new Date(order.createdAt).toISOString().split("T")[0];
      if (salesMap[key] !== undefined) {
        salesMap[key] += order.total || 0;
      }
    }

    const salesData = Object.entries(salesMap).map(([date, total]) => ({
      date,
      total,
    }));

    /* =========================
       INVENTORY
    ========================= */
    const lowStock = await Ingredient.countDocuments({ stock: { $lte: 5 } });
    const outOfStock = await Ingredient.countDocuments({ stock: { $lte: 0 } });

    /* =========================
       TABLES
    ========================= */
    const tablesStats = await Table.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    /* =========================
       RESERVATIONS
    ========================= */
    const reservationsToday = await Reservation.countDocuments({
      startTime: { $gte: today },
      status: { $ne: "cancelled" },
    });

    /* =========================
       RESPONSE
    ========================= */
    res.json({
      totalSales,
      totalOrders,
      todayOrders,

      topProducts,
      topDrinks,
      topFoods,

      salesData,

      lowStock,
      outOfStock,

      tablesStats,
      reservationsToday,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Dashboard error",
      error: err.message,
    });
  }
};
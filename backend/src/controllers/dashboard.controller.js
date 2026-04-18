import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Ingredient from "../models/InventoryItem.js";
import Table from "../models/Table.js";
import Reservation from "../models/Reservation.js";

/* ==============================
   DASHBOARD STATS (CORE)
============================== */
export const getDashboardStats = async (req, res) => {
  try {
    /* ========================
       FECHAS
    ======================== */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    /* ========================
       ÓRDENES BASE
    ======================== */
    const orders = await Order.find({
      createdAt: { $gte: last7Days },
    })
      .populate("items.productId", "name price type")
      .lean();

    /* ========================
       KPIs PRINCIPALES
    ======================== */
    const totalSales = orders.reduce(
      (sum, o) => sum + (o.total || 0),
      0
    );

    const totalOrders = orders.length;

    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt) >= today
    ).length;

    /* ========================
       TOP PRODUCTOS
    ======================== */
    const productMap = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = item.productId;
        if (!product) return;

        const key = product.name;

        productMap[key] = {
          name: product.name,
          value:
            (productMap[key]?.value || 0) +
            (item.quantity || 0),
          type: product.type,
        };
      });
    });

    const sortedProducts = Object.values(productMap).sort(
      (a, b) => b.value - a.value
    );

    const topProducts = sortedProducts.slice(0, 5);

    const topDrinks = sortedProducts
      .filter((p) => p.type === "drink")
      .slice(0, 5);

    const topFoods = sortedProducts
      .filter((p) => p.type === "food")
      .slice(0, 5);

    const topProduct = sortedProducts[0]?.name || "N/A";

    /* ========================
       VENTAS 7 DÍAS (REAL)
    ======================== */
    const salesMap = {};

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split("T")[0];
      salesMap[key] = 0;
    }

    orders.forEach((o) => {
      const key = new Date(o.createdAt)
        .toISOString()
        .split("T")[0];

      if (salesMap[key] !== undefined) {
        salesMap[key] += o.total || 0;
      }
    });

    const salesData = Object.entries(salesMap).map(
      ([date, total]) => ({
        name: new Date(date).toLocaleDateString("es-AR", {
          weekday: "short",
        }),
        total,
      })
    );

    /* ========================
       INVENTARIO ( REAL)
    ======================== */
    const lowStock = await Ingredient.countDocuments({
      stock: { $lte: 5 },
    });

    const outOfStock = await Ingredient.countDocuments({
      stock: { $lte: 0 },
    });

    /* ========================
       MESAS ( TIEMPO REAL)
    ======================== */
    const tablesStats = await Table.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    /* ========================
       RESERVAS HOY
    ======================== */
    const reservationsToday = await Reservation.countDocuments({
      startTime: { $gte: today },
      status: { $nin: ["cancelled"] },
    });

    /* ========================
       RESPUESTA FINAL
    ======================== */
    res.json({
      /* KPIs */
      totalSales,
      totalOrders,
      todayOrders,

      /* TOP */
      topProduct,
      topProducts,
      topDrinks,
      topFoods,

      /* CHART */
      salesData,

      /* INVENTARIO */
      lowStock,
      outOfStock,

      /* MESAS */
      tablesStats,

      /* RESERVAS */
      reservationsToday,
    });

  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Error en dashboard",
      error: error.message,
    });
  }
};
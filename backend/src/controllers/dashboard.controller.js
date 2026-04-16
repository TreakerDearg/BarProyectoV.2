import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Obtener órdenes con productos poblados
    const orders = await Order.find()
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 })
      .lean();

    /* ==============================
       VENTAS TOTALES
    ============================== */
    const totalSales = orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

    /* ==============================
       PEDIDOS TOTALES
    ============================== */
    const totalOrders = orders.length;

    /* ==============================
       PEDIDOS DE HOY
    ============================== */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    }).length;

    /* ==============================
       BEBIDAS MÁS VENDIDAS
    ============================== */
    const drinkMap = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const name = item.productId?.name || "Desconocido";
        const quantity = item.quantity || 0;

        drinkMap[name] = (drinkMap[name] || 0) + quantity;
      });
    });

    const sortedDrinks = Object.entries(drinkMap).sort(
      (a, b) => b[1] - a[1]
    );

    const topDrink = sortedDrinks[0]?.[0] || "N/A";

    const topDrinks = sortedDrinks.map(([name, value]) => ({
      name,
      value,
    }));

    /* ==============================
       VENTAS DE LOS ÚLTIMOS 7 DÍAS
    ============================== */
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const salesMap = {};
    last7Days.forEach((date) => (salesMap[date] = 0));

    orders.forEach((order) => {
      const date = new Date(order.createdAt)
        .toISOString()
        .split("T")[0];

      if (salesMap[date] !== undefined) {
        salesMap[date] += order.total || 0;
      }
    });

    const salesData = Object.entries(salesMap).map(
      ([date, total]) => ({
        name: new Date(date).toLocaleDateString("es-ES", {
          weekday: "short",
        }),
        total,
      })
    );

    /* ==============================
       PRODUCTOS CON BAJO STOCK
    ============================== */
    const lowStockProducts = await Product.countDocuments({
      stock: { $lt: 5 },
    });

    /* ==============================
       RESPUESTA FINAL
    ============================== */
    res.status(200).json({
      totalSales,
      totalOrders,
      todayOrders,
      topDrink,
      lowStockProducts,
      salesData,
      topDrinks,
    });
  } catch (error) {
    console.error("Error en dashboard:", error);
    res.status(500).json({
      message: "Error al obtener estadísticas del dashboard",
      error: error.message,
    });
  }
};
import mongoose from "mongoose";

/* =========================================================
   TABLE ANALYTICS SCHEMA
   Métricas históricas de uso y rendimiento de mesas
========================================================= */
const tableAnalyticsSchema = new mongoose.Schema(
  {
    /* =========================
       RELACIÓN CON MESA
    ========================= */
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },

    /* =========================
       PERÍODO DE TIEMPO
    ========================= */
    date: {
      type: Date,
      required: true,
      index: true,
    },

    period: {
      type: String,
      enum: ["hourly", "daily", "weekly", "monthly"],
      required: true,
      index: true,
    },

    /* =========================
       MÉTRICAS DE OCUPACIÓN
    ========================= */
    occupancy: {
      totalSessions: { type: Number, default: 0 },
      totalMinutesOccupied: { type: Number, default: 0 },
      averageSessionDuration: { type: Number, default: 0 },
      peakOccupancyTime: { type: String }, // "18:00"
      occupancyRate: { type: Number, default: 0 }, // Percentage 0-100
    },

    /* =========================
       MÉTRICAS DE REVENUE
    ========================= */
    revenue: {
      totalRevenue: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 },
      revenuePerHour: { type: Number, default: 0 },
      revenuePerSession: { type: Number, default: 0 },
      tips: { type: Number, default: 0 },
    },

    /* =========================
       MÉTRICAS DE PEDIDOS
    ========================= */
    orders: {
      totalOrders: { type: Number, default: 0 },
      averageItemsPerOrder: { type: Number, default: 0 },
      cancelledOrders: { type: Number, default: 0 },
      cancellationRate: { type: Number, default: 0 },
    },

    /* =========================
       MÉTRICAS DE PAGOS
    ========================= */
    payments: {
      totalPayments: { type: Number, default: 0 },
      paymentMethods: {
        cash: { type: Number, default: 0 },
        transfer: { type: Number, default: 0 },
        card: { type: Number, default: 0 },
        qr: { type: Number, default: 0 },
        wallet: { type: Number, default: 0 },
        split: { type: Number, default: 0 },
      },
      averagePaymentAmount: { type: Number, default: 0 },
    },

    /* =========================
       MÉTRICAS DE CLIENTES
    ========================= */
    customers: {
      totalCustomers: { type: Number, default: 0 },
      averagePartySize: { type: Number, default: 0 },
      returningCustomers: { type: Number, default: 0 },
      newCustomers: { type: Number, default: 0 },
    },

    /* =========================
       MÉTRICAS DE RENDIMIENTO
    ========================= */
    performance: {
      turnoverRate: { type: Number, default: 0 }, // Sessions per hour
      efficiency: { type: Number, default: 0 }, // Revenue per minute occupied
      ranking: { type: Number, default: 0 }, // Position among all tables
      score: { type: Number, default: 0 }, // Composite performance score 0-100
    },

    /* =========================
       ALERTAS Y ANOMALÍAS
    ========================= */
    alerts: {
      longSessions: { type: Number, default: 0 }, // Sessions > 2 hours
      lowRevenue: { type: Number, default: 0 }, // Sessions with low revenue
      highCancellationRate: { type: Boolean, default: false },
      maintenanceIssues: { type: Number, default: 0 },
    },

    /* =========================
       METADATA
    ========================= */
    location: {
      type: String,
      enum: ["indoor", "outdoor", "bar"],
    },

    tags: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   ÍNDICES COMPUESTOS
========================================================= */
tableAnalyticsSchema.index({ table: 1, date: -1 });
tableAnalyticsSchema.index({ date: -1, period: 1 });
tableAnalyticsSchema.index({ period: 1, date: -1 });

/* =========================================================
   VIRTUALS
========================================================= */
tableAnalyticsSchema.virtual("isPeakHour").get(function () {
  if (!this.occupancy.peakOccupancyTime) return false;
  const hour = parseInt(this.occupancy.peakOccupancyTime.split(":")[0]);
  return hour >= 19 && hour <= 23; // Consider 7-11 PM as peak hours
});

tableAnalyticsSchema.virtual("performanceGrade").get(function () {
  const score = this.performance.score;
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
});

/* =========================================================
   METHODS
========================================================= */

/**
 * Calcula el score de rendimiento compuesto
 */
tableAnalyticsSchema.methods.calculatePerformanceScore = function () {
  const weights = {
    revenue: 0.3,
    occupancy: 0.25,
    efficiency: 0.2,
    turnover: 0.15,
    customerSatisfaction: 0.1,
  };

  // Normalized scores (0-100)
  const revenueScore = Math.min(100, (this.revenue.totalRevenue / 10000) * 100);
  const occupancyScore = this.occupancy.occupancyRate;
  const efficiencyScore = Math.min(100, (this.performance.efficiency / 10) * 100);
  const turnoverScore = Math.min(100, (this.performance.turnoverRate / 2) * 100);
  const customerScore = Math.min(100, (this.customers.returningCustomers / (this.customers.totalCustomers || 1)) * 100);

  const compositeScore =
    (revenueScore * weights.revenue) +
    (occupancyScore * weights.occupancy) +
    (efficiencyScore * weights.efficiency) +
    (turnoverScore * weights.turnover) +
    (customerScore * weights.customerSatisfaction);

  this.performance.score = Math.round(compositeScore);
  return this.performance.score;
};

/**
 * Detecta anomalías en los datos
 */
tableAnalyticsSchema.methods.detectAnomalies = function () {
  const anomalies = [];

  // Long sessions alert
  if (this.occupancy.averageSessionDuration > 120) {
    anomalies.push("Sesiones promedio muy largas (> 2 horas)");
    this.alerts.longSessions = Math.floor(this.occupancy.totalSessions / 5);
  }

  // Low revenue alert
  if (this.revenue.averageOrderValue < 500) {
    anomalies.push("Ticket promedio bajo");
    this.alerts.lowRevenue = Math.floor(this.orders.totalOrders / 10);
  }

  // High cancellation rate
  if (this.orders.cancellationRate > 20) {
    anomalies.push("Tasa de cancelación alta (> 20%)");
    this.alerts.highCancellationRate = true;
  }

  return anomalies;
};

/* =========================================================
   STATICS
========================================================= */

/**
 * Genera analytics para un período específico
 */
tableAnalyticsSchema.statics.generateAnalytics = async function (tableId, date, period) {
  const Table = mongoose.model("Table");
  const Order = mongoose.model("Order");
  const Payment = mongoose.model("Payment");

  const table = await Table.findById(tableId);
  if (!table) throw new Error("Mesa no encontrada");

  // Determinar rango de fechas según período
  let startDate, endDate;
  const currentDate = new Date(date);

  switch (period) {
    case "hourly":
      startDate = new Date(currentDate);
      startDate.setMinutes(0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);
      break;
    case "daily":
      startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
      break;
    case "weekly":
      startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      break;
    case "monthly":
      startDate = new Date(currentDate);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      break;
  }

  // Obtener órdenes del período
  const orders = await Order.find({
    table: tableId,
    createdAt: { $gte: startDate, $lt: endDate },
  }).populate("payment");

  // Obtener pagos del período
  const payments = await Payment.find({
    table: tableId,
    createdAt: { $gte: startDate, $lt: endDate },
    status: "completed",
  });

  // Calcular métricas
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalSessions = orders.length;
  const totalOrderItems = orders.reduce((sum, o) => sum + o.items.length, 0);
  const cancelledOrders = orders.filter(o => o.status === "cancelled").length;

  // Calcular duración promedio de sesiones
  const sessionDurations = orders
    .filter(o => o.createdAt && o.closedAt)
    .map(o => (new Date(o.closedAt).getTime() - new Date(o.createdAt).getTime()) / 60000);
  const avgSessionDuration = sessionDurations.length > 0
    ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
    : 0;

  // Calcular métodos de pago
  const paymentMethods = {
    cash: payments.filter(p => p.method === "cash").length,
    transfer: payments.filter(p => p.method === "transfer").length,
    card: payments.filter(p => p.method === "card").length,
    qr: payments.filter(p => p.method === "qr").length,
    wallet: payments.filter(p => p.method === "wallet").length,
    split: payments.filter(p => p.method === "split").length,
  };

  // Crear o actualizar analytics
  const analytics = await this.findOneAndUpdate(
    { table: tableId, date: startDate, period },
    {
      table: tableId,
      date: startDate,
      period,
      location: table.location,
      tags: table.tags?.map(t => t.label) || [],
      occupancy: {
        totalSessions,
        totalMinutesOccupied: Math.round(avgSessionDuration * totalSessions),
        averageSessionDuration: Math.round(avgSessionDuration),
        occupancyRate: Math.min(100, (totalSessions / 12) * 100), // Assuming max 12 sessions per period
      },
      revenue: {
        totalRevenue,
        averageOrderValue: totalSessions > 0 ? totalRevenue / totalSessions : 0,
        revenuePerHour: totalSessions > 0 ? totalRevenue / (avgSessionDuration / 60 || 1) : 0,
        revenuePerSession: totalSessions > 0 ? totalRevenue / totalSessions : 0,
      },
      orders: {
        totalOrders: totalSessions,
        averageItemsPerOrder: totalSessions > 0 ? totalOrderItems / totalSessions : 0,
        cancelledOrders,
        cancellationRate: totalSessions > 0 ? (cancelledOrders / totalSessions) * 100 : 0,
      },
      payments: {
        totalPayments: payments.length,
        paymentMethods,
        averagePaymentAmount: payments.length > 0 ? totalRevenue / payments.length : 0,
      },
      customers: {
        totalCustomers: totalSessions * 2, // Estimate
        averagePartySize: 2,
        returningCustomers: Math.floor(totalSessions * 0.3), // Estimate
        newCustomers: Math.floor(totalSessions * 0.7), // Estimate
      },
      performance: {
        turnoverRate: avgSessionDuration > 0 ? 60 / avgSessionDuration : 0,
        efficiency: avgSessionDuration > 0 ? totalRevenue / avgSessionDuration : 0,
      },
    },
    { upsert: true, new: true }
  );

  // Calcular score y detectar anomalías
  analytics.calculatePerformanceScore();
  analytics.detectAnomalies();
  await analytics.save();

  return analytics;
};

/**
 * Obtener ranking de mesas por rendimiento
 */
tableAnalyticsSchema.statics.getTableRanking = async function (period = "daily", limit = 10) {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "daily":
      startDate.setDate(endDate.getDate() - 1);
      break;
    case "weekly":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "monthly":
      startDate.setMonth(endDate.getMonth() - 1);
      break;
  }

  const analytics = await this.find({
    date: { $gte: startDate, $lte: endDate },
    period,
  })
    .populate("table", "number location")
    .sort({ "performance.score": -1 })
    .limit(limit);

  return analytics.map((a, index) => ({
    ...a.toObject(),
    ranking: index + 1,
  }));
};

/* =========================================================
   TO JSON
========================================================= */
tableAnalyticsSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("TableAnalytics", tableAnalyticsSchema);

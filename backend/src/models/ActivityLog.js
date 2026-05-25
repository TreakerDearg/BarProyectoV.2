import mongoose from "mongoose";

const ACTIVITY_TYPES = [
  "login",
  "logout",
  "order_created",
  "order_completed",
  "order_cancelled",
  "payment_processed",
  "inventory_updated",
  "discount_applied",
  "table_assigned",
  "menu_viewed",
  "recipe_accessed",
  "roulette_used",
  "permission_change",
  "settings_updated",
];

const activityLogSchema = new mongoose.Schema(
  {
    /* ================= USER INFO ================= */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
      enum: ["admin", "bartender", "waiter", "cashier", "kitchen", "client"],
      index: true,
    },

    /* ================= ACTIVITY ================= */
    activityType: {
      type: String,
      required: true,
      enum: ACTIVITY_TYPES,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* ================= SHIFT CONTEXT ================= */
    shift: {
      type: String,
      enum: ["morning", "afternoon", "night", "event"],
      index: true,
    },

    /* ================= DURATION ================= */
    duration: {
      type: Number, // en milisegundos
      default: 0,
    },

    /* ================= REFERENCES ================= */
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      index: true,
    },
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
      index: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      index: true,
    },

    /* ================= SESSION ================= */
    sessionId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ================= INDEXES ================= */
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ activityType: 1, timestamp: -1 });
activityLogSchema.index({ shift: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 }); // Para consultas de tiempo real

/* ================= METHODS ================= */
// Calcular métricas de actividad para un usuario
activityLogSchema.statics.calculateMetrics = async function (userId, startDate, endDate) {
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
    timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
  };

  const activities = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$activityType",
        count: { $sum: 1 },
        avgDuration: { $avg: "$duration" },
      },
    },
  ]);

  const totalActivities = activities.reduce((sum, a) => sum + a.count, 0);
  const activitiesByType = activities.reduce((acc, a) => {
    acc[a._id] = a.count;
    return acc;
  }, {});

  // Calcular tiempo promedio de sesión
  const loginLogoutPairs = await this.aggregate([
    {
      $match: {
        ...match,
        activityType: { $in: ["login", "logout"] },
      },
    },
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: "$sessionId",
        loginTime: { $first: "$timestamp" },
        logoutTime: { $last: "$timestamp" },
      },
    },
    {
      $project: {
        duration: {
          $subtract: ["$logoutTime", "$loginTime"],
        },
      },
    },
  ]);

  const totalDuration = loginLogoutPairs.reduce((sum, p) => sum + (p.duration || 0), 0);
  const averageSessionDuration = loginLogoutPairs.length > 0 ? totalDuration / loginLogoutPairs.length : 0;

  // Encontrar hora pico
  const hourlyActivity = await this.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: {
          $hour: "$timestamp",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  const peakActivityTime = hourlyActivity.length > 0 ? `${hourlyActivity[0]._id}:00` : "N/A";

  // Módulos más usados
  const moduleUsage = await this.aggregate([
    {
      $match: {
        ...match,
        activityType: { $in: ["menu_viewed", "recipe_accessed", "inventory_updated", "discount_applied"] },
      },
    },
    {
      $group: {
        _id: "$activityType",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const mostUsedModules = moduleUsage.map((m) => m._id);

  return {
    totalActivities,
    activitiesByType,
    averageSessionDuration,
    peakActivityTime,
    mostUsedModules,
  };
};

export default mongoose.model("ActivityLog", activityLogSchema);
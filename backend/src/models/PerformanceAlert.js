import mongoose from "mongoose";

const ALERT_TYPES = [
  "low_performance",
  "high_performance",
  "absenteeism",
  "late_arrival",
  "early_departure",
  "unusual_activity",
];

const SEVERITY_LEVELS = ["low", "medium", "high", "critical"];

const performanceAlertSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
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

    /* ================= ALERT ================= */
    alertType: {
      type: String,
      required: true,
      enum: ALERT_TYPES,
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: SEVERITY_LEVELS,
      default: "medium",
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* ================= RESOLUTION ================= */
    isResolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionNotes: String,

    /* ================= CONTEXT ================= */
    relatedActivityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    relatedShiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShiftAssignment",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ================= INDEXES ================= */
performanceAlertSchema.index({ userId: 1, isResolved: 1, createdAt: -1 });
performanceAlertSchema.index({ alertType: 1, severity: 1, isResolved: 1 });
performanceAlertSchema.index({ createdAt: -1, isResolved: 1 });

/* ================= METHODS ================= */
// Marcar como resuelto
performanceAlertSchema.methods.resolve = async function (resolvedBy, notes) {
  this.isResolved = true;
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  this.resolutionNotes = notes;
  return await this.save();
};

// Crear alerta automáticamente basado en KPIs
performanceAlertSchema.statics.createAlertFromKPIs = async function (userId, kpis) {
  const alerts = [];

  // Alerta de bajo rendimiento
  if (kpis.productivityScore < 50) {
    alerts.push({
      userId,
      userName: kpis.userName,
      alertType: "low_performance",
      severity: kpis.productivityScore < 30 ? "critical" : "high",
      message: `Bajo rendimiento detectado: ${kpis.productivityScore} puntos`,
      data: { productivityScore: kpis.productivityScore },
    });
  }

  // Alerta de alto rendimiento
  if (kpis.productivityScore > 90) {
    alerts.push({
      userId,
      userName: kpis.userName,
      alertType: "high_performance",
      severity: "low",
      message: `Excelente rendimiento: ${kpis.productivityScore} puntos`,
      data: { productivityScore: kpis.productivityScore },
    });
  }

  // Alerta de alta tasa de cancelación
  const cancellationRate = kpis.ordersCancelled / (kpis.ordersCompleted + kpis.ordersCancelled);
  if (cancellationRate > 0.2) {
    alerts.push({
      userId,
      userName: kpis.userName,
      alertType: "unusual_activity",
      severity: "medium",
      message: `Alta tasa de cancelación: ${(cancellationRate * 100).toFixed(1)}%`,
      data: { cancellationRate, ordersCancelled: kpis.ordersCancelled, ordersCompleted: kpis.ordersCompleted },
    });
  }

  // Crear las alertas
  if (alerts.length > 0) {
    return await this.insertMany(alerts);
  }

  return [];
};

export default mongoose.model("PerformanceAlert", performanceAlertSchema);
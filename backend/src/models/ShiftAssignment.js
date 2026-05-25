import mongoose from "mongoose";

const SHIFT_TYPES = ["morning", "afternoon", "night", "event"];
const ASSIGNMENT_STATUS = ["scheduled", "completed", "missed", "late", "left_early"];

const shiftAssignmentSchema = new mongoose.Schema(
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

    /* ================= SHIFT ================= */
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShiftSchedule",
      required: true,
      index: true,
    },
    shiftType: {
      type: String,
      required: true,
      enum: SHIFT_TYPES,
      index: true,
    },

    /* ================= DATE ================= */
    date: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
        message: "Formato de fecha inválido (YYYY-MM-DD)",
      },
      index: true,
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      required: true,
      enum: ASSIGNMENT_STATUS,
      default: "scheduled",
      index: true,
    },

    /* ================= TIMING ================= */
    scheduledStart: {
      type: String,
      required: true,
    },
    scheduledEnd: {
      type: String,
      required: true,
    },
    actualStart: String,
    actualEnd: String,

    /* ================= METRICS ================= */
    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    notes: String,

    /* ================= ATTENDANCE TRACKING ================= */
    checkInTime: Date,
    checkOutTime: Date,
    breaksTaken: [
      {
        startTime: Date,
        endTime: Date,
        duration: Number, // en minutos
      },
    ],
    totalWorkMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ================= INDEXES ================= */
shiftAssignmentSchema.index({ userId: 1, date: -1 });
shiftAssignmentSchema.index({ shiftType: 1, date: -1 });
shiftAssignmentSchema.index({ status: 1, date: -1 });
shiftAssignmentSchema.index({ date: 1, status: 1 });

/* ================= METHODS ================= */
// Registrar check-in
shiftAssignmentSchema.methods.checkIn = async function (timestamp = new Date()) {
  if (this.actualStart) {
    throw new Error("Ya se ha registrado el check-in");
  }

  this.actualStart = timestamp.toISOString().substring(11, 16); // HH:MM
  this.checkInTime = timestamp;
  this.status = "completed";

  // Calcular si llegó tarde
  if (this.actualStart > this.scheduledStart) {
    this.status = "late";
  }

  return await this.save();
};

// Registrar check-out
shiftAssignmentSchema.methods.checkOut = async function (timestamp = new Date()) {
  if (!this.actualStart) {
    throw new Error("No se ha registrado check-in previo");
  }

  if (this.actualEnd) {
    throw new Error("Ya se ha registrado el check-out");
  }

  this.actualEnd = timestamp.toISOString().substring(11, 16); // HH:MM
  this.checkOutTime = timestamp;

  // Calcular si se fue temprano
  if (this.actualEnd < this.scheduledEnd) {
    this.status = "left_early";
  }

  // Calcular tiempo total trabajado
  if (this.checkInTime && this.checkOutTime) {
    const workMinutes = Math.floor((this.checkOutTime - this.checkInTime) / (1000 * 60));
    this.totalWorkMinutes = workMinutes - (this.breaksTaken?.reduce((sum, b) => sum + (b.duration || 0), 0) || 0);
  }

  return await this.save();
};

// Calcular puntaje de rendimiento
shiftAssignmentSchema.methods.calculatePerformanceScore = function (metrics) {
  let score = 100;

  // Penalizar por llegar tarde (-10 puntos)
  if (this.status === "late") score -= 10;

  // Penalizar por irse temprano (-15 puntos)
  if (this.status === "left_early") score -= 15;

  // Penalizar por no completar turno (-30 puntos)
  if (this.status === "missed") score -= 30;

  // Bonus por completar turno (+5 puntos)
  if (this.status === "completed" && this.actualEnd) score += 5;

  // Ajustar basado en métricas de desempeño
  if (metrics) {
    if (metrics.ordersCompleted > 0) score += Math.min(metrics.ordersCompleted * 0.5, 15);
    if (metrics.totalSales > 0) score += Math.min(metrics.totalSales / 1000, 10);
    if (metrics.customerRating) score += Math.min(metrics.customerRating * 5, 10);
  }

  this.performanceScore = Math.max(0, Math.min(100, score));
  return this.performanceScore;
};

export default mongoose.model("ShiftAssignment", shiftAssignmentSchema);
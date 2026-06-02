import mongoose from "mongoose";

/* =========================
   TAGS
========================= */
const tagSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: ["allergy", "diet", "preference", "warning", "other"],
      default: "other",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
  },
  { _id: false }
);

/* =========================
   TABLE SCHEMA (PRO POS CORE)
========================= */
const tableSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFO
    ========================= */
    number: {
      type: Number,
      required: true,
      index: true,
      unique: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    location: {
      type: String,
      enum: ["indoor", "outdoor", "bar"],
      default: "indoor",
      index: true,
    },

    /* =========================
       SPATIAL INFO (FLOOR PLAN)
    ========================= */
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 120 },
    height: { type: Number, default: 120 },
    shape: { 
      type: String, 
      enum: ["rect", "circle", "square"], 
      default: "square" 
    },

    /* =========================
       STATE MACHINE (CORE FIX)
    ========================= */
    status: {
      type: String,
      enum: [
        "available",
        "reserved",
        "occupied",
        "maintenance",
      ],
      default: "available",
      index: true,
    },

    statusChangedAt: {
      type: Date,
      default: Date.now,
    },

    /* =========================
       SESSION CONTROL (CRÍTICO POS)
    ========================= */
    currentSessionId: {
      type: String,
      default: null,
      index: true,
    },

    openedAt: {
      type: Date,
      default: null,
    },

    lastSessionClosedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    /* =========================
       RESERVATIONS
    ========================= */
    currentReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
      index: true,
    },

    reservationStart: Date,
    reservationEnd: Date,

    /* =========================
       MAINTENANCE SYSTEM
    ========================= */
    maintenanceUntil: {
      type: Date,
      default: null,
      index: true,
    },

    /* =========================
       CONTROL FLAGS
    ========================= */
    isLocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    notes: {
      type: String,
      default: "",
    },

    tags: {
      type: [tagSchema],
      default: [],
    },

    /* =========================
       PAYMENT TRACKING
    ========================= */
    totalPayments: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastPaymentAt: {
      type: Date,
      default: null,
    },

    /* =========================
       CHECKOUT LOCK
    ========================= */
    checkoutInProgress: {
      type: Boolean,
      default: false,
      index: true,
    },

    checkoutStartedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =========================
   VIRTUALS
========================= */
tableSchema.virtual("isActive").get(function () {
  return this.status === "occupied";
});

tableSchema.virtual("isAvailable").get(function () {
  return this.status === "available" && !this.isLocked;
});

tableSchema.virtual("isInMaintenance").get(function () {
  return (
    this.status === "maintenance" &&
    this.maintenanceUntil &&
    this.maintenanceUntil > new Date()
  );
});

/* =========================
   METHODS (POS CORE LOGIC)
========================= */

/**
 * Puede recibir órdenes?
 */
tableSchema.methods.canAcceptOrders = function () {
  // En esta arquitectura, mesa ocupada queda bloqueada por diseño.
  // El bloqueo evita apertura/cierre concurrente, no la toma de órdenes.
  return this.status === "occupied" && !!this.currentSessionId;
};

/**
 * Valida sesión activa
 */
tableSchema.methods.isValidSession = function (sessionId) {
  return (
    this.currentSessionId &&
    this.currentSessionId === sessionId
  );
};

/**
 * Libera mesa completamente
 */
tableSchema.methods.release = function () {
  this.status = "available";
  this.currentSessionId = null;
  this.currentReservation = null;
  this.reservationStart = null;
  this.reservationEnd = null;
  this.maintenanceUntil = null;
  this.isLocked = false;
  this.openedAt = null;
  this.closedAt = new Date();
};

/**
 * Inicia sesión POS
 */
tableSchema.methods.startSession = function (sessionId) {
  this.status = "occupied";
  this.currentSessionId = sessionId;
  this.isLocked = true;
  this.openedAt = new Date();
  this.closedAt = null;
};

/**
 * Mantiene mesa en mantenimiento
 */
tableSchema.methods.setMaintenance = function (untilDate) {
  this.status = "maintenance";
  this.maintenanceUntil = untilDate || null;
  this.isLocked = true;
  this.currentSessionId = null;
  this.openedAt = null;
  this.closedAt = new Date();
};

/**
 * Inicia el bloqueo de checkout para prevenir concurrencia
 */
tableSchema.methods.startCheckoutLock = function () {
  this.checkoutInProgress = true;
  this.checkoutStartedAt = new Date();
};

/**
 * Libera el bloqueo de checkout
 */
tableSchema.methods.releaseCheckoutLock = function () {
  this.checkoutInProgress = false;
  this.checkoutStartedAt = null;
};

/**
 * Verifica si hay un checkout en progreso
 */
tableSchema.methods.isCheckoutInProgress = function () {
  return this.checkoutInProgress === true;
};

/* =========================
   AUTO CLEAN STATE
========================= */
tableSchema.methods.shouldBeAvailable = function () {
  return (
    this.status === "maintenance" &&
    this.maintenanceUntil &&
    this.maintenanceUntil <= new Date()
  );
};

/* =========================
   PRE SAVE HOOK
========================= */
tableSchema.pre("save", function () {
  this.statusChangedAt = new Date();

  /* =========================
     AUTO CLEAN MAINTENANCE
  ========================= */
  if (this.shouldBeAvailable()) {
    this.status = "available";
    this.maintenanceUntil = null;
    this.isLocked = false;
  }

  /* =========================
     STATUS RULES
  ========================= */
  if (this.status === "available") {
    this.currentSessionId = null;
    this.currentReservation = null;
    this.reservationStart = null;
    this.reservationEnd = null;
    this.isLocked = false;
  }

  if (this.status === "reserved") {
    this.isLocked = true;
  }

  if (this.status === "occupied") {
    this.isLocked = true;
  }

  if (this.status === "maintenance") {
    this.isLocked = true;
  }
});

/* =========================
   SERIALIZE
========================= */
tableSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Table", tableSchema);

import mongoose from "mongoose";

/* ==============================
   TAG SCHEMA
============================== */
const tagSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["allergy", "diet", "preference", "vip", "other"],
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

/* ==============================
   RESERVATION SCHEMA
============================== */
const reservationSchema = new mongoose.Schema(
  {
    /* =========================
       CUSTOMER INFO
    ========================= */
    customerName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    /* =========================
       TIME RANGE
    ========================= */
    startTime: {
      type: Date,
      required: true,
      index: true,
    },

    endTime: {
      type: Date,
      required: true,
      index: true,
    },

    /* =========================
       PARTY INFO
    ========================= */
    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    /* =========================
       TABLE RELATION
    ========================= */
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
      index: true,
    },

    /* =========================
       FLOW STATUS
    ========================= */
    status: {
      type: String,
      enum: [
        "pending",     // creada
        "confirmed",   // aceptada por admin
        "seated",      // cliente sentado (OCUPA MESA)
        "completed",   // finalizada
        "cancelled",   // cancelada
        "no-show",     // no asistió
      ],
      default: "pending",
      index: true,
    },

    /* =========================
       POS SESSION LINK
    ========================= */
    posSessionId: {
      type: String,
      default: null,
      index: true,
    },

    /* =========================
       EXTRA INFO
    ========================= */
    notes: {
      type: String,
      default: "",
    },

    tags: {
      type: [tagSchema],
      default: [],
    },

    source: {
      type: String,
      enum: ["web", "app", "admin"],
      default: "admin",
    },

    /* =========================
       SYSTEM FLAGS
    ========================= */
    isLocked: {
      type: Boolean,
      default: false,
    },

    seatedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ==============================
   INDEX
============================== */
reservationSchema.index({ tableId: 1, startTime: 1, endTime: 1 });

/* ==============================
   VALIDATION SAFE
============================== */
reservationSchema.pre("save", function () {
  if (this.endTime <= this.startTime) {
    throw new Error("La hora de fin debe ser mayor a inicio");
  }

  if (this.guests < 1) {
    throw new Error("Guests inválidos");
  }
});

/* ==============================
   VIRTUALS
============================== */
reservationSchema.virtual("isActive").get(function () {
  return ["confirmed", "seated"].includes(this.status);
});

reservationSchema.virtual("durationMinutes").get(function () {
  return Math.round(
    (this.endTime - this.startTime) / 60000
  );
});

/* ==============================
   STATIC: CHECK OVERLAP 
============================== */
reservationSchema.statics.isTableAvailable = async function (
  tableId,
  startTime,
  endTime,
  excludeId = null
) {
  return !(await this.findOne({
    tableId,
    _id: { $ne: excludeId },
    status: { $in: ["pending", "confirmed", "seated"] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  }));
};

/* ==============================
   METHODS
============================== */
reservationSchema.methods.markSeated = async function () {
  this.status = "seated";
  this.seatedAt = new Date();
  return this.save();
};

reservationSchema.methods.cancel = async function () {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  return this.save();
};

/* ==============================
   SERIALIZE
============================== */
reservationSchema.set("toJSON", {
  virtuals: true,
});

export default mongoose.model("Reservation", reservationSchema);
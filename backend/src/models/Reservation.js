import mongoose from "mongoose";

/* ==============================
   HELPERS
============================== */

// clave YYYY-MM-DD (ultra importante para performance)
function getDayKey(date) {
  return date.toISOString().split("T")[0];
}

// slot tipo "18:00"
function getTimeSlot(date) {
  return date.toISOString().substring(11, 16);
}

/* ==============================
   TAG SCHEMA
============================== */
const tagSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
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
    customerName: { type: String, required: true, trim: true, index: true },
    customerPhone: { type: String, required: true, trim: true, index: true },

    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },

    //  (clave para performance)
    dayKey: { type: String, index: true },
    timeSlot: { type: String, index: true },

    guests: { type: Number, required: true, min: 1 },

    isVIP: { type: Boolean, default: false, index: true },
    deposit: { type: Number, default: 0 },

    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "seated",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "pending",
      index: true,
    },

    posSessionId: { type: String, default: null, index: true },

    notes: { type: String, default: "" },
    tags: { type: [tagSchema], default: [] },

    source: {
      type: String,
      enum: ["web", "app", "admin"],
      default: "web",
    },

    isLocked: { type: Boolean, default: false },

    seatedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

/* ==============================
   ÍNDICES PRO
============================== */

//  consulta rápida por día + estado
reservationSchema.index({
  dayKey: 1,
  status: 1,
});

//  disponibilidad por mesa
reservationSchema.index({
  tableId: 1,
  startTime: 1,
  endTime: 1,
});

//  slot-based queries (clave para /availability)
reservationSchema.index({
  dayKey: 1,
  timeSlot: 1,
  status: 1,
});

/* ==============================
   VALIDACIÓN
============================== */
reservationSchema.pre("validate", function () {
  if (this.endTime <= this.startTime) {
    throw new Error("La hora de fin debe ser mayor a inicio");
  }

  if (this.guests < 1) {
    throw new Error("Guests inválidos");
  }

  //  autogenerar campos optimizados
  this.dayKey = getDayKey(this.startTime);
  this.timeSlot = getTimeSlot(this.startTime);
});

/* ==============================
   VIRTUALS
============================== */
reservationSchema.virtual("isActive").get(function () {
  return ["pending", "confirmed", "seated"].includes(this.status);
});

reservationSchema.virtual("durationMinutes").get(function () {
  return Math.round((this.endTime - this.startTime) / 60000);
});

/* ==============================
   STATIC: CHECK OVERLAP (MEJORADO)
============================== */
reservationSchema.statics.isTableAvailable = async function (
  tableId,
  startTime,
  endTime,
  excludeId = null
) {
  const conflict = await this.findOne({
    tableId,
    _id: { $ne: excludeId },
    status: { $in: ["pending", "confirmed", "seated"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  }).lean();

  return !conflict;
};

/* ==============================
   STATIC: AVAILABILITY 
============================== */
reservationSchema.statics.getAvailabilityForDay = async function (
  date,
  tables
) {
  const dayKey = date;

  const reservations = await this.find({
    dayKey,
    status: { $in: ["pending", "confirmed", "seated"] },
  }).lean();

  const slots = {};

  for (const r of reservations) {
    slots[r.timeSlot] = (slots[r.timeSlot] || 0) + 1;
  }

  // total mesas disponibles
  const totalTables = tables.length;

  const result = {};

  for (let h = 18; h <= 23; h++) {
    for (const m of ["00", "30"]) {
      const slot = `${h.toString().padStart(2, "0")}:${m}`;
      const used = slots[slot] || 0;

      result[slot] = used < totalTables;
    }
  }

  return result;
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
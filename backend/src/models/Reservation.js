import mongoose from "mongoose";

/* ==============================
   TAGS
============================== */
const tagSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
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
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
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
    },

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
  },
  {
    timestamps: true,
  }
);

/* ==============================
   INDEXES (IMPORTANTE)
============================== */

//  consulta por mesa + tiempo (CRÍTICO)
reservationSchema.index({ tableId: 1, startTime: 1, endTime: 1 });

// dashboard
reservationSchema.index({ status: 1 });

// búsquedas por tiempo (agenda)
reservationSchema.index({ startTime: 1 });

// cliente lookup rápido
reservationSchema.index({ customerPhone: 1 });

/* ==============================
   VIRTUALS
============================== */
reservationSchema.virtual("duration").get(function () {
  if (!this.startTime || !this.endTime) return 0;
  return Math.floor((this.endTime - this.startTime) / 60000);
});

/* ==============================
   VALIDACIÓN BASE
============================== */
reservationSchema.pre("save", function (next) {
  if (this.endTime <= this.startTime) {
    return next(new Error("La hora de fin debe ser mayor a inicio"));
  }
  next();
});

/* ==============================
   EXPORT
============================== */
export default mongoose.model("Reservation", reservationSchema);
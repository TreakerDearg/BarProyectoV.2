import mongoose from "mongoose";

/* ==============================
   TAGS
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

/* ==============================
   TABLE SCHEMA
============================== */
const tableSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true, // ✔ único aquí
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["available", "reserved", "occupied"],
      default: "available",
    },

    location: {
      type: String,
      enum: ["indoor", "outdoor", "bar"],
      default: "indoor",
    },

    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    openedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    currentReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },

    tags: {
      type: [tagSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ==============================
   INDEXES (OPTIMIZADOS)
============================== */

// búsquedas rápidas de estado (dashboard / UI)
tableSchema.index({ status: 1 });

// filtros de ubicación
tableSchema.index({ location: 1 });

// dashboard combinado (MUY IMPORTANTE PARA POS)
tableSchema.index({ status: 1, location: 1 });

// tags (filtros UI tipo "vip table", "smoking", etc.)
tableSchema.index({ "tags.type": 1 });

/* ==============================
   VIRTUALS
============================== */
tableSchema.virtual("activeTime").get(function () {
  if (!this.openedAt) return 0;

  const end = this.closedAt || new Date();
  return Math.floor((end - this.openedAt) / 60000);
});

/* ==============================
   JSON TRANSFORM
============================== */
tableSchema.set("toJSON", {
  virtuals: true,
});

export default mongoose.model("Table", tableSchema);
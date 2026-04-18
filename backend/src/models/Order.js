import mongoose from "mongoose";

/* ==============================
   ORDER ITEM
============================== */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true, // precio al momento de la venta
    },

    //  estado individual (clave para cocina/bar)
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "delivered"],
      default: "pending",
    },

    // tipo (para separar cocina/bar automáticamente)
    type: {
      type: String,
      enum: ["drink", "food"],
      required: true,
    },
  },
  { _id: true }
);

/* ==============================
   MAIN ORDER
============================== */
const orderSchema = new mongoose.Schema(
  {
    /* ========================
       ITEMS
    ======================== */
    items: [orderItemSchema],

    /* ========================
       TOTAL
    ======================== */
    total: {
      type: Number,
      required: true,
      default: 0,
    },

    /* ========================
       ESTADO GLOBAL
    ======================== */
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },

    /* ========================
       MESA / UBICACIÓN
    ======================== */
    table: {
      type: String,
      default: null,
    },

    /* ========================
       USUARIO (FUTURO)
    ======================== */
    createdBy: {
      type: String,
      default: null,
    },

    /* ========================
       NOTAS
    ======================== */
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/* ==============================
   INDEXES
============================== */
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);
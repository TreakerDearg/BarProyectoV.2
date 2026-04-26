import mongoose from "mongoose";

/* =========================================================
   ORDER ITEM SCHEMA
========================================================= */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    /* snapshot para auditoría */
    name: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["drink", "food"],
      required: true,
      index: true,
    },

    /* =========================
       ITEM FLOW STATUS
    ========================= */
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "served", "cancelled"],
      default: "pending",
      index: true,
    },

    /* =========================
       TRACKING TIEMPO
    ========================= */
    startedAt: Date,
    readyAt: Date,

    notes: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

/* =========================================================
   ORDER SCHEMA
========================================================= */
const orderSchema = new mongoose.Schema(
  {
    /* =========================
       ITEMS
    ========================= */
    items: {
      type: [orderItemSchema],
      default: [],
    },

    /* =========================
       FINANCIALS 
    ========================= */
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =========================
       DISCOUNTS RELATION
    ========================= */
    // Compat incremental: acepta formato canónico embebido y legacy (refs/ObjectId)
    discounts: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    /* =========================
       GLOBAL ORDER STATUS
    ========================= */
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    /* =========================
       TABLE RELATION
    ========================= */
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },

    /* =========================
       SESSION (BAR TICKET)
    ========================= */
    sessionId: {
      type: String,
      index: true,
    },

    sessionStatus: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      index: true,
    },

    /* =========================
       PAYMENT FLOW
    ========================= */
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "qr", "mixed", null],
      default: null,
    },

    /* =========================
       STAFF TRACKING
    ========================= */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    servedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* =========================
       NOTES / EXTRA
    ========================= */
    notes: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },

    closedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   AUTO CALCULATION 
========================================================= */
orderSchema.pre("save", function () {
  if (Array.isArray(this.discounts)) {
    this.discounts = this.discounts.map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return entry;
      }
      if (entry instanceof mongoose.Types.ObjectId) {
        return entry;
      }
      return {
        type: entry.type,
        value: Number(entry.value || 0),
        amount: Number(entry.amount || 0),
        reason: entry.reason || "OTHER",
        note: entry.note || "",
        items: Array.isArray(entry.items) ? entry.items.map((id) => String(id)) : [],
        appliedAt: entry.appliedAt || new Date(),
      };
    });
  }

  this.subtotal = this.items.reduce((acc, item) => {
    const price = item.price || 0;
    const qty = item.quantity || 0;
    return acc + price * qty;
  }, 0);

  this.total = Math.max(
    this.subtotal - (this.discountTotal || 0),
    0
  );
});

/* =========================================================
   INDEXES
========================================================= */
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ table: 1, sessionStatus: 1 });

export default mongoose.model("Order", orderSchema);
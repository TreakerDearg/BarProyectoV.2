import mongoose from "mongoose";

const discountItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number, // price * quantity (snapshot)
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const discountSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    items: {
      type: [discountItemSchema],
      validate: [(val) => val.length > 0, "Debe incluir al menos un item"],
    },

    /* =========================
       TIPO DE DESCUENTO
    ========================= */
    type: {
      type: String,
      enum: ["PERCENT", "FLAT"],
      required: true,
      index: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    amountApplied: {
      type: Number,
      required: true,
      min: 0,
    },

    /* =========================
       ESTADO (PRO FLOW)
    ========================= */
    status: {
      type: String,
      enum: ["APPLIED", "PENDING", "REJECTED"],
      default: "APPLIED",
      index: true,
    },

    /* =========================
       RAZÓN
    ========================= */
    reason: {
      type: String,
      enum: [
        "WAIT_TIME",
        "QUALITY_ISSUE",
        "COMP",
        "EMPLOYEE",
        "OTHER",
      ],
      required: true,
      index: true,
    },

    note: {
      type: String,
      maxlength: 500,
    },

    /* =========================
       AUDITORÍA
    ========================= */
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: Date,
    rejectedAt: Date,

    /* =========================
       SNAPSHOT FINANCIERO
    ========================= */
    orderTotalBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    orderTotalAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    /* =========================
       METADATA
    ========================= */
    meta: {
      device: String,
      ip: String,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt automático
  }
);

/* =========================================================
   INDEXES (performance real)
========================================================= */
discountSchema.index({ createdAt: -1 });
discountSchema.index({ order: 1, createdAt: -1 });
discountSchema.index({ appliedBy: 1, createdAt: -1 });

/* =========================================================
   VIRTUALS
========================================================= */
discountSchema.virtual("isHighDiscount").get(function () {
  if (this.type === "PERCENT") {
    return this.value >= 20;
  }
  return this.amountApplied >= 50; // configurable
});

/* =========================================================
   PRE SAVE (consistencia)
========================================================= */
discountSchema.pre("validate", function (next) {
  // asegurar subtotal por item
  if (this.items?.length) {
    this.items = this.items.map((item) => ({
      ...item,
      subtotal: item.price * item.quantity,
    }));
  }
  next();
});

export default mongoose.model("Discount", discountSchema);
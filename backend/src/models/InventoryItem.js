import mongoose from "mongoose";

/* =========================
   MOVEMENT
========================= */
const inventoryMovementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["in", "out", "adjustment", "waste", "transfer"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      default: "",
    },

    costAtMoment: {
      type: Number,
      default: 0,
    },

    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* =========================
   INVENTORY
========================= */
const inventorySchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFO
    ========================= */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
      index: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: 200,
    },

    /* =========================
       STOCK CONTROL (FIXED SAFETY)
    ========================= */
    stock: {
      type: Number,
      default: 0,
      min: 0,
      set: (v) => Math.max(0, v), //  evita negativos
    },

    minStock: {
      type: Number,
      default: 5,
      min: 0,
    },

    maxStock: {
      type: Number,
      default: 100,
      min: 0,
    },

    /* =========================
       UNIT SYSTEM
    ========================= */
    unit: {
      type: String,
      enum: ["ml", "l", "g", "kg", "unit", "oz", "portion"],
      default: "unit",
    },

    /* =========================
       CLASSIFICATION
    ========================= */
    sector: {
      type: String,
      enum: ["bar", "kitchen", "general"],
      default: "general",
      index: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    location: {
      type: String,
      enum: ["bar", "kitchen", "storage"],
      default: "storage",
      index: true,
    },

    /* =========================
       COST CONTROL (IMPROVED)
    ========================= */
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    supplier: {
      type: String,
      default: "",
    },

    costHistory: [
      {
        cost: { type: Number, min: 0 },
        date: { type: Date, default: Date.now },
        supplier: String,
      },
    ],

    /* =========================
       STATUS
    ========================= */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /* =========================
       MOVEMENTS LOG (ENHANCED)
    ========================= */
    movements: {
      type: [inventoryMovementSchema],
      default: [],
      select: false, //  evita sobrecargar queries normales
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =========================
   INDEXES (OPTIMIZED)
========================= */
inventorySchema.index({ name: "text", category: "text" });
inventorySchema.index({ sector: 1, location: 1 });
inventorySchema.index({ stock: 1 });

/* =========================
   VIRTUAL STATUS
========================= */
inventorySchema.virtual("stockStatus").get(function () {
  if (this.stock <= 0) return "empty";
  if (this.stock <= this.minStock) return "critical";
  if (this.stock <= this.minStock * 2) return "low";
  return "optimal";
});

/* =========================
   SAFE HOOKS
========================= */
inventorySchema.pre("save", function () {
  if (this.stock < 0) this.stock = 0;

  if (this.maxStock < this.minStock) {
    this.maxStock = this.minStock;
  }
});

/* =========================
   SAFE SERIALIZATION
========================= */
inventorySchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("InventoryItem", inventorySchema);
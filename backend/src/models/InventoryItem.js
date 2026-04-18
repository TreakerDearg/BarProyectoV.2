import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    /* BASIC INFO */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    description: {
      type: String,
      default: "",
      maxlength: 200,
      trim: true,
    },

    /* STOCK */
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    minStock: {
      type: Number,
      default: 5,
      min: 0,
    },

    maxStock: {
      type: Number,
      default: 100,
      min: 1,
    },

    /* UNIT */
    unit: {
      type: String,
      enum: ["ml", "l", "g", "kg", "unit", "oz", "portion"],
      default: "unit",
    },

    /* CLASSIFICATION */
    sector: {
      type: String,
      enum: ["bar", "kitchen", "general"],
      default: "general",
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    /* COST (FIX IMPORTANTE) */
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    supplier: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      enum: ["bar", "kitchen", "storage"],
      default: "storage",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* INDEXES */
inventorySchema.index({ name: "text" });
inventorySchema.index({ category: 1, sector: 1 });
inventorySchema.index({ stock: 1, minStock: 1 });

/* VIRTUALS */
inventorySchema.virtual("stockStatus").get(function () {
  if (this.stock <= this.minStock) return "critical";
  if (this.stock <= this.minStock * 2) return "low";
  return "optimal";
});

inventorySchema.set("toJSON", { virtuals: true });

export default mongoose.model("InventoryItem", inventorySchema);
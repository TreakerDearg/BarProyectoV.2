import mongoose from "mongoose";

/* ==============================
   PRODUCT SCHEMA
============================== */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      maxlength: 300,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    category: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["drink", "food"],
      required: true,
    },

    subcategory: {
      type: String,
      default: "",
    },

    hasRecipe: {
      type: Boolean,
      default: false,
    },

    preparationTime: {
      type: Number,
      default: 0,
    },

    available: {
      type: Boolean,
      default: true,
    },

    autoAvailable: {
      type: Boolean,
      default: true,
    },

    image: {
      type: String,
      default: "",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    tags: {
      type: [String],
      default: [],
    },

    menuIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ==============================
   INDEXES (OPTIMIZADOS POS)
============================== */

//  búsqueda rápida por texto
productSchema.index({ name: "text", description: "text" });

//  filtros principales del sistema
productSchema.index({ type: 1, category: 1 });

//  disponibilidad + UI menu
productSchema.index({ available: 1, featured: -1 });

//  filtro por categoría
productSchema.index({ category: 1 });

//  filtro por tags (mejorado)
productSchema.index({ tags: 1 });

/* ==============================
   VIRTUALS
============================== */

// margen absoluto
productSchema.virtual("profit").get(function () {
  return this.price - this.cost;
});

// margen %
productSchema.virtual("margin").get(function () {
  if (!this.cost) return 0;
  return Math.round(((this.price - this.cost) / this.price) * 100);
});

/* ==============================
   JSON TRANSFORM
============================== */
productSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Product", productSchema);
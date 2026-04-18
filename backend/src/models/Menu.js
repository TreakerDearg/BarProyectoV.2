import mongoose from "mongoose";

/* ==============================
   PRODUCTO DENTRO DEL MENÚ
============================== */
const menuProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    //  override opcional (precio especial en menú)
    price: {
      type: Number,
      default: null,
    },

    //  disponibilidad manual
    available: {
      type: Boolean,
      default: true,
    },

    // orden visual
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/* ==============================
   CATEGORÍA DEL MENÚ
============================== */
const menuCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    products: [menuProductSchema],

    //  orden de categorías
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/* ==============================
   MAIN MENU
============================== */
const menuSchema = new mongoose.Schema(
  {
    /* ========================
       INFO GENERAL
    ======================== */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    /* ========================
       TIPO (CLAVE)
    ======================== */
    type: {
      type: String,
      enum: ["drink", "food", "mixed"],
      default: "mixed",
    },

    /* ========================
       CATEGORÍAS
    ======================== */
    categories: [menuCategorySchema],

    /* ========================
       ESTADO
    ======================== */
    active: {
      type: Boolean,
      default: true,
    },

    /* ========================
       VISIBILIDAD
    ======================== */
    isPublic: {
      type: Boolean,
      default: true, // para clientes
    },
  },
  {
    timestamps: true,
  }
);

/* ==============================
   INDEXES
============================== */
menuSchema.index({ active: 1 });
menuSchema.index({ type: 1 });

export default mongoose.model("Menu", menuSchema);
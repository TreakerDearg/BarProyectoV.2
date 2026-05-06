import mongoose from "mongoose";

/* ==============================
   PRODUCTO EN MENÚ (PRO)
============================== */
const menuProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    /* ===== DISPLAY ===== */
    price: {
      type: Number,
      default: null, // override
    },

    available: {
      type: Boolean,
      default: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/* ==============================
   CATEGORY (PRO)
============================== */
const menuCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    products: {
      type: [menuProductSchema],
      default: [],
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/* ==============================
   MAIN MENU (PRO)
============================== */
const menuSchema = new mongoose.Schema(
  {
    /* ========================
       BASIC
    ======================== */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "#f59e0b", // amber
    },

    /* ========================
       TYPE
    ======================== */
    type: {
      type: String,
      enum: ["drink", "food", "mixed"],
      default: "mixed",
      index: true,
    },

    /* ========================
       STRUCTURE
    ======================== */
    categories: {
      type: [menuCategorySchema],
      default: [],
    },

    /* ========================
       STATUS
    ======================== */
    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    /* ========================
       FUTURE (READY)
    ======================== */
    schedule: {
      type: Object,
      default: null, // horario futuro
    },
  },
  {
    timestamps: true,
  }
);

/* ==============================
   INDEXES
============================== */
menuSchema.index({ active: 1, type: 1 });

/* ==============================
   HELPERS
============================== */
const generateSlug = (name) =>
  name
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

/* ==============================
   NORMALIZATION HOOK 
============================== */
menuSchema.pre("save", function () {
  // slug automático
  if (!this.slug) {
    this.slug = generateSlug(this.name);
  }

  // ordenar categorías
  this.categories?.forEach((cat, i) => {
    cat.order = i;

    // evitar duplicados de productos
    const unique = new Map();

    cat.products = cat.products
      .filter((p) => p.product)
      .map((p, index) => {
        const id = p.product.toString();

        if (unique.has(id)) return null;

        unique.set(id, true);

        return {
          ...p,
          order: index,
        };
      })
      .filter(Boolean);
  });

  // eliminar categorías vacías
  this.categories = this.categories.filter(
    (c) => c.products.length > 0
  );
});

/* ==============================
   UPDATE HOOK (IMPORTANTE)
============================== */
menuSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();

  if (!update) return;

  if (update.name && !update.slug) {
    update.slug = generateSlug(update.name);
  }
});

/* ==============================
   TO JSON
============================== */
menuSchema.set("toJSON", {
  virtuals: true,
});

export default mongoose.model("Menu", menuSchema);
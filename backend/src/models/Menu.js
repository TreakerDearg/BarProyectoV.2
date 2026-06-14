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

    imagePublicId: {
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

    imagePublicId: {
      type: String,
      default: "",
      index: true,
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

    drinkStyle: {
      type: String,
      enum: ["author", "classic", "mixed"],
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
       CONFIG
    ======================== */
    allowEmptyCategories: {
      type: Boolean,
      default: false,
    },

    /* ========================
       FUTURE (READY)
    ======================== */
    schedule: {
      type: Object,
      default: null, // horario futuro
    },

    /* ========================
       SEO & METADATA
    ======================== */
    metaTitle: {
      type: String,
      default: "",
    },

    metaDescription: {
      type: String,
      default: "",
    },

    keywords: {
      type: [String],
      default: [],
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    /* ========================
       DIETARY RESTRICTIONS
    ======================== */
    dietaryRestrictions: {
      type: [{
        type: String,
        enum: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "sugar-free"]
      }],
      default: [],
      index: true,
    },

    /* ========================
       AVAILABILITY
    ======================== */
    availableHours: {
      type: Object,
      default: null, // { start: "09:00", end: "23:00" }
    },

    availableDays: {
      type: [String],
      default: [], // ["monday", "tuesday", ...]
    },

    /* ========================
       PRICING (CALCULATED)
    ======================== */
    minPrice: {
      type: Number,
      default: 0,
    },

    maxPrice: {
      type: Number,
      default: 0,
    },

    /* ========================
       FEATURED
    ======================== */
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* ========================
       GALLERY
    ======================== */
    gallery: {
      type: [{
        url: String,
        publicId: String,
        order: { type: Number, default: 0 },
      }],
      default: [],
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
menuSchema.index({ isPublic: 1, active: 1 });
menuSchema.index({ featured: 1, active: 1 });
menuSchema.index({ tags: 1 });
menuSchema.index({ slug: 1 });

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
menuSchema.pre("save", async function () {
  // slug automático
  if (!this.slug) {
    this.slug = generateSlug(this.name);
  }

  // metaTitle por defecto
  if (!this.metaTitle && this.name) {
    this.metaTitle = this.name;
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

  // eliminar categorías vacías (solo si allowEmptyCategories es false)
  if (!this.allowEmptyCategories) {
    this.categories = this.categories.filter(
      (c) => c.products.length > 0
    );
  }

  // Calcular precios min/max
  if (this.categories && this.categories.length > 0) {
    const allPrices = this.categories.flatMap(cat =>
      cat.products
        .filter(p => p.price !== null && p.price !== undefined)
        .map(p => p.price)
    );

    if (allPrices.length > 0) {
      this.minPrice = Math.min(...allPrices);
      this.maxPrice = Math.max(...allPrices);
    } else {
      this.minPrice = 0;
      this.maxPrice = 0;
    }
  }

  // Calcular drinkStyle basado en productos (solo para menus de bebidas o mixtos)
  if (this.type === "drink" || this.type === "mixed") {
    const Product = mongoose.model("Product");
    const productIds = this.categories?.flatMap(cat => 
      cat.products.map(p => p.product)
    ) || [];

    if (productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds }, type: "drink" });
      const authorCount = products.filter(p => p.drinkStyle === "author").length;
      const classicCount = products.filter(p => p.drinkStyle === "classic").length;

      if (authorCount > 0 && classicCount > 0) {
        this.drinkStyle = "mixed";
      } else if (authorCount > 0) {
        this.drinkStyle = "author";
      } else if (classicCount > 0) {
        this.drinkStyle = "classic";
      } else {
        this.drinkStyle = "mixed";
      }
    } else {
      this.drinkStyle = "mixed";
    }
  } else {
    this.drinkStyle = undefined;
  }
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
import mongoose from "mongoose";

/* ==============================
   PRODUCT SCHEMA (POS CORE)
============================== */

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      lowercase: true, //  evita duplicados tipo "Mojito" vs "mojito"
      minlength: 2,
      maxlength: 100,
      index: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: 300,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, //  importante para filtros
      index: true,
    },

    type: {
      type: String,
      enum: ["drink", "food"],
      required: true,
      index: true,
    },

    subcategory: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      index: true,
    },

    /* ==============================
       POS LOGIC FLAGS
    ============================== */
    hasRecipe: {
      type: Boolean,
      default: false,
    },

    preparationTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    available: {
      type: Boolean,
      default: true,
      index: true,
    },

    autoAvailable: {
      type: Boolean,
      default: true,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* ==============================
       MEDIA
    ============================== */
    image: {
      type: String,
      default: "",
    },

    /* ==============================
       TAG SYSTEM (POS FILTERS)
    ============================== */
    tags: {
      type: [String],
      default: [],
      index: true,
    },

    /* ==============================
       MENU RELATION
    ============================== */
    menuIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],

    /* ==============================
       INVENTORY CONTROL 
    ============================== */
    stockImpact: {
      type: Boolean,
      default: true,
    },

    isAlcohol: {
      type: Boolean,
      default: false,
    },

    isActiveForPOS: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ==============================
   INDEXES (POS OPTIMIZED)
============================== */

//  búsqueda avanzada
productSchema.index({ name: "text", description: "text" });

//  filtro rápido para ruleta
productSchema.index({ type: 1, available: 1, isActiveForPOS: 1 });

//  catálogo
productSchema.index({ available: 1, featured: -1 });

/* ==============================
   MIDDLEWARE (SIN NEXT)
============================== */

//  normalización automática antes de guardar
productSchema.pre("save", function () {
  if (this.name) this.name = this.name.trim().toLowerCase();

  if (this.category)
    this.category = this.category.trim().toLowerCase();

  if (this.subcategory)
    this.subcategory = this.subcategory.trim().toLowerCase();


  if (this.type === "drink") {
    this.stockImpact = true;
  }
});

/* ==============================
   RULETA INTELLIGENT FILTER
============================== */
productSchema.query.forRoulette = function () {
  return this.where({
    type: "drink",
    available: true,
    isActiveForPOS: true,
    stockImpact: true,
  });
};

/* ==============================
   SMART HELPERS 
============================== */
productSchema.statics.findActiveByType = function (type) {
  return this.find({
    type,
    available: true,
    isActiveForPOS: true,
  });
};

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
   CLEAN JSON OUTPUT
============================== */

productSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Product", productSchema);
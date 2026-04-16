import mongoose from "mongoose";

/* ================================
   INGREDIENT SUB-SCHEMA
================================ */
const ingredientSchema = new mongoose.Schema(
  {
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    // NUEVO: orden de armado (bartender flow)
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/* ================================
   RECIPE SCHEMA (COCKTAIL ENGINE)
================================ */
const recipeSchema = new mongoose.Schema(
  {
    /* ========================
       RELATION PRODUCT
    ======================== */
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    /* ========================
       INGREDIENTS STRUCTURED
    ======================== */
    ingredients: [ingredientSchema],

    /* ========================
       METHOD (CORE BARTENDER FIELD)
    ======================== */
    method: {
      type: String,
      default: "",
    },

    /* ========================
       COCKTAIL VISUAL
    ======================== */
    image: {
      type: String,
      default: "",
    },

    /* ========================
       PROTOCOL STEPS (FUTURE UI FLOW)
    ======================== */
    steps: {
      type: [String],
      default: [],
    },

    /* ========================
       CATEGORY (DRINK TYPE ENGINE)
    ======================== */
    category: {
      type: String,
      enum: [
        "shot",
        "cocktail",
        "mocktail",
        "frozen",
        "highball",
        "martini",
        "sour",
      ],
      default: "cocktail",
    },
  },
  { timestamps: true }
);

/* ================================
   INDEX (PERFORMANCE BOOST)
================================ */
recipeSchema.index({ productId: 1 });

export default mongoose.model("Recipe", recipeSchema);
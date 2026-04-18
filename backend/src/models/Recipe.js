import mongoose from "mongoose";

/* ==============================
   INGREDIENTS
============================== */
const recipeIngredientSchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      enum: ["ml", "l", "g", "kg", "unit", "oz", "portion"],
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/* ==============================
   STEPS
============================== */
const stepSchema = new mongoose.Schema(
  {
    stepNumber: Number,
    instruction: String,
  },
  { _id: false }
);

/* ==============================
   RECIPE SCHEMA
============================== */
const recipeSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    ingredients: [recipeIngredientSchema],

    type: {
      type: String,
      enum: ["drink", "food"],
      required: true,
    },

    method: {
      type: String,
      trim: true,
    },

    steps: {
      type: [stepSchema],
      default: [],
    },

    category: {
      type: String,
      default: "general",
    },

    image: {
      type: String,
      default: "",
    },

    totalCost: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ==============================
   INDEXES (CLEAN)
============================== */


recipeSchema.index({ product: 1 }, { unique: true });

recipeSchema.index({ type: 1 });
recipeSchema.index({ category: 1 });

/* ==============================
   OPTIMIZED COST CALCULATION
============================== */
recipeSchema.pre("save", async function (next) {
  try {
    const InventoryItem = mongoose.model("InventoryItem");

    const ids = this.ingredients.map(i => i.inventoryItem);

    const items = await InventoryItem.find({
      _id: { $in: ids },
    }).lean();

    const itemMap = new Map(
      items.map(i => [i._id.toString(), i])
    );

    let total = 0;

    for (const ing of this.ingredients) {
      const item = itemMap.get(ing.inventoryItem.toString());

      if (item) {
        total += item.cost * ing.quantity;
      }
    }

    this.totalCost = total;

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Recipe", recipeSchema);
import mongoose from "mongoose";

const recipeIngredientSchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    unit: {
      type: String,
      enum: ["ml", "l", "g", "kg", "unit", "oz", "portion"],
      required: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    //  factor de conversión más claro
    baseUnitMultiplier: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const stepSchema = new mongoose.Schema(
  {
    stepNumber: { type: Number, required: true },
    instruction: { type: String, required: true },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["drink", "food"],
      required: true,
      index: true,
    },

    ingredients: {
      type: [recipeIngredientSchema],
      default: [],
    },

    method: { type: String, default: "" },
    steps: { type: [stepSchema], default: [] },

    category: { type: String, default: "general", index: true },
    image: { type: String, default: "" },

    specifications: {
      glass: { type: String, default: "STANDARD_GLASS" },
      ice: { type: String, default: "STANDARD_ICE" }
    },

    totalCost: { type: Number, default: 0 },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

/* ==============================
   INDEXES
============================== */
recipeSchema.index({ type: 1, category: 1 });

/* ==============================
   COST CALCULATION (FIXED)
============================== */
async function calculateCost(doc) {
  const InventoryItem = mongoose.model("InventoryItem");

  if (!doc.ingredients?.length) {
    doc.totalCost = 0;
    return;
  }

  const ids = doc.ingredients.map(i => i.inventoryItem);

  const items = await InventoryItem.find({ _id: { $in: ids } })
    .select("cost unit")
    .lean();

  const map = new Map(
    items.map(i => [i._id.toString(), i])
  );

  let total = 0;

  for (const ing of doc.ingredients) {
    const item = map.get(ing.inventoryItem.toString());

    if (!item) continue;

    const costPerUnit = item.cost || 0;

    //  NORMALIZACIÓN SEGURA
    const normalizedQty =
      ing.quantity * (ing.baseUnitMultiplier || 1);

    total += costPerUnit * normalizedQty;
  }

  doc.totalCost = Number(total.toFixed(2));
}

/* ==============================
   PRE SAVE
============================== */
recipeSchema.pre("save", async function () {
  await calculateCost(this);
});

/* ==============================
   FIX: UPDATE HOOK (ROBUSTO)
============================== */
recipeSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();

  if (!update) return;

  const doc = await this.model.findOne(this.getQuery());
  if (!doc) return;

  // merge seguro
  if (update.ingredients) {
    doc.ingredients = update.ingredients;
  }

  if (update.type) doc.type = update.type;
  if (update.product) doc.product = update.product;

  await calculateCost(doc);

  update.totalCost = doc.totalCost;
});

/* ==============================
   SERIALIZE
============================== */
recipeSchema.set("toJSON", {
  virtuals: true,
});

export default mongoose.model("Recipe", recipeSchema);
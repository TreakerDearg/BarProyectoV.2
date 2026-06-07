import mongoose from "mongoose";

/* ==============================
   UNIT SYSTEM (NORMALIZACIÓN REAL)
============================== */
const UNIT_CONVERSION = {
  ml: 1,
  l: 1000,
  g: 1,
  kg: 1000,
  oz: 29.5735,
  unit: 1,
  portion: 1,
};

/* ==============================
   INGREDIENT SCHEMA
============================== */
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
      min: 0.0001,
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

    baseUnitMultiplier: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

/* ==============================
   STEP SCHEMA
============================== */
const stepSchema = new mongoose.Schema(
  {
    stepNumber: { type: Number, required: true },
    instruction: { type: String, required: true },
  },
  { _id: false }
);

/* ==============================
   MAIN SCHEMA
============================== */
const recipeSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    isPrimary: {
      type: Boolean,
      default: true,
      index: true,
    },

    variantName: {
      type: String,
      default: "",
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },

    type: {
      type: String,
      enum: ["drink", "food"],
      required: true,
      index: true,
    },

    drinkStyle: {
      type: String,
      enum: ["author", "classic"],
      default: "classic",
      index: true,
    },

    ingredients: {
      type: [recipeIngredientSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "La receta debe tener al menos un ingrediente",
      },
    },

    method: { type: String, default: "" },

    steps: {
      type: [stepSchema],
      default: [],
    },

    category: {
      type: String,
      default: "general",
      index: true,
    },

    image: { type: String, default: "" },

    specifications: {
      glass: { type: String, default: "STANDARD_GLASS" },
      ice: { type: String, default: "STANDARD_ICE" },
    },

    totalCost: {
      type: Number,
      default: 0,
      index: true,
    },

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
   COST CALCULATION (PRO)
============================== */
async function calculateCost(doc) {
  const InventoryItem = mongoose.model("InventoryItem");

  if (!doc.ingredients?.length) {
    doc.totalCost = 0;
    return;
  }

  const ids = doc.ingredients.map((i) => i.inventoryItem);

  const items = await InventoryItem.find({
    _id: { $in: ids },
  })
    .select("cost unit")
    .lean();

  const map = new Map(
    items.map((i) => [i._id.toString(), i])
  );

  let total = 0;

  for (const ing of doc.ingredients) {
    const item = map.get(ing.inventoryItem.toString());
    if (!item) continue;

    /* =========================
       NORMALIZACIÓN DE UNIDADES
    ========================= */
    const recipeUnit = UNIT_CONVERSION[ing.unit] || 1;
    const inventoryUnit = UNIT_CONVERSION[item.unit] || 1;

    const normalizedQty =
      ing.quantity *
      recipeUnit *
      (ing.baseUnitMultiplier || 1);

    const costPerBaseUnit =
      (item.cost || 0) / inventoryUnit;

    total += costPerBaseUnit * normalizedQty;
  }

  doc.totalCost = Number(total.toFixed(2));
}

/* ==============================
   PRE SAVE
============================== */
recipeSchema.pre("save", async function () {
  await calculateCost(this);

  // Sync drinkStyle with product for drinks
  if (this.type === "drink") {
    const Product = mongoose.model("Product");
    const product = await Product.findById(this.product);
    if (product && product.drinkStyle) {
      this.drinkStyle = product.drinkStyle;
    } else if (!this.drinkStyle) {
      this.drinkStyle = "classic";
    }
  } else {
    this.drinkStyle = undefined;
  }
});

/* ==============================
   UPDATE HOOK (ROBUSTO)
============================== */
recipeSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  if (!update) return;

  const data = update.$set || update;

  const doc = await this.model.findOne(this.getQuery());
  if (!doc) return;

  if (data.ingredients) doc.ingredients = data.ingredients;
  if (data.type) doc.type = data.type;
  if (data.product) doc.product = data.product;

  await calculateCost(doc);

  if (update.$set) {
    update.$set.totalCost = doc.totalCost;
  } else {
    update.totalCost = doc.totalCost;
  }
});

/* ==============================
   POST SYNC WITH PRODUCT
============================== */
recipeSchema.post("save", async function (doc) {
  const Product = mongoose.model("Product");
  await Product.findByIdAndUpdate(doc.product, {
    hasRecipe: true,
    cost: doc.totalCost
  });
});

recipeSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    const Product = mongoose.model("Product");
    await Product.findByIdAndUpdate(doc.product, {
      hasRecipe: true,
      cost: doc.totalCost
    });
  }
});

/* ==============================
   POPULATE AUTO (PRO)
============================== */
recipeSchema.pre(/^find/, function () {
  this.populate("product", "name price")
      .populate("ingredients.inventoryItem", "name cost unit");
});

/* ==============================
   VIRTUALS
============================== */
recipeSchema.virtual("margin").get(function () {
  if (!this.totalCost || !this.product?.price) return 0;

  return Number(
    (
      ((this.product.price - this.totalCost) /
        this.product.price) *
      100
    ).toFixed(2)
  );
});

/* ==============================
   SERIALIZE
============================== */
recipeSchema.set("toJSON", {
  virtuals: true,
});

export default mongoose.model("Recipe", recipeSchema);
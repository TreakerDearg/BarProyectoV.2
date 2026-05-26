import mongoose from "mongoose";

const HEX_COLOR_REGEX = /^#([0-9A-F]{3}){1,2}$/i;

const rouletteDrinkSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      enum: ["clasico", "autor", "sin alcohol", "shot", "premium", "general"],
      default: "general",
    },

    weight: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },

    rarity: {
      type: String,
      enum: ["COMMON", "RARE", "EPIC", "LEGENDARY"],
      default: "COMMON",
    },

    pityThreshold: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    color: {
      type: String,
      default: "#ffffff",
      validate: {
        validator: (v) => HEX_COLOR_REGEX.test(v),
        message: "Color inválido (usar HEX, ej: #FFAA00)",
      },
    },

    price: {
      type: Number,
      min: 0,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    totalSpins: {
      type: Number,
      default: 0,
    },

    lastSelectedAt: {
      type: Date,
    },

    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Pity system tracking
    pityCounter: {
      type: Number,
      default: 0,
    },

    // Estadísticas adicionales
    totalWins: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

rouletteDrinkSchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  }
);

rouletteDrinkSchema.index({ active: 1, deleted: 1, weight: 1 });
rouletteDrinkSchema.index(
  { product: 1 },
  { unique: true, partialFilterExpression: { product: { $type: "objectId" } } }
);

rouletteDrinkSchema.pre(/^find/, function () {
  this.where({ deleted: false });
});

rouletteDrinkSchema.methods.getProbability = function (totalWeight) {
  if (!totalWeight) return 0;
  return (this.weight / totalWeight) * 100;
};

export default mongoose.model("RouletteDrink", rouletteDrinkSchema);

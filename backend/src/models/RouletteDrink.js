import mongoose from "mongoose";

const HEX_COLOR_REGEX = /^#([0-9A-F]{3}){1,2}$/i;

const rouletteDrinkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    //  Mejor control de categorías
    category: {
      type: String,
      enum: ["clasico", "autor", "sin alcohol", "shot", "premium", "general"],
      default: "general",
    },

    weight: {
      type: Number,
      required: true,
      min: 1,
      max: 1000, //  evita romper probabilidades
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    //  Para UI consistente
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

    //  Orden visual en ruleta
    displayOrder: {
      type: Number,
      default: 0,
    },

    //  Stats avanzadas
    totalSpins: {
      type: Number,
      default: 0,
    },

    lastSelectedAt: {
      type: Date,
    },

    //  Soft delete real
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ==============================
   ÍNDICES PRO
============================== */

// Evita duplicados (case insensitive)
rouletteDrinkSchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  }
);

// Para queries de ruleta
rouletteDrinkSchema.index({ active: 1, deleted: 1, weight: 1 });

/* ==============================
   MIDDLEWARES
============================== */

// Evitar devolver eliminados por defecto
rouletteDrinkSchema.pre(/^find/, function () {
  this.where({ deleted: false });
});

/* ==============================
   MÉTODOS
============================== */

// Probabilidad calculada (helper)
rouletteDrinkSchema.methods.getProbability = function (totalWeight) {
  if (!totalWeight) return 0;
  return (this.weight / totalWeight) * 100;
};

export default mongoose.model("RouletteDrink", rouletteDrinkSchema);
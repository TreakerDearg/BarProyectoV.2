import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del ingrediente es obligatorio"],
      trim: true,
      unique: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [50, "El nombre no puede superar los 50 caracteres"],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "El stock no puede ser negativo"],
    },
    unit: {
      type: String,
      required: true,
      enum: ["ml", "g", "unit", "oz"],
      default: "ml",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Alcohol Base",
        "Mixers",
        "Frutas",
        "Endulzantes",
        "Garnish",
        "Otros",
      ],
      default: "Otros",
    },
    minStock: {
      type: Number,
      default: 5,
      min: 0,
    },
    maxStock: {
      type: Number,
      default: 100,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ==============================
   INDEXES
============================== */
ingredientSchema.index({ name: 1 });
ingredientSchema.index({ category: 1 });

/* ==============================
   VIRTUALS
============================== */
ingredientSchema.virtual("stockStatus").get(function () {
  if (this.stock <= this.minStock) return "critical";
  if (this.stock <= this.minStock * 2) return "low";
  return "optimal";
});

/* ==============================
   TRANSFORMACIONES JSON
============================== */
ingredientSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

ingredientSchema.set("toObject", {
  virtuals: true,
});

/* ==============================
   EXPORT MODEL
============================== */
export default mongoose.model("Ingredient", ingredientSchema);
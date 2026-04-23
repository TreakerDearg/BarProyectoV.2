import mongoose from "mongoose";

const rouletteLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["create", "update", "delete", "toggle", "system"],
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    // opcional: referencia al trago
    drinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RouletteDrink",
    },

    meta: {
      type: Object, // datos extra (peso anterior, nuevo, etc)
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// índice para ordenar rápido
rouletteLogSchema.index({ createdAt: -1 });

export default mongoose.model("RouletteLog", rouletteLogSchema);
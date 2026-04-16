import mongoose from "mongoose";

const rouletteSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  weight: {
    type: Number,
    default: 1,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("Roulette", rouletteSchema);
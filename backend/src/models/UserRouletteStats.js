import mongoose from "mongoose";

const userRouletteStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      unique: true,
    },

    totalSpins: {
      type: Number,
      default: 0,
    },

    // Contador de spins desde el último premio de cada rareza
    spinsSinceCommon: {
      type: Number,
      default: 0,
    },
    spinsSinceRare: {
      type: Number,
      default: 0,
    },
    spinsSinceEpic: {
      type: Number,
      default: 0,
    },
    spinsSinceLegendary: {
      type: Number,
      default: 0,
    },

    // Historial de premios ganados
    prizesWon: {
      common: { type: Number, default: 0 },
      rare: { type: Number, default: 0 },
      epic: { type: Number, default: 0 },
      legendary: { type: Number, default: 0 },
    },

    // Última vez que ganó cada rareza
    lastCommonAt: Date,
    lastRareAt: Date,
    lastEpicAt: Date,
    lastLegendaryAt: Date,

    // Pity system activo
    pityActive: {
      type: Boolean,
      default: false,
    },

    pityTargetRarity: {
      type: String,
      enum: ["RARE", "EPIC", "LEGENDARY"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userRouletteStatsSchema.index({ user: 1, totalSpins: -1 });
userRouletteStatsSchema.index({ pityActive: 1 });

export default mongoose.model("UserRouletteStats", userRouletteStatsSchema);

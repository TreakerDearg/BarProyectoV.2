import mongoose from "mongoose";

const rouletteLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["create", "update", "delete", "toggle", "spin", "system"],
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

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Usuario explícito para analytics
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Session ID para tracking de sesiones
    sessionId: {
      type: String,
      default: null,
      index: true,
    },

    // Device info para analytics
    deviceInfo: {
      userAgent: String,
      platform: String,
      ip: String,
    },

    // Result details para más contexto
    resultDetails: {
      rarity: String,
      weight: Number,
      probability: Number,
      category: String,
      pityTriggered: Boolean,
      pityTarget: String,
    },

    // Location/context info
    location: {
      type: String,
      enum: ["web", "desktop", "api", "system"],
      default: "system",
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

// índices optimizados para consultas frecuentes
rouletteLogSchema.index({ createdAt: -1 });
rouletteLogSchema.index({ drinkId: 1, createdAt: -1 });
rouletteLogSchema.index({ performedBy: 1, createdAt: -1 });
rouletteLogSchema.index({ userId: 1, createdAt: -1 });
rouletteLogSchema.index({ sessionId: 1, createdAt: -1 });
rouletteLogSchema.index({ type: 1, createdAt: -1 });
rouletteLogSchema.index({ location: 1, createdAt: -1 });

// Compound index para analytics de usuario
rouletteLogSchema.index({ userId: 1, type: 1, createdAt: -1 });

export default mongoose.model("RouletteLog", rouletteLogSchema);

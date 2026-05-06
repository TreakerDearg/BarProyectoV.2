import mongoose from "mongoose";

const pricingEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["MULTIPLIER_CHANGE", "PROMOTION_ACTIVATED", "CAPACITY_WARNING", "MANUAL_ADJUSTMENT"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["info", "ok", "warn", "error"],
      default: "info",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PricingEvent", pricingEventSchema);

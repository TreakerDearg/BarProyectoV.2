import mongoose from "mongoose";

const dynamicPricingRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    multiplier: {
      type: Number,
      required: true,
      default: 1.0,
      min: 0.1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    conditions: {
      minDemandLevel: {
        type: String,
        enum: ["low", "normal", "high", "critical"],
        default: "normal",
      },
      category: {
        type: String,
        default: null, // null means global
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("DynamicPricingRule", dynamicPricingRuleSchema);

import mongoose from "mongoose";

const menuTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["drink", "food", "mixed", "custom"],
      default: "custom",
    },
    icon: {
      type: String,
      default: "",
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    template: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

menuTemplateSchema.index({ category: 1, isSystem: 1 });
menuTemplateSchema.index({ createdBy: 1 });
menuTemplateSchema.index({ isFavorite: 1 });

export default mongoose.model("MenuTemplate", menuTemplateSchema);

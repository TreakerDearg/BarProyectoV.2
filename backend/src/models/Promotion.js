import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["PERCENT", "FLAT", "2X1", "CUSTOM"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    schedule: {
      daysOfWeek: {
        type: [String], // ["Monday", "Tuesday", ...]
        default: [],
      },
      startTime: String, // "16:00"
      endTime: String,   // "19:00"
      startDate: Date,
      endDate: Date,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    applicableCategories: [String],
    isActive: {
      type: Boolean,
      default: true,
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

export default mongoose.model("Promotion", promotionSchema);

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const RewardSchema = new Schema({
  name:            { type: String, required: true, trim: true },
  description:     { type: String, trim: true, default: '' },
  image:           { type: String, default: null },
  pointsCost:      { type: Number, required: true, min: 1 },
  category:        { type: String, enum: ['drink','food','experience','discount'], default: 'drink' },
  product:         { type: Schema.Types.ObjectId, ref: 'Product', default: null },
  discountPercent: { type: Number, min: 0, max: 100, default: 0 },
  stock:           { type: Number, default: -1 },
  active:          { type: Boolean, default: true },
  validFrom:       { type: Date, default: null },
  validUntil:      { type: Date, default: null },
  redemptions:     [{
    user:       { type: Schema.Types.ObjectId, ref: 'User' },
    redeemedAt: { type: Date, default: Date.now },
    orderId:    { type: Schema.Types.ObjectId, default: null },
  }],
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

export default model("Reward", RewardSchema);

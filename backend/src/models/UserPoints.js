import mongoose from "mongoose";
const { Schema, model } = mongoose;

const MovementSchema = new Schema({
  type:        { type: String, enum: ['earn','redeem','expire','adjust'], required: true },
  amount:      { type: Number, required: true },
  description: { type: String, default: '' },
  ref:         { type: Schema.Types.ObjectId, default: null },
  refModel:    { type: String, default: null },
  createdAt:   { type: Date, default: Date.now },
}, { _id: false });

const UserPointsSchema = new Schema({
  user:          { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance:       { type: Number, default: 0, min: 0 },
  totalEarned:   { type: Number, default: 0 },
  totalRedeemed: { type: Number, default: 0 },
  movements:     { type: [MovementSchema], default: [] },
}, { timestamps: true });

UserPointsSchema.pre('save', function(next) {
  if (this.movements.length > 100) this.movements = this.movements.slice(-100);
  next();
});

export default model("UserPoints", UserPointsSchema);

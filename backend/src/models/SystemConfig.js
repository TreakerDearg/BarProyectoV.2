import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SystemConfigSchema = new Schema(
  {
    business: {
      name:           { type: String, default: "Nebula Bar & Lounge", trim: true },
      legalName:      { type: String, default: "Nebula Gastronomía S.A.", trim: true },
      taxId:          { type: String, default: "30-71829384-9", trim: true },
      phone:          { type: String, default: "+54 9 11 5829-4412", trim: true },
      address:        { type: String, default: "Av. Costanera 1420, Buenos Aires", trim: true },
      currency:       { type: String, default: "ARS", trim: true },
      currencySymbol: { type: String, default: "$", trim: true },
      currencyPosition: { type: String, enum: ["before", "after"], default: "before" },
      logo:           { type: String, default: null },
      openingHours:   { type: String, default: "19:00 - 05:00", trim: true },
    },
    pos: {
      suggestedTipPercent: { type: Number, default: 10, min: 0, max: 100 },
      taxPercent:          { type: Number, default: 21, min: 0, max: 100 },
      taxIncluded:         { type: Boolean, default: true },
      delayedOrderMinutesBar:     { type: Number, default: 8, min: 1 },
      delayedOrderMinutesKitchen: { type: Number, default: 15, min: 1 },
      soundAlerts:         { type: Boolean, default: true },
      allowZeroStockSale:  { type: Boolean, default: false },
      autoPrintOrders:     { type: Boolean, default: false },
    },
    loyalty: {
      pointsPerCurrencyUnit: { type: Number, default: 0.01, min: 0 }, // Ej: $100 gastados = 1 pt (ratio 0.01)
      welcomeBonusPoints:    { type: Number, default: 50, min: 0 },
      pointsExpiryDays:      { type: Number, default: 365, min: 0 },
      isActive:              { type: Boolean, default: true },
      minRedemptionPoints:   { type: Number, default: 50, min: 1 },
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default model("SystemConfig", SystemConfigSchema);

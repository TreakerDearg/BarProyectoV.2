import mongoose from "mongoose";

/* =========================
   DECORATION SCHEMA
========================= */
const decorationSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFO
    ========================= */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      index: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: 300,
    },

    /* =========================
       CLASSIFICATION
    ========================= */
    type: {
      type: String,
      enum: ["garnish", "glassware", "presentation", "aroma", "ice"],
      required: true,
      index: true,
    },

    category: {
      type: String,
      default: "",
      index: true,
    },

    /* =========================
       VISUAL
    ========================= */
    icon: {
      type: String,
      default: "✨",
    },

    image: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
      index: true,
    },

    /* =========================
       COST
    ========================= */
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =========================
       STATUS
    ========================= */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =========================
   INDEXES
========================= */
decorationSchema.index({ type: 1, category: 1 });
decorationSchema.index({ name: "text", description: "text" });

/* =========================
   SAFE SERIALIZATION
========================= */
decorationSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Decoration", decorationSchema);

import mongoose from "mongoose";

/* =========================
   TAG SCHEMA
========================= */
const tagSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFO
    ========================= */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
      index: true,
    },

    /* =========================
       CLASSIFICATION
    ========================= */
    category: {
      type: String,
      enum: ["author", "premium", "season", "event", "style", "speed", "popularity", "margin", "stock"],
      required: true,
      index: true,
    },

    /* =========================
       VISUAL
    ========================= */
    color: {
      type: String,
      default: "#6366f1",
    },

    /* =========================
       METADATA
    ========================= */
    usageCount: {
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
tagSchema.index({ category: 1, name: 1 });
tagSchema.index({ name: "text" });

/* =========================
   SAFE SERIALIZATION
========================= */
tagSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Tag", tagSchema);

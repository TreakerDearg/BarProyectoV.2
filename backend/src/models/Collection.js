import mongoose from "mongoose";

/* =========================
   COLLECTION SCHEMA
========================= */
const collectionSchema = new mongoose.Schema(
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
       VISUAL
    ========================= */
    icon: {
      type: String,
      default: "📁",
    },

    color: {
      type: String,
      default: "#6366f1",
    },

    /* =========================
       TAGS
    ========================= */
    tags: {
      type: [String],
      default: [],
    },

    /* =========================
       METADATA
    ========================= */
    recipeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isSystem: {
      type: Boolean,
      default: false,
      index: true,
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
collectionSchema.index({ name: "text", description: "text" });
collectionSchema.index({ isSystem: 1, isActive: 1 });

/* =========================
   SAFE SERIALIZATION
========================= */
collectionSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Collection", collectionSchema);

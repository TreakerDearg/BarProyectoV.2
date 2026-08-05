import mongoose from "mongoose";

/* =========================
   TECHNIQUE SCHEMA
========================= */
const techniqueSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ["shake", "stir", "build", "blend", "smoke", "layer", "roll", "muddle", "strain"],
      required: true,
      index: true,
    },

    /* =========================
       VISUAL
    ========================= */
    icon: {
      type: String,
      default: "🥤",
    },

    /* =========================
       INSTRUCTIONS
    ========================= */
    instructions: {
      type: String,
      default: "",
      maxlength: 500,
    },

    /* =========================
       EQUIPMENT
    ========================= */
    equipment: {
      type: [String],
      default: [],
    },

    /* =========================
       METRICS
    ========================= */
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    time: {
      type: Number,
      default: 30,
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
techniqueSchema.index({ category: 1, difficulty: 1 });
techniqueSchema.index({ name: "text", description: "text" });

/* =========================
   SAFE SERIALIZATION
========================= */
techniqueSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Technique", techniqueSchema);

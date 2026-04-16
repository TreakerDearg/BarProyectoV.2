import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "bartender", "waiter", "cashier", "client"],
      default: "client",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);



userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
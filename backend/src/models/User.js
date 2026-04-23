import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* =========================================================
    USER SCHEMA 
========================================================= */
const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    /* ================= ROLE SYSTEM (RBAC CORE) ================= */
    role: {
      type: String,
      enum: ["admin", "bartender", "waiter", "cashier", "kitchen", "client"],
      default: "client",
      index: true,
    },

    /* ================= SHIFT SYSTEM (TURNOS) ================= */
    shift: {
      type: String,
      enum: ["morning", "afternoon", "night", "event"],
      default: null,
      index: true,
    },

    /* ================= PERMISSIONS (FINE GRAIN CONTROL) ================= */
    permissions: {
      type: Object,
      default: {},
      // Ejemplo:
      // {
      //   "orders.create": true,
      //   "orders.delete": false,
      //   "inventory.edit": true
      // }
    },

    /* ================= STATUS ================= */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /* ================= SECURITY ================= */
    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =========================================================
    INDEXES (OPTIMIZACIÓN)
========================================================= */
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ shift: 1, isActive: 1 });

/* =========================================================
    PASSWORD HASHING
========================================================= */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* =========================================================
    METHODS
========================================================= */

/* COMPARE PASSWORD */
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

/* CHECK LOCK */
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

/* INCREMENT LOGIN ATTEMPTS */
userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 2 * 60 * 60 * 1000; // 2h

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      loginAttempts: 1,
      lockUntil: null,
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= MAX_ATTEMPTS) {
    updates.$set = {
      lockUntil: Date.now() + LOCK_TIME,
    };
  }

  return this.updateOne(updates);
};

/* RESET LOGIN ATTEMPTS */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    loginAttempts: 0,
    lockUntil: null,
    lastLogin: new Date(),
  });
};

/* =========================================================
    CLEAN JSON OUTPUT
========================================================= */
userSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

/* =========================================================
    EXPORT
========================================================= */
export default mongoose.model("User", userSchema);
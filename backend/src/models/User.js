import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ROLES = [
  "admin",
  "bartender",
  "waiter",
  "cashier",
  "kitchen",
  "client",
];

const SHIFTS = ["morning", "afternoon", "night", "event"];

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC ================= */
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

    /* ================= ROLE ================= */
    role: {
      type: String,
      enum: ROLES,
      default: "client",
      index: true,
    },

    /* ================= EMPLOYEE ================= */
    shift: {
      type: String,
      enum: SHIFTS,
      default: null,
    },

    isEmployee: {
      type: Boolean,
      default: false,
    },

    /* ================= PERMISSIONS (FIXED) ================= */
    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* ================= STATUS ================= */
    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    /* ================= SECURITY ================= */
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ================= INDEXES ================= */
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ isEmployee: 1, isActive: 1 });

/* ================= PASSWORD ================= */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ================= METHODS ================= */
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = async function () {
  const MAX = 5;
  const LOCK_TIME = 2 * 60 * 60 * 1000;

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      loginAttempts: 1,
      lockUntil: null,
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= MAX) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    loginAttempts: 0,
    lockUntil: null,
    lastLogin: new Date(),
  });
};

/* ================= CLEAN OUTPUT ================= */
userSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
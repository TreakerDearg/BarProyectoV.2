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

    /* ================= SCHEDULE & AVAILABILITY ================= */
    schedule: {
      type: { default: {} },
      monday: {
        isAvailable: { type: Boolean, default: false },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" },
        breakStart: { type: String, default: "" },
        breakEnd: { type: String, default: "" },
      },
      tuesday: {
        isAvailable: { type: Boolean, default: false },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" },
        breakStart: { type: String, default: "" },
        breakEnd: { type: String, default: "" },
      },
      wednesday: {
        isAvailable: { type: Boolean, default: false },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" },
        breakStart: { type: String, default: "" },
        breakEnd: { type: String, default: "" },
      },
      thursday: {
        isAvailable: { type: Boolean, default: false },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" },
        breakStart: { type: String, default: "" },
        breakEnd: { type: String, default: "" },
      },
      friday: {
        isAvailable: { type: Boolean, default: false },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" },
        breakStart: { type: String, default: "" },
        breakEnd: { type: String, default: "" },
      },
      saturday: {
        isAvailable: { type: Boolean, default: false },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" },
        breakStart: { type: String, default: "" },
        breakEnd: { type: String, default: "" },
      },
      sunday: {
        isAvailable: { type: Boolean, default: false },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" },
        breakStart: { type: String, default: "" },
        breakEnd: { type: String, default: "" },
      },
    },

    /* ================= PERFORMANCE METRICS ================= */
    performance: {
      type: { default: {} },
      totalShifts: { type: Number, default: 0 },
      totalHours: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
      avgOrderTime: { type: Number, default: 0 },
      errorRate: { type: Number, default: 0 },
      onTimeRate: { type: Number, default: 0 },
      modules: {
        tables: {
          totalServed: { type: Number, default: 0 },
          avgServiceTime: { type: Number, default: 0 },
          customerSatisfaction: { type: Number, default: 0 },
        },
        orders: {
          totalProcessed: { type: Number, default: 0 },
          avgPrepTime: { type: Number, default: 0 },
          accuracy: { type: Number, default: 0 },
        },
        payments: {
          totalProcessed: { type: Number, default: 0 },
          avgProcessingTime: { type: Number, default: 0 },
          accuracy: { type: Number, default: 0 },
        },
        reservations: {
          totalManaged: { type: Number, default: 0 },
          noShowRate: { type: Number, default: 0 },
          confirmationRate: { type: Number, default: 0 },
        },
      },
      weekly: {
        shifts: { type: Number, default: 0 },
        hours: { type: Number, default: 0 },
        sales: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
      },
      monthly: {
        shifts: { type: Number, default: 0 },
        hours: { type: Number, default: 0 },
        sales: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
      },
    },

    /* ================= COMPLIANCE METRICS ================= */
    compliance: {
      type: { default: {} },
      overallScore: { type: Number, default: 100 },
      protocolAdherence: { type: Number, default: 100 },
      timeCompliance: { type: Number, default: 100 },
      qualityScore: { type: Number, default: 100 },
      protocols: {
        opening: { completed: Number, total: Number, lastChecked: Date },
        closing: { completed: Number, total: Number, lastChecked: Date },
        service: { completed: Number, total: Number, lastChecked: Date },
        safety: { completed: Number, total: Number, lastChecked: Date },
      },
      violations: [{
        type: { type: String },
        description: String,
        severity: { type: String, enum: ["low", "medium", "high", "critical"] },
        date: Date,
        resolved: { type: Boolean, default: false },
      }],
      warnings: [{
        type: String,
        message: String,
        date: Date,
        acknowledged: { type: Boolean, default: false },
      }],
    },

    /* ================= ATTENDANCE TRACKING ================= */
    attendance: {
      type: { default: {} },
      currentStatus: {
        type: String,
        enum: ["checked-in", "checked-out", "break", "absent", "late"],
        default: "checked-out"
      },
      lastCheckIn: Date,
      lastCheckOut: Date,
      currentShiftStart: Date,
      totalMinutesWorked: { type: Number, default: 0 },
      consecutiveDays: { type: Number, default: 0 },
      thisMonth: {
        present: { type: Number, default: 0 },
        absent: { type: Number, default: 0 },
        late: { type: Number, default: 0 },
        totalHours: { type: Number, default: 0 },
      },
      leaveBalance: {
        vacation: { type: Number, default: 0 },
        sick: { type: Number, default: 0 },
        personal: { type: Number, default: 0 },
      },
      leaveRequests: [{
        type: { type: String, enum: ["vacation", "sick", "personal"] },
        startDate: Date,
        endDate: Date,
        reason: String,
        status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"] },
        approvedBy: String,
        approvedAt: Date,
      }],
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
userSchema.index({ "attendance.currentStatus": 1 });
userSchema.index({ "attendance.lastCheckIn": 1 });

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

/* ================= ATTENDANCE METHODS ================= */
userSchema.methods.checkIn = async function () {
  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const schedule = this.schedule?.[dayName];
  
  if (!schedule?.isAvailable) {
    throw new Error("No está programado para trabajar hoy");
  }

  const scheduledStart = schedule.startTime;
  const currentTime = now.toTimeString().slice(0, 5);
  const isLate = currentTime > scheduledStart;

  return this.updateOne({
    "attendance.currentStatus": isLate ? "late" : "checked-in",
    "attendance.lastCheckIn": now,
    "attendance.currentShiftStart": now,
    lastLogin: now,
  });
};

userSchema.methods.checkOut = async function () {
  const now = new Date();
  const lastCheckIn = this.attendance?.lastCheckIn;
  
  if (!lastCheckIn) {
    throw new Error("No hay registro de check-in");
  }

  const minutesWorked = Math.floor((now - new Date(lastCheckIn)) / 60000);

  return this.updateOne({
    "attendance.currentStatus": "checked-out",
    "attendance.lastCheckOut": now,
    "attendance.currentShiftStart": null,
    $inc: { "attendance.totalMinutesWorked": minutesWorked },
  });
};

/* ================= PERFORMANCE METHODS ================= */
userSchema.methods.updatePerformance = async function (metrics) {
  const updates = {};
  
  if (metrics.orders) updates["performance.totalOrders"] = metrics.orders;
  if (metrics.sales) updates["performance.totalSales"] = metrics.sales;
  if (metrics.rating) updates["performance.averageRating"] = metrics.rating;
  if (metrics.shifts) updates["performance.totalShifts"] = metrics.shifts;
  if (metrics.hours) updates["performance.totalHours"] = metrics.hours;

  // Module-specific updates
  if (metrics.module) {
    const { type, data } = metrics.module;
    Object.keys(data).forEach(key => {
      updates[`performance.modules.${type}.${key}`] = data[key];
    });
  }

  return this.updateOne({ $set: updates, $inc: { "performance.totalShifts": 1 } });
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

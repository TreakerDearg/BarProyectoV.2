import mongoose from "mongoose";

/* =========================================================
   ATTENDANCE MODEL
   Registro detallado de asistencia del personal
========================================================= */
const attendanceSchema = new mongoose.Schema(
  {
    /* ================= USER & SHIFT ================= */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    shift: {
      type: String,
      enum: ["morning", "afternoon", "night", "event"],
      required: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    /* ================= TIMING ================= */
    checkIn: {
      time: Date,
      location: {
        type: { type: String },
        coordinates: [Number], // [longitude, latitude]
      },
      device: String,
      ip: String,
    },

    checkOut: {
      time: Date,
      location: {
        type: { type: String },
        coordinates: [Number],
      },
      device: String,
      ip: String,
    },

    breakStart: Date,
    breakEnd: Date,

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ["present", "absent", "late", "early-departure", "half-day"],
      default: "present",
    },

    isApproved: {
      type: Boolean,
      default: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,

    /* ================= HOURS ================= */
    scheduledHours: {
      type: Number,
      default: 8,
    },

    workedHours: {
      type: Number,
      default: 0,
    },

    breakHours: {
      type: Number,
      default: 0,
    },

    overtimeHours: {
      type: Number,
      default: 0,
    },

    /* ================= PERFORMANCE ================= */
    performance: {
      tasksCompleted: { type: Number, default: 0 },
      customerInteractions: { type: Number, default: 0 },
      salesAmount: { type: Number, default: 0 },
      efficiency: { type: Number, default: 0 }, // 0-100
      notes: String,
    },

    /* ================= COMPLIANCE ================= */
    compliance: {
      protocolsFollowed: { type: Number, default: 0 },
      protocolsTotal: { type: Number, default: 0 },
      onTime: Boolean,
      inUniform: Boolean,
      violations: [{
        type: String,
        description: String,
        time: Date,
      }],
    },

    /* ================= NOTES ================= */
    notes: {
      employee: String,
      supervisor: String,
      system: String,
    },

    /* ================= METADATA ================= */
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: "attendance_records",
  }
);

/* ================= INDEXES ================= */
attendanceSchema.index({ user: 1, date: -1 });
attendanceSchema.index({ date: 1, status: 1 });
attendanceSchema.index({ shift: 1, date: 1 });
attendanceSchema.index({ "checkIn.time": 1 });
attendanceSchema.index({ "checkOut.time": 1 });

/* ================= VIRTUALS ================= */
attendanceSchema.virtual("durationHours").get(function () {
  if (!this.checkIn?.time || !this.checkOut?.time) return 0;
  const diff = new Date(this.checkOut.time) - new Date(this.checkIn.time);
  const hours = diff / (1000 * 60 * 60);
  return parseFloat(hours.toFixed(2));
});

attendanceSchema.virtual("isLate").get(function () {
  if (!this.checkIn?.time) return false;
  const checkInTime = new Date(this.checkIn.time);
  const scheduledTime = new Date(this.date);
  scheduledTime.setHours(9, 0, 0, 0); // Assume 9:00 AM start
  return checkInTime > scheduledTime;
});

/* ================= METHODS ================= */
attendanceSchema.methods.calculateOvertime = function () {
  if (this.scheduledHours <= 0 || this.workedHours <= 0) return 0;
  const overtime = Math.max(0, this.workedHours - this.scheduledHours);
  return parseFloat(overtime.toFixed(2));
};

attendanceSchema.methods.updatePerformance = function (data) {
  if (data.tasksCompleted !== undefined) this.performance.tasksCompleted = data.tasksCompleted;
  if (data.customerInteractions !== undefined) this.performance.customerInteractions = data.customerInteractions;
  if (data.salesAmount !== undefined) this.performance.salesAmount = data.salesAmount;
  if (data.efficiency !== undefined) this.performance.efficiency = data.efficiency;
  if (data.notes !== undefined) this.performance.notes = data.notes;
  this.updatedAt = new Date();
  return this.save();
};

/* ================= STATICS ================= */
attendanceSchema.statics.getUserAttendance = async function (userId, startDate, endDate) {
  const query = { user: userId };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  return this.find(query).sort({ date: -1 });
};

attendanceSchema.statics.getDayAttendance = async function (date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    date: { $gte: startOfDay, $lte: endOfDay }
  }).populate('user', 'name email role');
};

attendanceSchema.statics.getAttendanceStats = async function (startDate, endDate) {
  const match = {};
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalHours: { $sum: "$workedHours" },
        totalSales: { $sum: "$performance.salesAmount" },
      }
    }
  ]);

  return stats;
};

/* ================= CLEAN OUTPUT ================= */
attendanceSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Attendance", attendanceSchema);

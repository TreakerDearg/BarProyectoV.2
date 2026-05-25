import mongoose from "mongoose";

const SHIFT_TYPES = ["morning", "afternoon", "night", "event"];

const shiftScheduleSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    shiftType: {
      type: String,
      required: true,
      enum: SHIFT_TYPES,
      index: true,
    },

    /* ================= TIMING ================= */
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
        message: "Formato de hora inválido (HH:MM)",
      },
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
        message: "Formato de hora inválido (HH:MM)",
      },
    },
    breaks: [
      {
        startTime: {
          type: String,
          required: true,
          validate: {
            validator: (v) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: "Formato de hora inválido (HH:MM)",
          },
        },
        endTime: {
          type: String,
          required: true,
          validate: {
            validator: (v) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: "Formato de hora inválido (HH:MM)",
          },
        },
        description: String,
        isPaid: {
          type: Boolean,
          default: false,
        },
      },
    ],

    /* ================= STAFFING ================= */
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxEmployees: {
      type: Number,
      required: true,
      min: 1,
      default: 5,
    },
    minEmployees: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },

    /* ================= MODULES & PERMISSIONS ================= */
    modules: [
      {
        type: String,
        enum: ["orders", "cashier", "inventory", "roulette", "employees", "menus", "tables", "reservations", "discounts"],
      },
    ],
    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* ================= CONFIGURATION ================= */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    description: String,

    /* ================= DAYS ================= */
    applicableDays: [
      {
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ================= INDEXES ================= */
shiftScheduleSchema.index({ shiftType: 1, isActive: 1 });
shiftScheduleSchema.index({ priority: 1 });

/* ================= METHODS ================= */
// Validar si una hora está dentro del turno
shiftScheduleSchema.methods.isWithinShift = function (time) {
  const shiftStart = this.startTime;
  const shiftEnd = this.endTime;
  return time >= shiftStart && time <= shiftEnd;
};

// Obtener empleados asignados activos
shiftScheduleSchema.methods.getActiveEmployees = async function () {
  return await this.populate("assignedEmployees").then((shift) =>
    shift.assignedEmployees.filter((emp) => emp.isActive)
  );
};

export default mongoose.model("ShiftSchedule", shiftScheduleSchema);
/**
 * seed-shifts.js — Pobla turnos y asistencia de empleados
 *
 * Ejecutar:  node src/seeds/seed-shifts.js
 *   ó       npm run seed:shifts  (agrega el script en package.json)
 *
 * Crea:
 *  - Actualiza shift en todos los empleados existentes
 *  - Registros de Attendance de los últimos 30 días
 *  - Métricas de performance por día
 */

import "dotenv/config";
import mongoose from "mongoose";
import User       from "../models/User.js";
import Attendance from "../models/Attendance.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("✓ MongoDB conectado");

// ── Helpers ────────────────────────────────────────────────────────
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rndFloat = (min, max, dec = 1) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(dec));

/** Genera una fecha a 'daysAgo' días atrás, a la hora indicada */
function dateAt(daysAgo, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ── Configuración de turnos ────────────────────────────────────────
const SHIFT_SCHEDULE = {
  morning:   { checkInHour: 9,  checkOutHour: 17, scheduledHours: 8  },
  afternoon: { checkInHour: 14, checkOutHour: 22, scheduledHours: 8  },
  night:     { checkInHour: 20, checkOutHour: 4,  scheduledHours: 8  },
  event:     { checkInHour: 18, checkOutHour: 24, scheduledHours: 6  },
};

// Probabilidades de estado por día (lunes-viernes vs fin de semana)
function pickStatus(dayOfWeek) {
  const rand = Math.random();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Fin de semana — más ausencias
    if (rand < 0.08) return "absent";
    if (rand < 0.12) return "late";
    return "present";
  }
  if (rand < 0.04) return "absent";
  if (rand < 0.09) return "late";
  return "present";
}

// ── 1. Obtener empleados ───────────────────────────────────────────
const employees = await User.find({
  isEmployee: true,
  role: { $ne: "client" },
});

if (employees.length === 0) {
  console.log("⚠  No se encontraron empleados. Ejecutá seed.js primero.");
  await mongoose.disconnect();
  process.exit(0);
}

console.log(`✓ ${employees.length} empleados encontrados`);

// ── 2. Asignar turnos rotativos si no tienen ───────────────────────
const shifts = ["morning", "afternoon", "night", "event"];
let shiftIdx = 0;

for (const emp of employees) {
  if (!emp.shift) {
    // Rotar entre turnos asegurando distribución equitativa
    const assignedShift = shifts[shiftIdx % shifts.length];
    shiftIdx++;
    await User.updateOne({ _id: emp._id }, { shift: assignedShift });
    emp.shift = assignedShift;
    console.log(`  → ${emp.name} asignado a turno: ${assignedShift}`);
  } else {
    console.log(`  ✓ ${emp.name} ya tiene turno: ${emp.shift}`);
  }
}

// Actualizar schedules (horario semanal) para empleados sin agenda
for (const emp of employees) {
  if (!emp.schedule || Object.keys(emp.schedule ?? {}).length === 0) {
    const shiftCfg = SHIFT_SCHEDULE[emp.shift ?? "morning"];
    const padTime  = (h) => `${String(h).padStart(2,"0")}:00`;

    const baseDay  = {
      isAvailable: true,
      startTime:   padTime(shiftCfg.checkInHour),
      endTime:     padTime(shiftCfg.checkOutHour),
      breakStart:  padTime(shiftCfg.checkInHour + 3),
      breakEnd:    padTime(shiftCfg.checkInHour + 4),
    };

    const schedule = {
      monday:    { ...baseDay },
      tuesday:   { ...baseDay },
      wednesday: { ...baseDay },
      thursday:  { ...baseDay },
      friday:    { ...baseDay },
      saturday:  { ...baseDay, isAvailable: emp.shift === "night" || emp.shift === "event" },
      sunday:    { isAvailable: false, startTime: "00:00", endTime: "00:00" },
    };

    await User.updateOne({ _id: emp._id }, { schedule });
    console.log(`  → ${emp.name}: schedule asignado`);
  }
}

// ── 3. Limpiar asistencia anterior del seed ────────────────────────
await Attendance.deleteMany({ _id: { $exists: true }, notes: "seeded" });
console.log("✓ Registros de asistencia anteriores (seed) eliminados");

// ── 4. Crear registros de asistencia — últimos 30 días ────────────
const DAYS_BACK = 30;
let created = 0;

for (const emp of employees) {
  const shiftCfg = SHIFT_SCHEDULE[emp.shift ?? "morning"];

  for (let daysAgo = DAYS_BACK; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay(); // 0=dom, 6=sáb

    // No registrar domingo si el empleado no trabaja
    if (dayOfWeek === 0 && emp.shift !== "night" && emp.shift !== "event") continue;

    const status = pickStatus(dayOfWeek);

    // Para ausentes no generar check-in
    if (status === "absent") {
      await Attendance.create({
        user:           emp._id,
        shift:          emp.shift ?? "morning",
        date,
        status:         "absent",
        scheduledHours: shiftCfg.scheduledHours,
        workedHours:    0,
        isApproved:     true,
        notes:          "seeded",
      });
      created++;
      continue;
    }

    // Tardanza: llegar 15–45 min tarde
    const lateMin      = status === "late" ? rnd(15, 45) : rnd(-5, 10);
    const checkInTime  = dateAt(daysAgo, shiftCfg.checkInHour, lateMin);

    // Check-out: 0–30 min sobre el horario
    const extraMin     = rnd(0, 30);
    const checkOutHour = shiftCfg.checkOutHour;
    const checkOutTime = new Date(checkInTime);
    checkOutTime.setHours(checkOutHour, extraMin, 0, 0);
    if (checkOutTime <= checkInTime) checkOutTime.setDate(checkOutTime.getDate() + 1);

    const workedMs   = checkOutTime.getTime() - checkInTime.getTime();
    const workedHrs  = parseFloat((workedMs / 3_600_000).toFixed(2));
    const overtime   = Math.max(0, workedHrs - shiftCfg.scheduledHours);

    // Break de 1h en el medio
    const breakStart = new Date(checkInTime);
    breakStart.setHours(breakStart.getHours() + 3);
    const breakEnd   = new Date(breakStart);
    breakEnd.setHours(breakEnd.getHours() + 1);

    // Performance del día
    const efficiency = rnd(
      status === "late" ? 50 : 65,
      status === "late" ? 80 : 100,
    );
    const tasks        = rnd(8, 32);
    const interactions = rnd(5, 40);
    const salesAmount  = emp.role === "bartender" || emp.role === "cashier"
      ? rndFloat(800, 8000)
      : rndFloat(100, 2000);

    await Attendance.create({
      user:           emp._id,
      shift:          emp.shift ?? "morning",
      date,
      status,
      checkIn:        { time: checkInTime, device: "Desktop", ip: "192.168.1.1" },
      checkOut:       { time: checkOutTime },
      breakStart,
      breakEnd,
      scheduledHours: shiftCfg.scheduledHours,
      workedHours:    workedHrs,
      breakHours:     1,
      overtimeHours:  overtime,
      isApproved:     true,
      performance:    { tasksCompleted: tasks, customerInteractions: interactions, salesAmount, efficiency },
      notes:          "seeded",
    });
    created++;
  }
}

console.log(`✓ ${created} registros de asistencia creados`);

// ── 5. Actualizar métricas del mes en cada empleado ────────────────
for (const emp of employees) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const records = await Attendance.find({
    user: emp._id,
    date: { $gte: monthStart },
  });

  const present    = records.filter((r) => r.status === "present" || r.status === "late").length;
  const absent     = records.filter((r) => r.status === "absent").length;
  const totalHours = records.reduce((s, r) => s + (r.workedHours ?? 0), 0);
  const avgEff     = records.length > 0
    ? Math.round(records.reduce((s, r) => s + (r.performance?.efficiency ?? 0), 0) / records.length)
    : 0;
  const avgSales   = records.length > 0
    ? records.reduce((s, r) => s + (r.performance?.salesAmount ?? 0), 0) / records.length
    : 0;

  await User.updateOne({ _id: emp._id }, {
    "attendance.thisMonth.present":    present,
    "attendance.thisMonth.absent":     absent,
    "attendance.thisMonth.totalHours": parseFloat(totalHours.toFixed(1)),
    "performance.averageRating":       parseFloat(Math.min(5, (avgEff / 20)).toFixed(1)),
    "performance.shiftsCompleted":     present,
    "performance.totalHours":          parseFloat(totalHours.toFixed(1)),
    "performance.totalSales":          parseFloat(avgSales.toFixed(2)),
  });
  console.log(`  → ${emp.name}: ${present}p/${absent}a — ${totalHours.toFixed(1)}h — eff:${avgEff}%`);
}

console.log("\n✅ seed-shifts completado");
await mongoose.disconnect();
process.exit(0);

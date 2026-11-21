/**
 * seed-shifts.js — Pobla turnos y asistencia en tiempo real de empleados
 *
 * Ejecutar:  node src/seeds/seed-shifts.js
 *   ó       npm run seed:shifts
 *
 * Genera:
 *  - Estaciones de trabajo asignadas a cada empleado
 *  - Registros de Attendance de los últimos 28 días con insertMany de alto rendimiento
 *  - Check-in activo en tiempo real (hoy) para visualizar "En Turno" en el Monitor y Cards
 *  - Métricas de desempeño acumuladas y horas del mes
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

// ── Configuración de turnos y estaciones ───────────────────────────
const SHIFT_SCHEDULE = {
  morning:   { checkInHour: 8,  checkOutHour: 16, scheduledHours: 8 },
  afternoon: { checkInHour: 16, checkOutHour: 24, scheduledHours: 8 },
  night:     { checkInHour: 20, checkOutHour: 4,  scheduledHours: 8 },
  event:     { checkInHour: 18, checkOutHour: 24, scheduledHours: 6 },
};

const ROLE_STATIONS = {
  admin:     "Administración & Control",
  bartender: "Barra Principal",
  waiter:    "Salón Principal & Terraza",
  kitchen:   "Cocina Fuegos & Platos",
  cashier:   "Caja Central & TPV",
};

// ── 1. Obtener empleados ───────────────────────────────────────────
const employees = await User.find({
  isEmployee: true,
  role: { $ne: "client" },
});

if (employees.length === 0) {
  console.log("⚠ No se encontraron empleados. Ejecutá npm run seed primero.");
  await mongoose.disconnect();
  process.exit(0);
}

console.log(`✓ ${employees.length} colaboradores encontrados`);

// ── 2. Asignar turnos, estaciones y schedules ──────────────────────
const shifts = ["night", "afternoon", "morning"];
let shiftIdx = 0;

for (const emp of employees) {
  let station = ROLE_STATIONS[emp.role] || "Operaciones";
  if (emp.email === "sofia@nebula.bar") {
    station = "Barra Cócteles & VIP";
  }

  const assignedShift = emp.shift || shifts[shiftIdx % shifts.length];
  shiftIdx++;

  const shiftCfg = SHIFT_SCHEDULE[assignedShift] || SHIFT_SCHEDULE.night;
  const padTime = (h) => `${String(h % 24).padStart(2, "0")}:00`;

  const baseDay = {
    isAvailable: true,
    startTime:   padTime(shiftCfg.checkInHour),
    endTime:     padTime(shiftCfg.checkOutHour),
    breakStart:  padTime(shiftCfg.checkInHour + 3),
    breakEnd:    padTime(shiftCfg.checkInHour + 4),
  };

  const schedule = {
    monday:    { ...baseDay },
    tuesday:   { ...baseDay },
    wednesday: { ...baseDay, isAvailable: emp.email !== "bartender@nebula.bar" },
    thursday:  { ...baseDay },
    friday:    { ...baseDay },
    saturday:  { ...baseDay, isAvailable: true },
    sunday:    { isAvailable: assignedShift === "night", startTime: "19:00", endTime: "02:00" },
  };

  await User.updateOne(
    { _id: emp._id },
    {
      shift: assignedShift,
      station,
      schedule,
    }
  );
  emp.shift = assignedShift;
  emp.station = station;
  emp.schedule = schedule;
  console.log(`  → ${emp.name} (${emp.role}) asignado a: [${assignedShift}] en [${station}]`);
}

// ── 3. Limpiar asistencia anterior de seed ─────────────────────────
await Attendance.deleteMany({ "notes.system": { $regex: /seeded/i } });
await Attendance.deleteMany({ notes: "seeded" });
console.log("✓ Registros de asistencia de seed anteriores eliminados");

// ── 4. Generar histórico de los últimos 28 días (Días 28 al 1) ─────
const DAYS_BACK = 28;
const attendanceBatch = [];

for (const emp of employees) {
  const shiftCfg = SHIFT_SCHEDULE[emp.shift ?? "night"];

  for (let daysAgo = DAYS_BACK; daysAgo >= 1; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay(); // 0 = dom
    if (dayOfWeek === 0 && emp.role === "admin") continue;

    const isLate = Math.random() < 0.08;
    const isAbsent = Math.random() < 0.04;
    const status = isAbsent ? "absent" : isLate ? "late" : "present";

    if (status === "absent") {
      attendanceBatch.push({
        user:           emp._id,
        shift:          emp.shift ?? "night",
        station:        emp.station,
        date,
        status:         "absent",
        scheduledHours: shiftCfg.scheduledHours,
        workedHours:    0,
        isApproved:     true,
        notes:          { system: "seeded" },
      });
      continue;
    }

    const lateMin = isLate ? rnd(15, 35) : rnd(-5, 5);
    const checkInTime = dateAt(daysAgo, shiftCfg.checkInHour, Math.max(0, lateMin));

    const extraMin = rnd(0, 25);
    const checkOutTime = new Date(checkInTime);
    checkOutTime.setHours(shiftCfg.checkOutHour, extraMin, 0, 0);
    if (checkOutTime <= checkInTime) checkOutTime.setDate(checkOutTime.getDate() + 1);

    const workedMs = checkOutTime.getTime() - checkInTime.getTime();
    const workedHrs = parseFloat((workedMs / 3_600_000).toFixed(2));
    const overtime = Math.max(0, workedHrs - shiftCfg.scheduledHours);

    const breakStart = new Date(checkInTime);
    breakStart.setHours(breakStart.getHours() + 3);
    const breakEnd = new Date(breakStart);
    breakEnd.setHours(breakEnd.getHours() + 1);

    const efficiency = rnd(isLate ? 75 : 88, 100);
    const tasks = rnd(12, 45);
    const interactions = rnd(10, 60);
    const salesAmount = (emp.role === "bartender" || emp.role === "cashier")
      ? rndFloat(2500, 12000)
      : rndFloat(400, 3500);

    attendanceBatch.push({
      user:           emp._id,
      shift:          emp.shift ?? "night",
      station:        emp.station,
      date,
      status,
      checkIn:        { time: checkInTime, device: "POS Desktop Nebula", ip: "192.168.1.105" },
      checkOut:       { time: checkOutTime, device: "POS Desktop Nebula", ip: "192.168.1.105" },
      breakStart,
      breakEnd,
      scheduledHours: shiftCfg.scheduledHours,
      workedHours:    workedHrs,
      breakHours:     1,
      overtimeHours:  overtime,
      isApproved:     true,
      performance:    { tasksCompleted: tasks, customerInteractions: interactions, salesAmount, efficiency },
      notes:          { system: "seeded" },
    });
  }
}

// ── 5. Crear fichajes en vivo para el día de HOY (Día 0) ───────────
const today = new Date();
const now = new Date();

console.log("✓ Generando personal activo en turno para hoy...");

// Carlos Bartender (En Turno activo, check-in hace 3h 40m)
const carlos = employees.find((e) => e.email === "bartender@nebula.bar");
if (carlos) {
  const checkInTime = new Date(now.getTime() - 3.7 * 3600 * 1000);
  attendanceBatch.push({
    user:           carlos._id,
    shift:          carlos.shift || "night",
    station:        "Barra Principal",
    date:           today,
    status:         "present",
    checkIn:        { time: checkInTime, device: "POS Barra #1", ip: "192.168.1.101" },
    scheduledHours: 8,
    isApproved:     true,
    notes:          { system: "seeded-live" },
  });

  await User.updateOne({ _id: carlos._id }, {
    station: "Barra Principal",
    "attendance.currentStatus": "checked-in",
    "attendance.lastCheckIn": checkInTime,
    "attendance.currentShiftStart": checkInTime,
  });
  console.log("  → Carlos Bartender: EN TURNO (Barra Principal)");
}

// Ana Mesera (En Turno activo, check-in hace 2h 15m)
const ana = employees.find((e) => e.email === "waiter@nebula.bar");
if (ana) {
  const checkInTime = new Date(now.getTime() - 2.25 * 3600 * 1000);
  attendanceBatch.push({
    user:           ana._id,
    shift:          ana.shift || "night",
    station:        "Salón Principal & Terraza",
    date:           today,
    status:         "present",
    checkIn:        { time: checkInTime, device: "Handheld Mozo #3", ip: "192.168.1.120" },
    scheduledHours: 8,
    isApproved:     true,
    notes:          { system: "seeded-live" },
  });

  await User.updateOne({ _id: ana._id }, {
    station: "Salón Principal & Terraza",
    "attendance.currentStatus": "checked-in",
    "attendance.lastCheckIn": checkInTime,
    "attendance.currentShiftStart": checkInTime,
  });
  console.log("  → Ana Mesera: EN TURNO (Salón Principal & Terraza)");
}

// Laura Cajera (En Turno activo, check-in hace 4h)
const laura = employees.find((e) => e.email === "cashier@nebula.bar");
if (laura) {
  const checkInTime = new Date(now.getTime() - 4.1 * 3600 * 1000);
  attendanceBatch.push({
    user:           laura._id,
    shift:          laura.shift || "night",
    station:        "Caja Central & TPV",
    date:           today,
    status:         "present",
    checkIn:        { time: checkInTime, device: "Caja Principal", ip: "192.168.1.100" },
    scheduledHours: 8,
    isApproved:     true,
    notes:          { system: "seeded-live" },
  });

  await User.updateOne({ _id: laura._id }, {
    station: "Caja Central & TPV",
    "attendance.currentStatus": "checked-in",
    "attendance.lastCheckIn": checkInTime,
    "attendance.currentShiftStart": checkInTime,
  });
  console.log("  → Laura Cajera: EN TURNO (Caja Central & TPV)");
}

// Sofía Bartender (En Descanso, check-in hace 3h, descanso hace 15m)
const sofia = employees.find((e) => e.email === "sofia@nebula.bar");
if (sofia) {
  const checkInTime = new Date(now.getTime() - 3.0 * 3600 * 1000);
  const breakStart = new Date(now.getTime() - 0.25 * 3600 * 1000);
  attendanceBatch.push({
    user:           sofia._id,
    shift:          sofia.shift || "afternoon",
    station:        "Barra Cócteles & VIP",
    date:           today,
    status:         "present",
    checkIn:        { time: checkInTime, device: "POS Barra VIP", ip: "192.168.1.102" },
    breakStart,
    scheduledHours: 8,
    isApproved:     true,
    notes:          { system: "seeded-live" },
  });

  await User.updateOne({ _id: sofia._id }, {
    station: "Barra Cócteles & VIP",
    "attendance.currentStatus": "break",
    "attendance.lastCheckIn": checkInTime,
    "attendance.currentShiftStart": checkInTime,
  });
  console.log("  → Sofía Bartender: EN DESCANSO (Barra Cócteles & VIP)");
}

// Pedro Cocina (Fuera de turno hoy, próximo turno programado)
const pedro = employees.find((e) => e.email === "kitchen@nebula.bar");
if (pedro) {
  await User.updateOne({ _id: pedro._id }, {
    station: "Cocina Fuegos & Platos",
    "attendance.currentStatus": "checked-out",
  });
  console.log("  → Pedro Cocina: FUERA DE TURNO (Programado para próximo turno)");
}

// Admin Principal (En Turno activo, gestión y supervisión)
const admin = employees.find((e) => e.role === "admin");
if (admin) {
  const checkInTime = new Date(now.getTime() - 5.0 * 3600 * 1000);
  attendanceBatch.push({
    user:           admin._id,
    shift:          admin.shift || "night",
    station:        "Administración & Control",
    date:           today,
    status:         "present",
    checkIn:        { time: checkInTime, device: "Master Dashboard", ip: "192.168.1.1" },
    scheduledHours: 8,
    isApproved:     true,
    notes:          { system: "seeded-live" },
  });

  await User.updateOne({ _id: admin._id }, {
    station: "Administración & Control",
    "attendance.currentStatus": "checked-in",
    "attendance.lastCheckIn": checkInTime,
    "attendance.currentShiftStart": checkInTime,
  });
  console.log("  → Admin Principal: EN TURNO (Administración & Control)");
}

// Inserción en lote de alta velocidad
if (attendanceBatch.length > 0) {
  await Attendance.insertMany(attendanceBatch);
  console.log(`✓ ${attendanceBatch.length} registros de asistencia insertados en MongoDB en una sola operación.`);
}

// ── 6. Actualizar métricas acumuladas del mes en cada colaborador ──
console.log("\n✓ Consolidando métricas del mes en cada colaborador...");

const monthStart = new Date();
monthStart.setDate(1);
monthStart.setHours(0, 0, 0, 0);

for (const emp of employees) {
  const records = await Attendance.find({
    user: emp._id,
    date: { $gte: monthStart },
  });

  const presentCount = records.filter((r) => r.status === "present" || r.status === "late").length;
  const absentCount  = records.filter((r) => r.status === "absent").length;
  let totalHours     = records.reduce((s, r) => s + (r.workedHours ?? 0), 0);

  const minTargetHours = rnd(142, 158);
  if (totalHours < 80) {
    totalHours = minTargetHours + rndFloat(0.5, 4.5);
  }
  const effectiveShifts = Math.max(presentCount, rnd(18, 22));

  const avgEff = rnd(92, 98);
  const totalSales = emp.role === "bartender"
    ? rndFloat(140000, 220000, 0)
    : emp.role === "waiter"
    ? rndFloat(90000, 160000, 0)
    : emp.role === "cashier"
    ? rndFloat(250000, 480000, 0)
    : rndFloat(15000, 45000, 0);

  await User.updateOne({ _id: emp._id }, {
    "attendance.thisMonth.present":    effectiveShifts,
    "attendance.thisMonth.absent":     absentCount,
    "attendance.thisMonth.totalHours": parseFloat(totalHours.toFixed(1)),
    "performance.averageRating":       parseFloat((avgEff / 20).toFixed(1)),
    "performance.shiftsCompleted":     effectiveShifts,
    "performance.totalHours":          parseFloat(totalHours.toFixed(1)),
    "performance.totalSales":          totalSales,
  });

  console.log(`  ✓ ${emp.name}: ${effectiveShifts} turnos · ${totalHours.toFixed(1)}h · Rating: ${(avgEff/20).toFixed(1)} ★ · Ventas: $${totalSales.toLocaleString()}`);
}

console.log("\n✅ Seed de Workforce y Asistencia en Vivo completado exitosamente.\n");
await mongoose.disconnect();
process.exit(0);

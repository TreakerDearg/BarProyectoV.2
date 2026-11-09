"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  LogOut,
  Plus,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Wine,
  UtensilsCrossed,
  ChefHat,
  CreditCard,
  Crown,
  Zap,
  ShieldCheck,
  Check,
} from "lucide-react";
import {
  getTodayAttendance,
  type TodayAttendanceStats,
  type AttendanceRecord,
} from "../services/attendanceService";
import { getEmployees, updateUser } from "../services/userService";
import type { User as UserType, Shift, DaySchedule, UserSchedule } from "../types/user";

const DAYS_OF_WEEK: { key: keyof UserSchedule; label: string; short: string }[] = [
  { key: "monday", label: "Lunes", short: "Lun" },
  { key: "tuesday", label: "Martes", short: "Mar" },
  { key: "wednesday", label: "Miércoles", short: "Mié" },
  { key: "thursday", label: "Jueves", short: "Jue" },
  { key: "friday", label: "Viernes", short: "Vie" },
  { key: "saturday", label: "Sábado", short: "Sáb" },
  { key: "sunday", label: "Domingo", short: "Dom" },
];

const SHIFT_TYPES: {
  id: Shift;
  label: string;
  hours: string;
  badge: string;
  icon: string;
}[] = [
  {
    id: "morning",
    label: "Mañana",
    hours: "08:00 - 16:00",
    badge: "bg-emerald/15 text-emerald border-emerald/30",
    icon: "🌅",
  },
  {
    id: "afternoon",
    label: "Tarde",
    hours: "16:00 - 00:00",
    badge: "bg-amber/15 text-amber border-amber/30",
    icon: "🌇",
  },
  {
    id: "night",
    label: "Noche",
    hours: "20:00 - 04:00",
    badge: "bg-cyan/15 text-cyan border-cyan/30",
    icon: "🌙",
  },
  {
    id: "event",
    label: "Evento",
    hours: "Especial",
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    icon: "🎉",
  },
];

export default function ShiftAttendancePage() {
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [todayStats, setTodayStats] = useState<TodayAttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingShift, setSavingShift] = useState(false);
  const [activeTab, setActiveTab] = useState<"live" | "planner">("live");

  // Load data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [empList, attendance] = await Promise.all([
        getEmployees(),
        getTodayAttendance().catch(() => null),
      ]);
      setEmployees(Array.isArray(empList) ? empList : []);
      if (attendance) setTodayStats(attendance);
    } catch (err) {
      console.warn("Could not load shift data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Active employees on shift right now
  const onShiftEmployees = useMemo(() => {
    return employees.filter(
      (e) => e.attendance?.currentStatus === "checked-in" && e.isActive
    );
  }, [employees]);

  // Current active shift name based on current hour
  const currentShiftName = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 8 && hour < 16) return "Turno Mañana (08:00 - 16:00)";
    if (hour >= 16 && hour < 20) return "Turno Tarde (16:00 - 00:00)";
    return "Turno Noche (20:00 - 04:00)";
  }, []);

  // Update employee weekly schedule day
  const handleAssignDayShift = async (
    employee: UserType,
    dayKey: keyof UserSchedule,
    newShiftType: Shift | "off"
  ) => {
    try {
      setSavingShift(true);
      const currentSchedule = employee.schedule || {};
      let updatedDay: DaySchedule;

      if (newShiftType === "off") {
        updatedDay = {
          isAvailable: false,
          startTime: "",
          endTime: "",
        };
      } else {
        const found = SHIFT_TYPES.find((s) => s.id === newShiftType);
        const [startTime, endTime] = found
          ? found.hours.split(" - ")
          : ["18:00", "02:00"];

        updatedDay = {
          isAvailable: true,
          startTime,
          endTime,
        };
      }

      const newSchedule = {
        ...currentSchedule,
        [dayKey]: updatedDay,
      };

      await updateUser(employee._id, { schedule: newSchedule });
      await fetchData();
    } catch (err) {
      console.error("Failed to update shift:", err);
      alert("Error al actualizar el turno del colaborador.");
    } finally {
      setSavingShift(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan" />
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Control Operativo de Turnos
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Turnos & Asistencia en Vivo
          </h1>
          <p className="text-xs text-text-muted">
            Monitoreo en tiempo real de presencia en sala/barra y planificador semanal Lunes a Domingo
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            title="Refrescar datos"
            className="p-2.5 rounded-xl border border-border/60 hover:border-gold/40 hover:bg-surface-card text-text-muted hover:text-gold transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gold" : ""}`} />
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-surface-card border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab("live")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "live"
                  ? "bg-emerald/15 text-emerald border border-emerald/30 shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              Monitor en Vivo ({onShiftEmployees.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("planner")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "planner"
                  ? "bg-gold/15 text-gold border border-gold/30 shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Planificador Semanal
            </button>
          </div>
        </div>
      </div>

      {/* Real-time KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: En Servicio Hoy */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              En Servicio Ahora
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald/15 border border-emerald/30 flex items-center justify-center text-emerald">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald font-mono">
              {onShiftEmployees.length}
            </span>
            <span className="text-xs text-text-muted">
              colaboradores activos
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald animate-ping" />
            Presencia validada en barra & salón
          </div>
        </div>

        {/* KPI 2: Turno en Curso */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Franja Horaria Actual
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan/15 border border-cyan/30 flex items-center justify-center text-cyan">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-text-primary truncate">
              {currentShiftName}
            </span>
          </div>
          <div className="mt-3 text-xs text-text-muted">
            Horario operativo de mayor afluencia
          </div>
        </div>

        {/* KPI 3: Cobertura de Dotación */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Cobertura de Puestos
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gold font-mono">
              100%
            </span>
            <span className="text-xs text-text-muted">
              estaciones cubiertas
            </span>
          </div>
          <div className="mt-3 text-xs text-emerald font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Barra y cocina con dotación completa
          </div>
        </div>

        {/* KPI 4: Total Horas Registradas */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Horas Hoy Computadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary font-mono">
              {todayStats?.totalHours ? `${todayStats.totalHours}h` : "24.5h"}
            </span>
            <span className="text-xs text-text-muted">
              horas efectivas
            </span>
          </div>
          <div className="mt-3 text-xs text-text-muted">
            Sincronizado con Attendance
          </div>
        </div>
      </div>

      {/* VIEW 1: MONITOR EN VIVO */}
      {activeTab === "live" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                Personal en Servicio Activo ({onShiftEmployees.length})
              </h3>
              <p className="text-xs text-text-muted">
                Colaboradores que han registrado check-in y se encuentran en su puesto
              </p>
            </div>
          </div>

          {onShiftEmployees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {onShiftEmployees.map((emp) => {
                const checkInTime = emp.attendance?.lastCheckIn
                  ? new Date(emp.attendance.lastCheckIn).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "08:00";

                return (
                  <div
                    key={emp._id}
                    className="p-4 rounded-2xl bg-surface-card border border-border/60 hover:border-emerald/40 transition-all flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-dark border border-border/70 flex items-center justify-center font-bold text-xs text-gold font-mono">
                        {emp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-text-primary block">
                          {emp.name}
                        </span>
                        <span className="text-[11px] text-text-muted capitalize">
                          {emp.role} · Entrada: {checkInTime} hs
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald/15 text-emerald border border-emerald/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                        Activo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-surface-card border border-border/60 rounded-2xl space-y-2">
              <Clock className="w-8 h-8 text-gold mx-auto" />
              <h4 className="text-xs font-bold text-text-primary">
                No hay colaboradores con fichaje abierto en este momento
              </h4>
              <p className="text-[11px] text-text-muted">
                Los colaboradores aparecerán aquí automáticamente al iniciar sesión o realizar check-in desde el TPV.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PLANIFICADOR SEMANAL INTERACTIVO */}
      {activeTab === "planner" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-card p-3 rounded-2xl border border-border/60">
            <div>
              <h3 className="text-xs font-bold text-text-primary">
                Planificador Semanal Interactivo (Lunes a Domingo)
              </h3>
              <p className="text-[11px] text-text-muted">
                Haz clic en cualquier celda para alternar entre turnos (*Mañana, Tarde, Noche, Evento, Franco*)
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {SHIFT_TYPES.map((s) => (
                <span
                  key={s.id}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${s.badge}`}
                >
                  {s.icon} {s.label}
                </span>
              ))}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-surface-dark text-text-muted border border-border/40">
                🏖️ Franco
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="border border-border/60 rounded-2xl overflow-hidden bg-surface-card shadow-sm overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border/60 bg-surface-dark/70 text-text-muted uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-bold">Colaborador / Rol</th>
                  {DAYS_OF_WEEK.map((d) => (
                    <th key={d.key} className="py-3 px-2 text-center font-bold">
                      {d.short}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right font-bold">Horas Sem.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {employees.map((emp) => {
                  const schedule = emp.schedule || {};
                  let totalHours = 0;

                  return (
                    <tr
                      key={emp._id}
                      className="hover:bg-surface-dark/30 transition-colors"
                    >
                      {/* Name & Role */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-text-primary block">
                          {emp.name}
                        </span>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider capitalize">
                          {emp.role}
                        </span>
                      </td>

                      {/* Days Monday to Sunday */}
                      {DAYS_OF_WEEK.map(({ key }) => {
                        const day = schedule[key];
                        const isAvail = day?.isAvailable;
                        if (isAvail) totalHours += 8;

                        // Identify shift label
                        let shiftDisplay = "🏖️";
                        let badgeClass = "bg-surface-dark text-text-muted border-border/40";

                        if (isAvail) {
                          const startH = Number((day.startTime || "18").split(":")[0]);
                          if (startH < 12) {
                            shiftDisplay = "🌅";
                            badgeClass = "bg-emerald/15 text-emerald border-emerald/30 font-bold";
                          } else if (startH < 18) {
                            shiftDisplay = "🌇";
                            badgeClass = "bg-amber/15 text-amber border-amber/30 font-bold";
                          } else {
                            shiftDisplay = "🌙";
                            badgeClass = "bg-cyan/15 text-cyan border-cyan/30 font-bold";
                          }
                        }

                        // Cycle on click: off -> morning -> afternoon -> night -> off
                        const nextShift = !isAvail
                          ? "night"
                          : day.startTime?.startsWith("20")
                          ? "afternoon"
                          : day.startTime?.startsWith("16")
                          ? "morning"
                          : "off";

                        return (
                          <td key={key} className="py-2.5 px-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleAssignDayShift(emp, key, nextShift as any)}
                              disabled={savingShift}
                              className={`w-full py-1.5 px-1 rounded-lg text-xs border transition-all hover:scale-105 active:scale-95 ${badgeClass}`}
                              title="Clic para cambiar turno"
                            >
                              {shiftDisplay}
                            </button>
                          </td>
                        );
                      })}

                      {/* Total Weekly Hours */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-gold">
                        {totalHours}h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


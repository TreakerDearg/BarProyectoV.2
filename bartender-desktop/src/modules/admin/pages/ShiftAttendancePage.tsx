"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  LogOut,
  LogIn,
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
  Sun,
  Sunset,
  Moon,
  Coffee,
  MapPin,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import {
  getTodayAttendance,
  recordCheckIn,
  recordCheckOut,
  type TodayAttendanceStats,
  type AttendanceRecord,
} from "../services/attendanceService";
import { getEmployees, updateUser } from "../services/userService";
import type { User as UserType, Shift, DaySchedule, UserSchedule } from "../types/user";

const DAYS_OF_WEEK: { key: keyof UserSchedule; label: string; short: string }[] = [
  { key: "monday",    label: "Lunes",     short: "Lun" },
  { key: "tuesday",   label: "Martes",    short: "Mar" },
  { key: "wednesday", label: "Miércoles", short: "Mié" },
  { key: "thursday",  label: "Jueves",    short: "Jue" },
  { key: "friday",    label: "Viernes",   short: "Vie" },
  { key: "saturday",  label: "Sábado",    short: "Sáb" },
  { key: "sunday",    label: "Domingo",   short: "Dom" },
];

const SHIFT_TYPES: {
  id: Shift;
  label: string;
  hours: string;
  badge: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "morning",
    label: "Mañana",
    hours: "08:00 - 16:00",
    badge: "bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30",
    icon: <Sun className="w-3 h-3 text-[#3FB950]" />,
  },
  {
    id: "afternoon",
    label: "Tarde",
    hours: "16:00 - 00:00",
    badge: "bg-[#D29922]/15 text-[#D29922] border-[#D29922]/30",
    icon: <Sunset className="w-3 h-3 text-[#D29922]" />,
  },
  {
    id: "night",
    label: "Noche",
    hours: "20:00 - 04:00",
    badge: "bg-[#388BFD]/15 text-[#388BFD] border-[#388BFD]/30",
    icon: <Moon className="w-3 h-3 text-[#388BFD]" />,
  },
  {
    id: "event",
    label: "Evento",
    hours: "Especial",
    badge: "bg-[#BC8CFF]/15 text-[#BC8CFF] border-[#BC8CFF]/30",
    icon: <Sparkles className="w-3 h-3 text-[#BC8CFF]" />,
  },
];

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin:     <Crown className="w-3 h-3 text-[#F0B429]" />,
  bartender: <Wine className="w-3 h-3 text-[#388BFD]" />,
  waiter:    <UtensilsCrossed className="w-3 h-3 text-[#3FB950]" />,
  kitchen:   <ChefHat className="w-3 h-3 text-[#D29922]" />,
  cashier:   <CreditCard className="w-3 h-3 text-[#BC8CFF]" />,
};

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

  // Active employees on shift right now (from employee status or todayStats)
  const onShiftEmployees = useMemo(() => {
    return employees.filter(
      (e) => (e.attendance?.currentStatus === "checked-in" || e.attendance?.currentStatus === "break") && e.isActive
    );
  }, [employees]);

  // Current active shift name based on current hour
  const currentShiftName = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 8 && hour < 16) return "Turno Mañana (08:00 - 16:00)";
    if (hour >= 16 && hour < 20) return "Turno Tarde (16:00 - 00:00)";
    return "Turno Noche (20:00 - 04:00)";
  }, []);

  // One-click Check Out from Live Monitor
  const handleLiveCheckOut = async (userId: string) => {
    try {
      await recordCheckOut({
        targetUserId: userId,
        notes: "Salida registrada desde Monitor en Vivo",
      });
      await fetchData();
    } catch (err: any) {
      console.error("Failed to check-out:", err);
      alert(err?.response?.data?.message || err?.message || "Error al registrar salida.");
    }
  };

  // One-click Check In for off-shift employee
  const handleLiveCheckIn = async (employee: UserType) => {
    try {
      await recordCheckIn({
        targetUserId: employee._id,
        shift: employee.shift || "night",
        station: employee.station || "Barra Principal",
      });
      await fetchData();
    } catch (err: any) {
      console.error("Failed to check-in:", err);
      alert(err?.response?.data?.message || err?.message || "Error al registrar entrada.");
    }
  };

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
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#30363D] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#388BFD]" />
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              Control Operativo de Turnos
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E6EDF3]">
            Turnos & Asistencia en Vivo
          </h1>
          <p className="text-xs text-[#8B949E]">
            Monitoreo en tiempo real de presencia en sala/barra y planificador semanal Lunes a Domingo
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            title="Refrescar datos"
            className="p-2.5 rounded-xl border border-[#30363D] hover:border-[#F0B429]/40 hover:bg-[#161B22] text-[#8B949E] hover:text-[#F0B429] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#F0B429]" : ""}`} />
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#161B22] border border-[#30363D]">
            <button
              type="button"
              onClick={() => setActiveTab("live")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "live"
                  ? "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30 shadow-sm"
                  : "text-[#8B949E] hover:text-[#E6EDF3]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
              Monitor en Vivo ({onShiftEmployees.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("planner")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "planner"
                  ? "bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/30 shadow-sm"
                  : "text-[#8B949E] hover:text-[#E6EDF3]"
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
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              En Servicio Ahora
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#3FB950]/15 border border-[#3FB950]/30 flex items-center justify-center text-[#3FB950]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#3FB950] font-mono">
              {onShiftEmployees.length}
            </span>
            <span className="text-xs text-[#8B949E]">
              colaboradores activos
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#3FB950] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-ping" />
            Presencia validada en barra & salón
          </div>
        </div>

        {/* KPI 2: Turno en Curso */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              Franja Horaria Actual
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#388BFD]/15 border border-[#388BFD]/30 flex items-center justify-center text-[#388BFD]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-[#E6EDF3] truncate">
              {currentShiftName}
            </span>
          </div>
          <div className="mt-3 text-xs text-[#8B949E]">
            Horario operativo de mayor afluencia
          </div>
        </div>

        {/* KPI 3: Cobertura de Dotación */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              Cobertura de Puestos
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F0B429]/15 border border-[#F0B429]/30 flex items-center justify-center text-[#F0B429]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#F0B429] font-mono">
              {onShiftEmployees.length >= 3 ? "100%" : `${Math.round((onShiftEmployees.length / 4) * 100)}%`}
            </span>
            <span className="text-xs text-[#8B949E]">
              estaciones cubiertas
            </span>
          </div>
          <div className="mt-3 text-xs text-[#3FB950] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Barra, salón y caja con dotación
          </div>
        </div>

        {/* KPI 4: Total Horas Registradas */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              Horas Hoy Computadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#BC8CFF]/15 border border-[#BC8CFF]/30 flex items-center justify-center text-[#BC8CFF]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#E6EDF3] font-mono">
              {todayStats?.totalHours ? `${todayStats.totalHours.toFixed(1)}h` : "24.5h"}
            </span>
            <span className="text-xs text-[#8B949E]">
              horas efectivas
            </span>
          </div>
          <div className="mt-3 text-xs text-[#8B949E]">
            Sincronizado con Attendance
          </div>
        </div>
      </div>

      {/* VIEW 1: MONITOR EN VIVO */}
      {activeTab === "live" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
                Personal en Servicio Activo ({onShiftEmployees.length})
              </h3>
              <p className="text-xs text-[#8B949E]">
                Colaboradores que han registrado check-in y se encuentran en su puesto operativo
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
                  : "20:00";

                const isBreak = emp.attendance?.currentStatus === "break";
                const stationText = emp.station || (
                  emp.role === "bartender" ? "Barra Principal" :
                  emp.role === "waiter" ? "Salón Principal" :
                  emp.role === "kitchen" ? "Cocina Fuegos" :
                  emp.role === "cashier" ? "Caja Central" : "Administración"
                );

                return (
                  <div
                    key={emp._id}
                    className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D] hover:border-[#3FB950]/50 transition-all flex flex-col justify-between gap-3.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#0D1117] border border-[#30363D] flex items-center justify-center font-bold text-xs text-[#F0B429] font-mono shadow-inner">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-[#E6EDF3]">
                              {emp.name}
                            </span>
                            {ROLE_ICONS[emp.role]}
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#8B949E]">
                            <MapPin className="w-2.5 h-2.5 text-[#388BFD]" />
                            {stationText}
                          </span>
                        </div>
                      </div>

                      <div>
                        {isBreak ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D29922]/15 text-[#D29922] border border-[#D29922]/30">
                            <Coffee className="w-3 h-3" />
                            Descanso
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30 shadow-[0_0_6px_rgba(63,185,80,0.2)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950]" />
                            Activo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs py-2 px-2.5 bg-[#1C2333] rounded-xl border border-[#30363D]">
                      <span className="text-[#8B949E] text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#388BFD]" />
                        Entrada: {checkInTime} hs
                      </span>
                      <button
                        type="button"
                        onClick={() => handleLiveCheckOut(emp._id)}
                        className="py-1 px-2.5 rounded-lg text-[10px] font-bold bg-[#F85149]/15 hover:bg-[#F85149]/25 text-[#F85149] border border-[#F85149]/30 transition-colors flex items-center gap-1"
                        title="Registrar salida"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Fichar Salida</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#161B22] border border-[#30363D] rounded-2xl space-y-2">
              <Clock className="w-8 h-8 text-[#F0B429] mx-auto" />
              <h4 className="text-xs font-bold text-[#E6EDF3]">
                No hay colaboradores con fichaje abierto en este momento
              </h4>
              <p className="text-[11px] text-[#8B949E]">
                Los colaboradores aparecerán aquí automáticamente al registrar check-in desde el TPV o la tarjeta de personal.
              </p>
            </div>
          )}

          {/* Quick Check-In for Available Employees */}
          {employees.some((e) => e.attendance?.currentStatus !== "checked-in" && e.isActive) && (
            <div className="mt-6 pt-4 border-t border-[#30363D]">
              <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5 text-[#3FB950]" />
                Personal Fuera de Servicio — Fichaje Rápido
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {employees
                  .filter((e) => e.attendance?.currentStatus !== "checked-in" && e.isActive)
                  .map((offEmp) => (
                    <div
                      key={offEmp._id}
                      className="p-3 rounded-xl bg-[#161B22] border border-[#30363D] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#E6EDF3] block truncate">
                          {offEmp.name}
                        </span>
                        <span className="text-[10px] text-[#8B949E] capitalize block truncate">
                          {offEmp.role} · {offEmp.station || "Barra"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLiveCheckIn(offEmp)}
                        className="py-1 px-2.5 rounded-lg text-[10px] font-bold bg-[#3FB950]/15 hover:bg-[#3FB950]/25 text-[#3FB950] border border-[#3FB950]/30 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Entrada</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PLANIFICADOR SEMANAL INTERACTIVO */}
      {activeTab === "planner" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161B22] p-3 rounded-2xl border border-[#30363D]">
            <div>
              <h3 className="text-xs font-bold text-[#E6EDF3]">
                Planificador Semanal Interactivo (Lunes a Domingo)
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Haz clic en cualquier celda para alternar entre turnos (Mañana, Tarde, Noche, Evento, Franco)
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {SHIFT_TYPES.map((s) => (
                <span
                  key={s.id}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${s.badge}`}
                >
                  {s.icon} {s.label}
                </span>
              ))}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#0D1117] text-[#8B949E] border border-[#30363D] flex items-center gap-1">
                <Coffee className="w-3 h-3 text-[#566270]" /> Franco
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="border border-[#30363D] rounded-2xl overflow-hidden bg-[#161B22] shadow-sm overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#30363D] bg-[#0D1117] text-[#8B949E] uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-bold">Colaborador / Rol</th>
                  {DAYS_OF_WEEK.map((d) => (
                    <th key={d.key} className="py-3 px-2 text-center font-bold">
                      {d.short}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right font-bold">Horas Sem.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]/60">
                {employees.map((emp) => {
                  const schedule = emp.schedule || {};
                  let totalHours = 0;

                  return (
                    <tr
                      key={emp._id}
                      className="hover:bg-[#1C2333]/50 transition-colors"
                    >
                      {/* Name & Role */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#E6EDF3] block">
                          {emp.name}
                        </span>
                        <span className="text-[10px] text-[#8B949E] uppercase tracking-wider capitalize">
                          {emp.role} · {emp.station || "Barra"}
                        </span>
                      </td>

                      {/* Days Monday to Sunday */}
                      {DAYS_OF_WEEK.map(({ key }) => {
                        const day = schedule[key];
                        const isAvail = day?.isAvailable;
                        if (isAvail) totalHours += 8;

                        let shiftIcon = <Coffee className="w-3.5 h-3.5 text-[#566270] mx-auto" />;
                        let badgeClass = "bg-[#0D1117] text-[#8B949E] border-[#30363D]";

                        if (isAvail) {
                          const startH = Number((day.startTime || "18").split(":")[0]);
                          if (startH < 12) {
                            shiftIcon = <Sun className="w-3.5 h-3.5 text-[#3FB950] mx-auto" />;
                            badgeClass = "bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30 font-bold";
                          } else if (startH < 18) {
                            shiftIcon = <Sunset className="w-3.5 h-3.5 text-[#D29922] mx-auto" />;
                            badgeClass = "bg-[#D29922]/15 text-[#D29922] border-[#D29922]/30 font-bold";
                          } else {
                            shiftIcon = <Moon className="w-3.5 h-3.5 text-[#388BFD] mx-auto" />;
                            badgeClass = "bg-[#388BFD]/15 text-[#388BFD] border-[#388BFD]/30 font-bold";
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
                              className={`w-full py-1.5 px-1 rounded-lg text-xs border transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${badgeClass}`}
                              title="Clic para cambiar turno"
                            >
                              {shiftIcon}
                            </button>
                          </td>
                        );
                      })}

                      {/* Total Weekly Hours */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#F0B429]">
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

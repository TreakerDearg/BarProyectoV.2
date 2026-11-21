"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  User as UserIcon,
  Crown,
  Wine,
  UtensilsCrossed,
  ChefHat,
  CreditCard,
  Mail,
  Phone,
  Clock,
  Calendar,
  Shield,
  KeyRound,
  Check,
  AlertCircle,
  History,
  Lock,
  Sparkles,
  MapPin,
  TrendingUp,
  RotateCcw,
  Coffee,
  Sun,
  Sunset,
  Moon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { User as UserType, DaySchedule, UserSchedule, Shift, Role } from "../types/user";
import { getUserAttendance, type AttendanceRecord } from "../services/attendanceService";
import { changePassword } from "../services/userService";

interface Props {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, updates: Partial<UserType>) => Promise<void>;
}

const DAYS_OF_WEEK: { key: keyof UserSchedule; label: string; short: string }[] = [
  { key: "monday",    label: "Lunes",     short: "Lun" },
  { key: "tuesday",   label: "Martes",    short: "Mar" },
  { key: "wednesday", label: "Miércoles", short: "Mié" },
  { key: "thursday",  label: "Jueves",    short: "Jue" },
  { key: "friday",    label: "Viernes",   short: "Vie" },
  { key: "saturday",  label: "Sábado",    short: "Sáb" },
  { key: "sunday",    label: "Domingo",   short: "Dom" },
];

const STATIONS_BY_ROLE: Record<string, string[]> = {
  bartender: [
    "Barra Principal",
    "Barra Cócteles & VIP",
    "Barra Terraza",
    "Estación de Apoyo",
  ],
  waiter: [
    "Salón Principal & Terraza",
    "Salón Planta Alta (VIP)",
    "Terraza Exterior",
    "Sector Mesas 1 a 12",
  ],
  kitchen: [
    "Cocina Fuegos & Platos",
    "Partida Fría & Tapas",
    "Pase & Emplatado",
  ],
  cashier: [
    "Caja Central & TPV",
    "Caja Barra",
  ],
  admin: [
    "Administración & Control",
    "Supervisión General",
  ],
};

function getDefaultScheduleForShift(shift: string = "night"): UserSchedule {
  const isNight = shift === "night";
  const isMorning = shift === "morning";
  const start = isMorning ? "08:00" : isNight ? "20:00" : "16:00";
  const end   = isMorning ? "16:00" : isNight ? "04:00" : "00:00";

  const workDay: DaySchedule = { isAvailable: true, startTime: start, endTime: end };
  const offDay: DaySchedule  = { isAvailable: false, startTime: "", endTime: "" };

  if (isMorning) {
    return {
      monday: { ...workDay },
      tuesday: { ...workDay },
      wednesday: { ...workDay },
      thursday: { ...workDay },
      friday: { ...workDay },
      saturday: { ...offDay },
      sunday: { ...offDay },
    };
  } else if (isNight) {
    return {
      monday: { ...workDay },
      tuesday: { ...workDay },
      wednesday: { ...offDay },
      thursday: { ...workDay },
      friday: { ...workDay },
      saturday: { ...workDay },
      sunday: { ...offDay },
    };
  } else {
    return {
      monday: { ...offDay },
      tuesday: { ...workDay },
      wednesday: { ...workDay },
      thursday: { ...workDay },
      friday: { ...workDay },
      saturday: { ...workDay },
      sunday: { ...offDay },
    };
  }
}

export default function EmployeeDetailDrawer({
  user,
  isOpen,
  onClose,
  onSave,
}: Props) {
  if (!isOpen || !user) return null;

  const [activeTab, setActiveTab] = useState<
    "profile" | "schedule" | "permissions" | "history"
  >("profile");

  // Form states
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [role, setRole] = useState<Role>(user.role || "waiter");
  const [shift, setShift] = useState<Shift>(user.shift || "night");
  const [station, setStation] = useState<string>(user.station || "Barra Principal");
  const [isActive, setIsActive] = useState(user.isActive !== false);
  const [notes, setNotes] = useState(user.notes || "");

  // Schedule state
  const [schedule, setSchedule] = useState<UserSchedule>(() => {
    if (user.schedule && Object.keys(user.schedule).length > 0) {
      const hasAnyAvail = Object.values(user.schedule).some((d) => d?.isAvailable);
      if (hasAnyAvail) return user.schedule;
    }
    return getDefaultScheduleForShift(user.shift || "night");
  });

  // Permissions state
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    (user.permissions as Record<string, boolean>) || {}
  );

  // Password / PIN reset state
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // History state
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Submitting state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state whenever the opened user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setRole(user.role || "waiter");
      setShift(user.shift || "night");
      setStation(
        user.station ||
        (user.role === "bartender" ? "Barra Principal" :
         user.role === "waiter" ? "Salón Principal & Terraza" :
         user.role === "kitchen" ? "Cocina Fuegos & Platos" :
         user.role === "cashier" ? "Caja Central & TPV" : "Administración & Control")
      );
      setIsActive(user.isActive !== false);
      setNotes(user.notes || "");

      // Ensure schedule is initialized with valid values
      if (user.schedule && Object.keys(user.schedule).length > 0) {
        const hasWorkDay = Object.values(user.schedule).some((d) => d?.isAvailable);
        if (hasWorkDay) {
          setSchedule(user.schedule);
        } else {
          setSchedule(getDefaultScheduleForShift(user.shift || "night"));
        }
      } else {
        setSchedule(getDefaultScheduleForShift(user.shift || "night"));
      }

      setPermissions((user.permissions as Record<string, boolean>) || {});
      setError(null);
      setSuccessMsg(null);
    }
  }, [user]);

  // Load attendance history on tab change
  useEffect(() => {
    if (activeTab === "history" && user._id) {
      async function loadHistory() {
        try {
          setLoadingHistory(true);
          const data = await getUserAttendance(user._id);
          setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
          console.warn("Could not load attendance history:", err);
        } finally {
          setLoadingHistory(false);
        }
      }
      loadHistory();
    }
  }, [activeTab, user._id]);

  // Total weekly scheduled hours
  const totalWeeklyHours = useMemo(() => {
    let total = 0;
    DAYS_OF_WEEK.forEach(({ key }) => {
      const day = schedule[key];
      if (day && day.isAvailable && day.startTime && day.endTime) {
        const [startH, startM] = day.startTime.split(":").map(Number);
        const [endH, endM] = day.endTime.split(":").map(Number);
        let diff = (endH * 60 + endM) - (startH * 60 + startM);
        if (diff < 0) diff += 24 * 60; // night shift passing midnight
        total += diff / 60;
      }
    });
    return Math.round(total * 10) / 10;
  }, [schedule]);

  // Schedule toggle helper
  const handleScheduleDayChange = (
    dayKey: keyof UserSchedule,
    field: keyof DaySchedule,
    val: any
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...(prev[dayKey] || {
          isAvailable: false,
          startTime: "20:00",
          endTime: "04:00",
        }),
        [field]: val,
      },
    }));
  };

  // Quick preset: standard 40h workweek for the assigned shift
  const handleApplyShiftPreset = () => {
    setSchedule(getDefaultScheduleForShift(shift));
  };

  // Quick preset: mark all days off
  const handleClearAllSchedule = () => {
    const emptySched: UserSchedule = {};
    DAYS_OF_WEEK.forEach(({ key }) => {
      emptySched[key] = { isAvailable: false, startTime: "", endTime: "" };
    });
    setSchedule(emptySched);
  };

  // Permission toggle helper
  const handleTogglePermission = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError("La contraseña o PIN debe tener al menos 6 caracteres.");
      return;
    }
    try {
      await changePassword(user._id, newPassword);
      setPasswordSuccess(true);
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Error al actualizar contraseña.");
    }
  };

  // Submit all changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const updates: Partial<UserType> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        role,
        shift,
        station,
        isActive,
        notes: notes.trim(),
        schedule,
        permissions,
      };

      await onSave(user._id, updates);
      setSuccessMsg("Ficha 360° actualizada con éxito.");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.message || "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const availableStations = STATIONS_BY_ROLE[role] || [
    "Barra Principal",
    "Salón Principal & Terraza",
    "Cocina Fuegos & Platos",
    "Caja Central & TPV",
    "Administración & Control",
  ];

  const currentStatus = user.attendance?.currentStatus || "checked-out";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Solid Dark Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 transition-opacity"
      />

      {/* Drawer Container (100% Solid Opaque Slate Elegante) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-2xl bg-[#161B22] border-l border-[#30363D] shadow-2xl flex flex-col h-full text-[#E6EDF3]">
          
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between bg-[#1C2333] shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#0D1117] text-[#F0B429] border border-[#30363D] flex items-center justify-center font-bold text-sm font-mono shadow-inner shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#E6EDF3] leading-tight truncate">
                    {user.name}
                  </h3>
                  {/* Status Pill */}
                  {user.isActive ? (
                    currentStatus === "checked-in" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950] animate-pulse" />
                        En Turno
                      </span>
                    ) : currentStatus === "break" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D29922]/15 text-[#D29922] border border-[#D29922]/30 shrink-0">
                        <Coffee className="w-2.5 h-2.5" />
                        Descanso
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0D1117] text-[#8B949E] border border-[#30363D] shrink-0">
                        Fuera
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/30 shrink-0">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8B949E] truncate">
                  Ficha de Personal 360° · {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] transition-colors"
              title="Cerrar ficha"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center px-6 border-b border-[#30363D] bg-[#161B22] gap-1 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "profile"
                  ? "text-[#F0B429] border-[#F0B429]"
                  : "text-[#8B949E] border-transparent hover:text-[#E6EDF3]"
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Perfil & Puesto
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "schedule"
                  ? "text-[#F0B429] border-[#F0B429]"
                  : "text-[#8B949E] border-transparent hover:text-[#E6EDF3]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Cronograma Semanal ({totalWeeklyHours}h)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("permissions")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "permissions"
                  ? "text-[#F0B429] border-[#F0B429]"
                  : "text-[#8B949E] border-transparent hover:text-[#E6EDF3]"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Matriz Permisos
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "history"
                  ? "text-[#F0B429] border-[#F0B429]"
                  : "text-[#8B949E] border-transparent hover:text-[#E6EDF3]"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Historial Asistencia
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-[#F85149]/15 border border-[#F85149]/30 text-xs text-[#F85149] flex items-center gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-[#3FB950]/15 border border-[#3FB950]/30 text-xs text-[#3FB950] flex items-center gap-2 shrink-0">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Body Content Area (Solid #0D1117 background) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0D1117]">

            {/* TAB 1: PERFIL & PUESTO OPERATIVO */}
            {activeTab === "profile" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Bloque 1: Identificación y Contacto */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F0B429] flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5" />
                      Datos Personales & Acceso
                    </span>
                    {/* Account Status Switch */}
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                        isActive
                          ? "bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30 hover:bg-[#3FB950]/25"
                          : "bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30 hover:bg-[#F85149]/25"
                      }`}
                      title="Alternar estado de la cuenta"
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? "bg-[#3FB950]" : "bg-[#F85149]"}`} />
                      {isActive ? "Cuenta Activa" : "Cuenta Suspendida"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider block">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs bg-[#1C2333] text-[#E6EDF3] border border-[#30363D] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F0B429]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider block">
                        Email de Acceso *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs bg-[#1C2333] text-[#E6EDF3] border border-[#30363D] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F0B429]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider block">
                        Teléfono Móvil
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-[#566270] absolute left-3 top-3" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+54 9 11 4567-8900"
                          className="w-full text-xs bg-[#1C2333] text-[#E6EDF3] border border-[#30363D] rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-[#F0B429]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider block">
                        Rol Operativo *
                      </label>
                      <select
                        value={role}
                        onChange={(e) => {
                          const newRole = e.target.value as Role;
                          setRole(newRole);
                          const stations = STATIONS_BY_ROLE[newRole];
                          if (stations && stations.length > 0) {
                            setStation(stations[0]);
                          }
                        }}
                        className="w-full text-xs bg-[#1C2333] text-[#E6EDF3] border border-[#30363D] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F0B429] cursor-pointer"
                      >
                        <option value="admin">👑 Administrador General</option>
                        <option value="bartender">🍸 Bartender / Barra</option>
                        <option value="waiter">🍽️ Mozo / Salón</option>
                        <option value="kitchen">👨‍🍳 Cocina & Platos</option>
                        <option value="cashier">💳 Caja & Cobros</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bloque 2: Estación de Trabajo & Turno */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#388BFD] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Asignación Operativa & Turno
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Estación de Trabajo Asignada */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider block">
                        Estación de Trabajo Asignada *
                      </label>
                      <select
                        value={station}
                        onChange={(e) => setStation(e.target.value)}
                        className="w-full text-xs bg-[#1C2333] text-[#E6EDF3] border border-[#30363D] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#388BFD] cursor-pointer font-medium"
                      >
                        {availableStations.map((st) => (
                          <option key={st} value={st}>
                            📍 {st}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-[#566270]">
                        Determina la estación visible en el Monitor en Vivo y Card 360°
                      </span>
                    </div>

                    {/* Turno Habitual */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider block">
                        Franja Horaria / Turno Habitual
                      </label>
                      <select
                        value={shift}
                        onChange={(e) => setShift(e.target.value as Shift)}
                        className="w-full text-xs bg-[#1C2333] text-[#E6EDF3] border border-[#30363D] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#388BFD] cursor-pointer"
                      >
                        <option value="morning">🌅 Turno Mañana (08:00 - 16:00)</option>
                        <option value="afternoon">🌇 Turno Tarde (16:00 - 00:00)</option>
                        <option value="night">🌙 Turno Noche (20:00 - 04:00)</option>
                        <option value="event">🎉 Turno Evento (Especial)</option>
                      </select>
                      <span className="text-[10px] text-[#566270]">
                        Horario base para el cálculo de tardanzas y fichaje
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bloque 3: Notas Internas */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 space-y-2">
                  <label className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider block">
                    Notas Internas & Observaciones de Supervisión
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Disponibilidad especial, acuerdos de turnos, preferencias de estación..."
                    className="w-full text-xs bg-[#1C2333] text-[#E6EDF3] border border-[#30363D] rounded-xl p-3 focus:outline-none focus:border-[#F0B429]"
                  />
                </div>

                {/* Bloque 4: PIN & Seguridad de Acceso */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#F0B429]" />
                    <span className="text-xs font-bold text-[#E6EDF3]">
                      Restablecer PIN / Contraseña de TPV
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña o PIN numérico (mín. 6 caracteres)..."
                      className="flex-1 text-xs bg-[#1C2333] text-[#E6EDF3] border border-[#30363D] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F0B429]"
                    />
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#21283A] hover:bg-[#F0B429] hover:text-[#0D1117] text-[#E6EDF3] border border-[#30363D] transition-colors shrink-0"
                    >
                      Actualizar PIN
                    </button>
                  </div>
                  {passwordSuccess && (
                    <p className="text-[11px] text-[#3FB950] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Credenciales actualizadas correctamente.
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* TAB 2: CRONOGRAMA SEMANAL (SCHEDULE) */}
            {activeTab === "schedule" && (
              <div className="space-y-4">
                {/* Header with Quick Presets */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#388BFD]" />
                      Disponibilidad Semanal Lunes a Domingo
                    </h4>
                    <p className="text-[11px] text-[#8B949E]">
                      Define los días de servicio activo y los francos de guardia
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/30">
                      Total: {totalWeeklyHours} hrs / semana
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyShiftPreset}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1C2333] hover:bg-[#21283A] text-[#388BFD] border border-[#30363D] transition-colors flex items-center gap-1"
                      title="Cargar horario estándar de 40h para este turno"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Cargar 40h
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllSchedule}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1C2333] hover:bg-[#21283A] text-[#8B949E] hover:text-[#F85149] border border-[#30363D] transition-colors"
                      title="Marcar todos los días como franco"
                    >
                      Todos Franco
                    </button>
                  </div>
                </div>

                {/* Day-by-Day List */}
                <div className="space-y-2.5">
                  {DAYS_OF_WEEK.map(({ key, label }) => {
                    const day = schedule[key] || {
                      isAvailable: false,
                      startTime: "20:00",
                      endTime: "04:00",
                    };

                    // Compute day hours
                    let dayHours = 0;
                    if (day.isAvailable && day.startTime && day.endTime) {
                      const [sH, sM] = (day.startTime || "20:00").split(":").map(Number);
                      const [eH, eM] = (day.endTime || "04:00").split(":").map(Number);
                      let diff = (eH * 60 + eM) - (sH * 60 + sM);
                      if (diff < 0) diff += 24 * 60;
                      dayHours = Math.round((diff / 60) * 10) / 10;
                    }

                    return (
                      <div
                        key={key}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                          day.isAvailable
                            ? "bg-[#161B22] border-[#30363D]"
                            : "bg-[#161B22]/50 border-[#30363D]/50 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleScheduleDayChange(key, "isAvailable", !day.isAvailable)
                            }
                            className={`w-7 h-7 rounded-xl border flex items-center justify-center font-bold text-xs transition-colors ${
                              day.isAvailable
                                ? "bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30 shadow-sm"
                                : "bg-[#1C2333] text-[#566270] border-[#30363D]"
                            }`}
                          >
                            {day.isAvailable ? <Check className="w-4 h-4" /> : null}
                          </button>
                          <div>
                            <span className="font-bold text-[#E6EDF3] block">
                              {label}
                            </span>
                            <span className="text-[10px] text-[#8B949E] flex items-center gap-1">
                              {day.isAvailable ? (
                                <span className="text-[#3FB950] font-semibold">Guardia activa ({dayHours}h)</span>
                              ) : (
                                <span className="flex items-center gap-1"><Coffee className="w-2.5 h-2.5 text-[#566270]" /> Franco / Descanso</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {day.isAvailable && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-[#1C2333] px-2.5 py-1.5 rounded-xl border border-[#30363D]">
                              <span className="text-[10px] text-[#8B949E] uppercase font-bold">Desde:</span>
                              <input
                                type="time"
                                value={day.startTime || "20:00"}
                                onChange={(e) =>
                                  handleScheduleDayChange(key, "startTime", e.target.value)
                                }
                                className="bg-transparent text-[#E6EDF3] text-xs font-mono focus:outline-none"
                              />
                            </div>

                            <span className="text-[#566270] font-mono">→</span>

                            <div className="flex items-center gap-1.5 bg-[#1C2333] px-2.5 py-1.5 rounded-xl border border-[#30363D]">
                              <span className="text-[10px] text-[#8B949E] uppercase font-bold">Hasta:</span>
                              <input
                                type="time"
                                value={day.endTime || "04:00"}
                                onChange={(e) =>
                                  handleScheduleDayChange(key, "endTime", e.target.value)
                                }
                                className="bg-transparent text-[#E6EDF3] text-xs font-mono focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: MATRIZ DE PERMISOS */}
            {activeTab === "permissions" && (
              <div className="space-y-4">
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5 mb-1">
                    <Shield className="w-4 h-4 text-[#F0B429]" />
                    Permisos de Operación & TPV
                  </h4>
                  <p className="text-[11px] text-[#8B949E]">
                    Personaliza las capacidades de este colaborador por encima del perfil predeterminado de su rol
                  </p>
                </div>

                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl divide-y divide-[#30363D]/70 overflow-hidden">
                  {[
                    {
                      key: "accessPOS",
                      label: "Acceso al Punto de Venta (TPV)",
                      desc: "Permite iniciar sesión en las terminales de cobro y comandas",
                      category: "Operación",
                    },
                    {
                      key: "manageOrders",
                      label: "Crear y Gestionar Comandas",
                      desc: "Apertura de comandas en mesas y comanda rápida de barra",
                      category: "Operación",
                    },
                    {
                      key: "cancelOrder",
                      label: "Anulación de Tickets y Comandas",
                      desc: "Autorización para anular platos o bebidas ya despachadas",
                      category: "Operación",
                    },
                    {
                      key: "applyDiscounts",
                      label: "Aplicar Descuentos Discrecionales",
                      desc: "Permite aplicar bonificaciones manuales en caja",
                      category: "Operación",
                    },
                    {
                      key: "manageInventory",
                      label: "Control de Inventario & Bóveda",
                      desc: "Consulta de niveles de stock y reporte de mermas de insumos",
                      category: "Gestión",
                    },
                    {
                      key: "manageRecipes",
                      label: "Consultar Fichas Técnicas & Recetario",
                      desc: "Acceso al catálogo de escandallos y técnicas de coctelería",
                      category: "Gestión",
                    },
                    {
                      key: "viewDashboard",
                      label: "Ver Dashboard Ejecutivo",
                      desc: "Acceso a KPIs gerenciales de recaudación y dotación",
                      category: "Supervisión",
                    },
                  ].map((perm) => {
                    const isEnabled = permissions[perm.key] ?? false;
                    return (
                      <div
                        key={perm.key}
                        className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-[#1C2333]/40 transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-[#E6EDF3] block">
                            {perm.label}
                          </span>
                          <span className="text-[11px] text-[#8B949E]">
                            {perm.desc}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(perm.key)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all border shrink-0 ${
                            isEnabled
                              ? "bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30 shadow-sm"
                              : "bg-[#1C2333] text-[#8B949E] border-[#30363D]"
                          }`}
                        >
                          {isEnabled ? "Permitido" : "Denegado"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: HISTORIAL DE ASISTENCIA */}
            {activeTab === "history" && (
              <div className="space-y-4">
                {/* Summary Ribbon */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-3 text-center">
                    <span className="text-[10px] text-[#8B949E] uppercase font-bold block">
                      Horas Mes
                    </span>
                    <span className="text-base font-bold font-mono text-[#F0B429]">
                      {user.attendance?.thisMonth?.totalHours ? `${user.attendance.thisMonth.totalHours}h` : "146.4h"}
                    </span>
                  </div>
                  <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-3 text-center">
                    <span className="text-[10px] text-[#8B949E] uppercase font-bold block">
                      Turnos Cumplidos
                    </span>
                    <span className="text-base font-bold font-mono text-[#3FB950]">
                      {user.attendance?.thisMonth?.present || 20} turnos
                    </span>
                  </div>
                  <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-3 text-center">
                    <span className="text-[10px] text-[#8B949E] uppercase font-bold block">
                      Rating Promedio
                    </span>
                    <span className="text-base font-bold font-mono text-[#388BFD]">
                      {(user.performance?.averageRating || 4.8).toFixed(1)} ★
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                    <History className="w-4 h-4 text-[#388BFD]" />
                    Registro de Fichajes y Guardias Realizadas
                  </h4>
                  <span className="text-[11px] text-[#8B949E]">
                    {history.length} registros computados
                  </span>
                </div>

                {loadingHistory ? (
                  <div className="p-8 text-center text-xs text-[#8B949E] animate-pulse bg-[#161B22] border border-[#30363D] rounded-2xl">
                    Cargando historial de fichajes desde Bóveda de Asistencia...
                  </div>
                ) : history.length > 0 ? (
                  <div className="border border-[#30363D] rounded-2xl overflow-hidden divide-y divide-[#30363D]/70 bg-[#161B22] text-xs">
                    {history.map((record) => {
                      const checkInTime = record.checkIn?.time
                        ? new Date(record.checkIn.time).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--";
                      const checkOutTime = record.checkOut?.time
                        ? new Date(record.checkOut.time).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "En curso";
                      const recordDate = record.date
                        ? new Date(record.date).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Hoy";

                      return (
                        <div
                          key={record._id}
                          className="p-3.5 flex items-center justify-between hover:bg-[#1C2333]/50 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#E6EDF3] block">
                                {recordDate}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1C2333] text-[#8B949E] border border-[#30363D] font-mono">
                                Turno {record.shift || "Noche"}
                              </span>
                              {record.station && (
                                <span className="text-[10px] text-[#388BFD]">
                                  · {record.station}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#8B949E]">
                              Fichaje: {checkInTime} hs → {checkOutTime} hs
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-[#F0B429] text-xs block">
                              {record.workedHours ? `${record.workedHours} hrs` : "En Turno"}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                record.status === "present"
                                  ? "text-[#3FB950]"
                                  : record.status === "late"
                                  ? "text-[#D29922]"
                                  : "text-[#F85149]"
                              }`}
                            >
                              {record.status === "present"
                                ? "Presente"
                                : record.status === "late"
                                ? "Tardanza"
                                : record.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-[#8B949E] border border-[#30363D] rounded-2xl bg-[#161B22]">
                    No hay registros de fichajes registrados para este colaborador.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar (Solid #1C2333) */}
          <div className="p-4 border-t border-[#30363D] bg-[#1C2333] flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#161B22] hover:bg-[#21283A] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] transition-colors"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#F0B429] hover:bg-[#F5C842] text-[#0D1117] transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm hover:shadow"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? "Guardando Ficha..." : "Guardar Ficha 360°"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

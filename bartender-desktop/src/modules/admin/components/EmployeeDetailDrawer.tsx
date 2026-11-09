"use client";

import { useState, useEffect, useMemo } from "react";
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
  DollarSign,
  Check,
  AlertCircle,
  History,
  Lock,
  Sparkles,
} from "lucide-react";
import type { User as UserType, DaySchedule, UserSchedule } from "../types/user";
import { getUserAttendance, type AttendanceRecord } from "../services/attendanceService";
import { changePassword } from "../services/userService";

interface Props {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, updates: Partial<UserType>) => Promise<void>;
}

const DAYS_OF_WEEK: { key: keyof UserSchedule; label: string }[] = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

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
  const [role, setRole] = useState(user.role || "waiter");
  const [shift, setShift] = useState(user.shift || "night");
  const [isActive, setIsActive] = useState(user.isActive !== false);
  const [hourlyRate, setHourlyRate] = useState<number>(user.hourlyRate || 0);
  const [notes, setNotes] = useState(user.notes || "");

  // Schedule state
  const [schedule, setSchedule] = useState<UserSchedule>(() => {
    const defaultDay: DaySchedule = {
      isAvailable: false,
      startTime: "18:00",
      endTime: "02:00",
      breakStart: "",
      breakEnd: "",
    };
    return (
      user.schedule || {
        monday: { ...defaultDay },
        tuesday: { ...defaultDay },
        wednesday: { ...defaultDay, isAvailable: true },
        thursday: { ...defaultDay, isAvailable: true },
        friday: { ...defaultDay, isAvailable: true },
        saturday: { ...defaultDay, isAvailable: true },
        sunday: { ...defaultDay },
      }
    );
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

  // Load attendance history on tab change
  useEffect(() => {
    if (activeTab === "history" && user._id) {
      async function loadHistory() {
        try {
          setLoadingHistory(true);
          const data = await getUserAttendance(user._id);
          setHistory(data);
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
          startTime: "18:00",
          endTime: "02:00",
        }),
        [field]: val,
      },
    }));
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
        role: role as any,
        shift: shift as any,
        isActive,
        hourlyRate: Number(hourlyRate) || 0,
        notes: notes.trim(),
        schedule,
        permissions,
      };

      await onSave(user._id, updates);
      setSuccessMsg("Ficha 360° actualizada con éxito.");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err?.message || "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-surface-card border-l border-border/70 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-surface-dark/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold border border-gold/30 flex items-center justify-center font-bold text-sm font-mono">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary leading-tight">
                  {user.name}
                </h3>
                <p className="text-xs text-text-muted">
                  Ficha de Personal 360° · {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center px-6 border-b border-border/50 bg-surface-dark/40 gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "profile"
                  ? "text-gold border-gold"
                  : "text-text-muted border-transparent hover:text-text-primary"
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Perfil & Contacto
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "schedule"
                  ? "text-gold border-gold"
                  : "text-text-muted border-transparent hover:text-text-primary"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Cronograma Semanal ({totalWeeklyHours}h)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("permissions")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "permissions"
                  ? "text-gold border-gold"
                  : "text-text-muted border-transparent hover:text-text-primary"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Matriz Permisos
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "text-gold border-gold"
                  : "text-text-muted border-transparent hover:text-text-primary"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Historial Asistencia
            </button>
          </div>

          {/* Alerts / Error messages */}
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-red/10 border border-red/30 text-xs text-red flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald/10 border border-emerald/30 text-xs text-emerald flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: PERFIL & CONTACTO */}
            {activeTab === "profile" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                      Email de Acceso *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+54 9 11 ..."
                      className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                      Rol Asignado *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold/50 cursor-pointer"
                    >
                      <option value="admin">Administrador General</option>
                      <option value="bartender">Bartender / Barra</option>
                      <option value="waiter">Mozo / Salón</option>
                      <option value="kitchen">Cocina</option>
                      <option value="cashier">Caja & Cobros</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                      Turno Habitual
                    </label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value as any)}
                      className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold/50 cursor-pointer"
                    >
                      <option value="morning">Turno Mañana (08:00 - 16:00)</option>
                      <option value="afternoon">Turno Tarde (16:00 - 00:00)</option>
                      <option value="night">Turno Noche (20:00 - 04:00)</option>
                      <option value="event">Turno Evento (Especial)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                      Tarifa Horaria ($/h)
                    </label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      placeholder="0"
                      className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>

                {/* Estado Activo Switch */}
                <div className="p-3 bg-surface-dark/50 rounded-xl border border-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">
                      Estado Operativo de la Cuenta
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Determina si el usuario puede iniciar sesión y registrar fichajes
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      isActive
                        ? "bg-emerald/15 text-emerald border-emerald/30"
                        : "bg-red/15 text-red border-red/30"
                    }`}
                  >
                    {isActive ? "Activo" : "Inactivo"}
                  </button>
                </div>

                {/* Notas Administrativas */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                    Notas Internas
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones de contratación, disponibilidad, preferencias..."
                    className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl p-3 focus:outline-none focus:border-gold/50"
                  />
                </div>

                {/* Reset Password / PIN Box */}
                <div className="p-4 bg-surface-dark/60 rounded-xl border border-border/60 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-gold" />
                    <span className="text-xs font-bold text-text-primary">
                      Actualizar PIN / Contraseña de Acceso
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña o PIN (mínimo 6 caracteres)..."
                      className="flex-1 text-xs bg-surface-card text-text-primary border border-border/60 rounded-xl px-3.5 py-2 focus:outline-none focus:border-gold/50"
                    />
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-card hover:bg-gold hover:text-surface-dark text-text-primary border border-border/60 transition-colors"
                    >
                      Actualizar
                    </button>
                  </div>
                  {passwordSuccess && (
                    <p className="text-[11px] text-emerald flex items-center gap-1">
                      <Check className="w-3 h-3" /> Contraseña actualizada correctamente.
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* TAB 2: CRONOGRAMA SEMANAL (SCHEDULE) */}
            {activeTab === "schedule" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">
                      Disponibilidad Semanal Lunes a Domingo
                    </h4>
                    <p className="text-[11px] text-text-muted">
                      Configura los días laborales, horarios de entrada y descansos
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-gold/15 text-gold border border-gold/30">
                    Total: {totalWeeklyHours} hrs / semana
                  </span>
                </div>

                <div className="space-y-2.5">
                  {DAYS_OF_WEEK.map(({ key, label }) => {
                    const day = schedule[key] || {
                      isAvailable: false,
                      startTime: "18:00",
                      endTime: "02:00",
                    };
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                          day.isAvailable
                            ? "bg-surface-dark/70 border-border/60"
                            : "bg-surface-dark/30 border-border/30 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleScheduleDayChange(key, "isAvailable", !day.isAvailable)
                            }
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-xs transition-colors ${
                              day.isAvailable
                                ? "bg-emerald/20 text-emerald border-emerald/40"
                                : "bg-surface-card text-text-muted border-border/50"
                            }`}
                          >
                            {day.isAvailable ? <Check className="w-3.5 h-3.5" /> : null}
                          </button>
                          <div>
                            <span className="font-bold text-text-primary block">
                              {label}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {day.isAvailable ? "Laboral" : "Franco / Descanso"}
                            </span>
                          </div>
                        </div>

                        {day.isAvailable && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-surface-card px-2 py-1 rounded-lg border border-border/50">
                              <span className="text-[10px] text-text-muted">De:</span>
                              <input
                                type="time"
                                value={day.startTime || "18:00"}
                                onChange={(e) =>
                                  handleScheduleDayChange(key, "startTime", e.target.value)
                                }
                                className="bg-transparent text-text-primary text-xs font-mono focus:outline-none"
                              />
                            </div>

                            <span className="text-text-muted font-mono">→</span>

                            <div className="flex items-center gap-1 bg-surface-card px-2 py-1 rounded-lg border border-border/50">
                              <span className="text-[10px] text-text-muted">A:</span>
                              <input
                                type="time"
                                value={day.endTime || "02:00"}
                                onChange={(e) =>
                                  handleScheduleDayChange(key, "endTime", e.target.value)
                                }
                                className="bg-transparent text-text-primary text-xs font-mono focus:outline-none"
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
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-gold" />
                    Permisos de Acceso & Operaciones
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    Los permisos configurados aquí anulan los permisos predeterminados del rol
                  </p>
                </div>

                <div className="space-y-2 divide-y divide-border/40">
                  {[
                    {
                      key: "viewDashboard",
                      label: "Ver Dashboard Ejecutivo",
                      desc: "Acceso a métricas de ventas y reportes financieros generales",
                    },
                    {
                      key: "manageOrders",
                      label: "Crear y Gestionar Comandas",
                      desc: "Apertura de comandas en mesas y comanda rápida de barra",
                    },
                    {
                      key: "manageInventory",
                      label: "Control de Inventario & Bóveda",
                      desc: "Consulta de stock, registro de mermas y auditoría de insumos",
                    },
                    {
                      key: "manageRecipes",
                      label: "Fichas Técnicas & Recetario",
                      desc: "Visualización de escandallos y edición de técnicas de elaboración",
                    },
                    {
                      key: "accessPOS",
                      label: "Acceso a Punto de Venta (TPV)",
                      desc: "Cobro de tickets, facturación y cierre de mesas",
                    },
                    {
                      key: "cancelOrder",
                      label: "Anulación de Tickets y Comandas",
                      desc: "Permite anular pedidos ya enviados a cocina o barra",
                    },
                    {
                      key: "applyDiscounts",
                      label: "Aplicación de Descuentos Discrecionales",
                      desc: "Aplicar descuentos manuales fuera de promociones activas",
                    },
                  ].map((perm) => {
                    const isEnabled = permissions[perm.key] ?? false;
                    return (
                      <div
                        key={perm.key}
                        className="pt-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-text-primary block">
                            {perm.label}
                          </span>
                          <span className="text-[11px] text-text-muted">
                            {perm.desc}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(perm.key)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                            isEnabled
                              ? "bg-gold/15 text-gold border-gold/40"
                              : "bg-surface-dark text-text-muted border-border/50"
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <History className="w-4 h-4 text-cyan" />
                    Registro de Fichajes Recientes
                  </h4>
                  <span className="text-[11px] text-text-muted">
                    {history.length} registros
                  </span>
                </div>

                {loadingHistory ? (
                  <div className="p-8 text-center text-xs text-text-muted animate-pulse">
                    Cargando historial de asistencia...
                  </div>
                ) : history.length > 0 ? (
                  <div className="border border-border/60 rounded-xl overflow-hidden divide-y divide-border/40 bg-surface-dark/40 text-xs">
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
                        : "En turno";
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
                          className="p-3 flex items-center justify-between hover:bg-surface-card/40 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold text-text-primary block">
                              {recordDate} · Turno {record.shift || "Noche"}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              Fichaje: {checkInTime} hs → {checkOutTime} hs
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-gold text-xs block">
                              {record.workedHours ? `${record.workedHours} hrs` : "Activo"}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                record.status === "present"
                                  ? "text-emerald"
                                  : record.status === "late"
                                  ? "text-amber"
                                  : "text-red"
                              }`}
                            >
                              {record.status === "present"
                                ? "Presente"
                                : record.status === "late"
                                ? "Tarde"
                                : record.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border/60 rounded-xl bg-surface-dark/30">
                    No hay registros de fichajes en el sistema para este colaborador.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-border/60 bg-surface-dark/70 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-surface-card hover:bg-surface-hover text-text-primary border border-border/60 transition-colors"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-gold hover:bg-gold-hover text-surface-dark transition-colors disabled:opacity-50 flex items-center gap-1.5"
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


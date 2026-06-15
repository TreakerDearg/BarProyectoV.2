import { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  Users, 
  Loader2,
  Trash2,
  Edit,
  CheckCircle,
  Sparkles,
  Sun,
  Moon,
  Star,
  UserPlus,
  X
} from "lucide-react";
import {
  getShiftSchedules,
  createShiftSchedule,
  updateShiftSchedule,
  deleteShiftSchedule,
  getShiftAssignments,
  assignEmployeeToShift,
  generateShiftAssignments,
  type ShiftSchedule,
  type ShiftAssignment
} from "../services/trackingService";
import { getEmployees } from "../services/userService";
import AdminTutorialModal from "../components/AdminTutorialModal";
import "../../../styles/nebula-obsidian-theme.css";

const todayISO = () => new Date().toISOString().split("T")[0];
const addDaysISO = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

export default function ShiftManagementPage() {
  const [shifts, setShifts] = useState<ShiftSchedule[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftSchedule | null>(null);
  const [templateAssignShift, setTemplateAssignShift] = useState<ShiftSchedule | null>(null);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<{
    created: number;
    updated: number;
    skipped: number;
  } | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    userId: "",
    shiftId: "",
    date: todayISO()
  });
  const [generationData, setGenerationData] = useState({
    shiftId: "",
    startDate: todayISO(),
    endDate: addDaysISO(6),
    employeeIds: [] as string[],
    overwrite: false,
    applyToProfiles: true
  });
  
  // Form state
  const [formData, setFormData] = useState({
    shiftType: "morning" as "morning" | "afternoon" | "night" | "event",
    startTime: "",
    endTime: "",
    maxEmployees: 5,
    minEmployees: 2,
    modules: [] as string[],
    priority: 1,
    description: ""
  });
  const tutorialSteps = [
    {
      title: "1. Crear turno base",
      description: "Usa Nuevo Turno para definir horario, cupos y modulos habilitados por turno.",
      highlight: "Configura primero manana, tarde y noche antes de asignar personal."
    },
    {
      title: "2. Asignar empleados",
      description: "En Asignacion Manual selecciona empleado, turno y fecha para registrar cobertura diaria.",
      highlight: "Evita doble asignacion en un mismo horario para el mismo empleado."
    },
    {
      title: "3. Generar turnos masivos",
      description: "La generacion automatica crea o actualiza asignaciones por rango de fechas.",
      highlight: "Activa sobrescribir solo cuando necesites reemplazar la planificacion ya creada."
    }
  ];

  const shiftTypes = [
    { key: "morning" as const, label: "Mañana", color: "#00ff88", icon: <Sun size={20} />, gradient: "from-[#00ff88] to-[#00d4ff]" },
    { key: "afternoon" as const, label: "Tarde", color: "#d4af37", icon: <Sun size={20} />, gradient: "from-[#d4af37] to-[#f4e4a6]" },
    { key: "night" as const, label: "Noche", color: "#b147ff", icon: <Moon size={20} />, gradient: "from-[#b147ff] to-[#ff47ab]" },
    { key: "event" as const, label: "Evento", color: "#00d4ff", icon: <Star size={20} />, gradient: "from-[#00d4ff] to-[#b147ff]" }
  ];

  const availableModules = [
    "orders", "cashier", "inventory", "roulette", "employees", "menus", "tables", "reservations", "discounts"
  ];

  const moduleLabels: Record<string, string> = {
    orders: "Pedidos",
    cashier: "Caja",
    inventory: "Inventario",
    roulette: "Ruleta",
    employees: "Empleados",
    menus: "Menús",
    tables: "Mesas",
    reservations: "Reservas",
    discounts: "Descuentos"
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftsData, assignmentsData, employeesData] = await Promise.all([
        getShiftSchedules(),
        getShiftAssignments(),
        getEmployees()
      ]);
      
      setShifts(shiftsData);
      setAssignments(assignmentsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching shift data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingShift) {
        await updateShiftSchedule(editingShift._id, formData);
      } else {
        await createShiftSchedule(formData);
      }
      
      setShowModal(false);
      setEditingShift(null);
      setFormData({
        shiftType: "morning",
        startTime: "",
        endTime: "",
        maxEmployees: 5,
        minEmployees: 2,
        modules: [],
        priority: 1,
        description: ""
      });
      
      await fetchData();
    } catch (error) {
      console.error("Error saving shift:", error);
      alert("Error al guardar el turno");
    } finally {
      setSaving(false);
    }
  };

  // Handle edit
  const handleEdit = (shift: ShiftSchedule) => {
    setEditingShift(shift);
    setFormData({
      shiftType: shift.shiftType,
      startTime: shift.startTime,
      endTime: shift.endTime,
      maxEmployees: shift.maxEmployees,
      minEmployees: shift.minEmployees,
      modules: shift.modules,
      priority: shift.priority,
      description: shift.description || ""
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este turno?")) return;
    
    try {
      await deleteShiftSchedule(id);
      await fetchData();
    } catch (error) {
      console.error("Error deleting shift:", error);
      alert("Error al eliminar el turno");
    }
  };

  // Handle module toggle
  const toggleModule = (module: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter(m => m !== module)
        : [...prev.modules, module]
    }));
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignmentData.userId || !assignmentData.shiftId || !assignmentData.date) {
      alert("Selecciona empleado, turno y fecha");
      return;
    }

    setAssigning(true);
    try {
      await assignEmployeeToShift(assignmentData);
      setAssignmentData(prev => ({ ...prev, userId: "" }));
      await fetchData();
    } catch (error) {
      console.error("Error assigning employee:", error);
      alert("No se pudo asignar el empleado al turno");
    } finally {
      setAssigning(false);
    }
  };

  const toggleGenerationEmployee = (userId: string) => {
    setGenerationData(prev => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(userId)
        ? prev.employeeIds.filter(id => id !== userId)
        : [...prev.employeeIds, userId]
    }));
  };

  const handleGenerateAssignments = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!generationData.startDate || !generationData.endDate) {
      alert("Selecciona fecha de inicio y fecha final");
      return;
    }

    setGenerating(true);
    setGenerationResult(null);
    try {
      const result = await generateShiftAssignments({
        startDate: generationData.startDate,
        endDate: generationData.endDate,
        shiftId: generationData.shiftId || undefined,
        employeeIds: generationData.employeeIds,
        overwrite: generationData.overwrite,
        applyToProfiles: generationData.applyToProfiles
      });

      setGenerationResult({
        created: result.created,
        updated: result.updated,
        skipped: result.skipped
      });
      await fetchData();
    } catch (error) {
      console.error("Error generating assignments:", error);
      alert("No se pudo generar la agenda de turnos");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTemplateAssignment = async (shift: ShiftSchedule, userId: string) => {
    try {
      const currentIds = (shift.assignedEmployees || []).map((e: any) => 
        typeof e === "string" ? e : e._id
      );

      const isAssigned = currentIds.includes(userId);
      let updatedIds: string[];

      if (isAssigned) {
        updatedIds = currentIds.filter(id => id !== userId);
      } else {
        updatedIds = [...currentIds, userId];
      }

      const updatedShift = await updateShiftSchedule(shift._id, {
        assignedEmployees: updatedIds
      });

      // Synchronize states
      setShifts(prevShifts => 
        prevShifts.map(s => s._id === shift._id ? { ...s, assignedEmployees: updatedShift.assignedEmployees || [] } : s)
      );
      setTemplateAssignShift(prev => 
        prev && prev._id === shift._id ? { ...prev, assignedEmployees: updatedShift.assignedEmployees || [] } : prev
      );

      await fetchData();
    } catch (error) {
      console.error("Error toggling template employee:", error);
      alert("Error al actualizar la plantilla del turno");
    }
  };

  // Get assignments count for shift
  const getAssignmentShiftId = (assignment: ShiftAssignment) => {
    return typeof assignment.shiftId === "string"
      ? assignment.shiftId
      : (assignment.shiftId as any)?._id;
  };

  const getAssignmentsCount = (shiftId: string) => {
    return assignments.filter(a => getAssignmentShiftId(a) === shiftId).length;
  };

  return (
    <div className="min-h-screen fused-bg p-4 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="fused-aurora" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 fused-animate-fade-in-up">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-fused-text-primary tracking-tight" style={{ fontFamily: 'var(--fused-font-display)' }}>
              Gestión de Turnos
            </h1>
            <p className="text-sm text-fused-text-secondary font-medium mt-1">
              Administración de horarios y asignaciones
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AdminTutorialModal
              title="Gestion de turnos"
              subtitle="Guia rapida para crear horarios, asignar equipo y generar turnos por rango."
              steps={tutorialSteps}
            />
            <button
              onClick={() => {
                setEditingShift(null);
                setFormData({
                  shiftType: "morning",
                  startTime: "",
                  endTime: "",
                  maxEmployees: 5,
                  minEmployees: 2,
                  modules: [],
                  priority: 1,
                  description: ""
                });
                setShowModal(true);
              }}
              className="fused-btn-primary flex items-center gap-2 h-10 px-5"
            >
              <Plus size={18} />
              <span className="text-sm font-semibold">Nuevo Turno</span>
            </button>
          </div>
        </div>

        {/* ================= SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fused-animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <SummaryCard
            label="Total Turnos"
            value={shifts.length}
            icon={<Calendar size={32} className="text-[#00E5FF]" />}
            color="#00E5FF"
          />
          <SummaryCard
            label="Asignaciones"
            value={assignments.length}
            icon={<Users size={32} className="text-[#9D4EDD]" />}
            color="#9D4EDD"
          />
          <SummaryCard
            label="Empleados"
            value={employees.length}
            icon={<Users size={32} className="text-[#00FF95]" />}
            color="#00FF95"
          />
          <SummaryCard
            label="Activos"
            value={shifts.filter(s => s.isActive).length}
            icon={<CheckCircle size={32} className="text-[#FFD166]" />}
            color="#FFD166"
          />
        </div>

        {/* ================= SHIFTS GRID ================= */}
        <div className="fused-animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-fused-text-primary">Turnos Configurados</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full p-8 text-center">
                <Loader2 size={32} className="text-fused-text-muted mx-auto animate-spin" />
                <p className="text-fused-text-muted text-sm mt-2">Cargando turnos...</p>
              </div>
            ) : shifts.length === 0 ? (
              <div className="col-span-full p-8 text-center rounded-xl border border-fused-glass-border bg-fused-bg-card">
                <Calendar size={32} className="text-fused-text-tertiary mx-auto mb-2" />
                <p className="text-fused-text-tertiary text-sm">No hay turnos configurados</p>
              </div>
            ) : (
              shifts.map((shift) => {
                const config = shiftTypes.find(s => s.key === shift.shiftType) || shiftTypes[0];
                const assignmentsCount = getAssignmentsCount(shift._id);

                return (
                  <div
                    key={shift._id}
                    className={`fused-nebula-panel p-5 transition-all duration-300 hover:-translate-y-1 ${shift.isActive ? 'opacity-100' : 'opacity-50'}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg" style={{ background: `${config.color}15`, border: `1px solid ${config.color}30` }}>
                          {config.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-fused-text-primary">
                            {config.label}
                          </h3>
                          <p className="text-xs text-fused-text-secondary font-medium">
                            {shift.startTime} - {shift.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(shift)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-fused-text-muted hover:text-fused-text-primary transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(shift._id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-fused-text-muted hover:text-red-400 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-fused-bg-tertiary rounded-lg p-3 border border-fused-glass-border">
                        <div className="text-[10px] text-fused-text-tertiary font-semibold uppercase tracking-wider mb-1">
                          Personal
                        </div>
                        <div className="text-lg font-bold text-fused-text-primary">
                          {assignmentsCount} <span className="text-fused-text-tertiary text-sm">/ {shift.maxEmployees}</span>
                        </div>
                      </div>

                      <div className="bg-fused-bg-tertiary rounded-lg p-3 border border-fused-glass-border">
                        <div className="text-[10px] text-fused-text-tertiary font-semibold uppercase tracking-wider mb-1">
                          Mínimo
                        </div>
                        <div className="text-lg font-bold text-fused-text-primary">
                          {shift.minEmployees}
                        </div>
                      </div>

                      <div className="bg-fused-bg-tertiary rounded-lg p-3 border border-fused-glass-border">
                        <div className="text-[10px] text-fused-text-tertiary font-semibold uppercase tracking-wider mb-1">
                          Prioridad
                        </div>
                        <div className="text-lg font-bold text-fused-text-primary">
                          {shift.priority}
                        </div>
                      </div>
                    </div>

                    {/* Modules */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {shift.modules.map((module: string) => (
                        <span
                          key={module}
                          className="px-2 py-1 rounded-md bg-white/[0.03] text-white/50 text-[10px] font-semibold uppercase tracking-wider border border-white/5"
                        >
                          {moduleLabels[module] || module}
                        </span>
                      ))}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <div className={`w-2 h-2 rounded-full ${shift.isActive ? "bg-[#00FF95]" : "bg-[#FF4D6D]"}`} />
                      <span className={`text-xs font-semibold uppercase tracking-wider ${shift.isActive ? "text-[#00FF95]" : "text-[#FF4D6D]"}`}>
                        {shift.isActive ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= SECOND ROW: ASSIGNMENT + GENERATOR ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          
          {/* Asignación Express (40%) */}
          <form
            onSubmit={handleAssignmentSubmit}
            className="lg:col-span-2 p-5 rounded-xl transition-all"
            style={{
              background: 'rgba(18, 18, 25, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                <UserPlus size={18} className="text-[#00E5FF]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Asignación Express</h3>
                <p className="text-xs text-white/50">Asignar personal rápido</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-1.5 block">
                  Operador
                </label>
                <select
                  value={assignmentData.userId}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px'
                  }}
                >
                  <option value="">Seleccionar operador</option>
                  {employees.filter(emp => emp.isActive).map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} · {emp.role.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-1.5 block">
                    Turno
                  </label>
                  <select
                    value={assignmentData.shiftId}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, shiftId: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all appearance-none cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px'
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {shifts.filter(shift => shift.isActive).map(shift => {
                      const config = shiftTypes.find(s => s.key === shift.shiftType);
                      return (
                        <option key={shift._id} value={shift._id}>
                          {config?.label || shift.shiftType}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-1.5 block">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={assignmentData.date}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all [color-scheme:dark]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={assigning || shifts.length === 0 || employees.length === 0}
                className="w-full h-10 rounded-xl bg-[#00E5FF] text-black font-semibold hover:bg-[#00E5FF]/90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Procesar"}
              </button>
            </div>
          </form>

          {/* Generador de Agenda (60%) */}
          <form
            onSubmit={handleGenerateAssignments}
            className="lg:col-span-3 p-5 rounded-xl transition-all"
            style={{
              background: 'rgba(18, 18, 25, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(157, 78, 221, 0.15)', border: '1px solid rgba(157, 78, 221, 0.3)' }}>
                <Sparkles size={18} className="text-[#9D4EDD]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Generador de Agenda</h3>
                <p className="text-xs text-white/50">Aplicar turnos por rango</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-1.5 block">
                  Turno base
                </label>
                <select
                  value={generationData.shiftId}
                  onChange={(e) => setGenerationData(prev => ({ ...prev, shiftId: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px'
                  }}
                >
                  <option value="">Todos los turnos activos</option>
                  {shifts.filter(shift => shift.isActive).map(shift => {
                    const config = shiftTypes.find(s => s.key === shift.shiftType);
                    return (
                      <option key={shift._id} value={shift._id}>
                        {config?.label || shift.shiftType}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-1.5 block">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={generationData.startDate}
                    onChange={(e) => setGenerationData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all [color-scheme:dark]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px'
                    }}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-1.5 block">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={generationData.endDate}
                    onChange={(e) => setGenerationData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all [color-scheme:dark]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                    Empleados a aplicar
                  </p>
                  <button
                    type="button"
                    onClick={() => setGenerationData(prev => ({
                      ...prev,
                      employeeIds: prev.employeeIds.length
                        ? []
                        : employees.filter(emp => emp.isActive).map(emp => emp._id)
                    }))}
                    className="text-[10px] text-[#9D4EDD] font-semibold uppercase tracking-wider hover:text-white transition-colors"
                  >
                    {generationData.employeeIds.length ? "Limpiar" : "Todos"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {employees.filter(emp => emp.isActive).slice(0, 8).map(emp => {
                    const selected = generationData.employeeIds.includes(emp._id);
                    return (
                      <button
                        key={emp._id}
                        type="button"
                        onClick={() => toggleGenerationEmployee(emp._id)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold uppercase tracking-wider transition-all ${
                          selected
                            ? "bg-[#9D4EDD]/15 border-[#9D4EDD]/40 text-[#9D4EDD]"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                        }`}
                      >
                        {emp.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-lg space-y-3" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <label className="flex items-center justify-between gap-3 text-xs text-white/60 font-medium">
                  <span>Actualizar agenda existente</span>
                  <input
                    type="checkbox"
                    checked={generationData.overwrite}
                    onChange={(e) => setGenerationData(prev => ({ ...prev, overwrite: e.target.checked }))}
                    className="h-4 w-4 accent-[#9D4EDD]"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 text-xs text-white/60 font-medium">
                  <span>Aplicar al perfil del empleado</span>
                  <input
                    type="checkbox"
                    checked={generationData.applyToProfiles}
                    onChange={(e) => setGenerationData(prev => ({ ...prev, applyToProfiles: e.target.checked }))}
                    className="h-4 w-4 accent-[#9D4EDD]"
                  />
                </label>

                {generationResult && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <MiniResult label="Creadas" value={generationResult.created} color="#00FF95" />
                    <MiniResult label="Actualizadas" value={generationResult.updated} color="#FFD166" />
                    <MiniResult label="Omitidas" value={generationResult.skipped} color="#FF4D6D" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={generating || shifts.length === 0}
              className="w-full h-10 rounded-xl bg-[#9D4EDD] text-white font-semibold hover:bg-[#9D4EDD]/90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {generating ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Generar Agenda"}
            </button>
          </form>
        </div>

      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl" style={{
            background: 'rgba(18, 18, 25, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingShift ? "Editar Turno" : "Nuevo Turno"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Shift Type */}
              <div>
                <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-3 block">
                  Tipo de Turno
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {shiftTypes.map((type) => (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, shiftType: type.key as any }))}
                      className={`
                        p-4 rounded-xl border-2 transition-all text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2
                        ${formData.shiftType === type.key
                          ? "border-[#00E5FF] bg-[#00E5FF]/10 text-white"
                          : "border-white/10 text-white/40 hover:border-white/20 hover:bg-white/5"
                        }
                      `}
                    >
                      {type.icon}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Employees */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block">
                    Máximo Empleados
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxEmployees}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxEmployees: parseInt(e.target.value) }))}
                    className="w-full h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block">
                    Mínimo Empleados
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.minEmployees}
                    onChange={(e) => setFormData(prev => ({ ...prev, minEmployees: parseInt(e.target.value) }))}
                    className="w-full h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block">
                  Prioridad
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-full h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px'
                  }}
                  required
                />
              </div>

              {/* Modules */}
              <div>
                <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-3 block">
                  Módulos Activos
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableModules.map((module) => (
                    <button
                      key={module}
                      type="button"
                      onClick={() => toggleModule(module)}
                      className={`
                        p-3 rounded-lg border transition-all text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2
                        ${formData.modules.includes(module)
                          ? "bg-[#00E5FF]/15 border-[#00E5FF]/40 text-[#00E5FF]"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                        }
                      `}
                    >
                      <Sparkles size={14} />
                      {moduleLabels[module] || module}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-24 px-4 py-3 rounded-xl text-white font-medium focus:outline-none transition-all resize-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px'
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-10 rounded-xl bg-white/5 text-white/60 font-semibold uppercase tracking-wider hover:bg-white/10 transition-all border border-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-10 rounded-xl bg-[#00E5FF] text-black font-semibold uppercase tracking-wider hover:bg-[#00E5FF]/90 active:scale-95 transition-all duration-200 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASIGNAR PLANTILLA TEMPLATE ================= */}
      {templateAssignShift && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-xl" style={{
            background: 'rgba(18, 18, 25, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] text-[#00E5FF] font-semibold uppercase tracking-wider mb-1">
                  Plantilla Permanente
                </p>
                <h2 className="text-xl font-bold text-white">
                  Asignar Personal
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Turno: {shiftTypes.find(t => t.key === templateAssignShift.shiftType)?.label || templateAssignShift.shiftType} ({templateAssignShift.startTime} - {templateAssignShift.endTime})
                </p>
              </div>
              <button
                onClick={() => setTemplateAssignShift(null)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-white/60 font-medium">
                Selecciona los empleados activos que pertenecerán permanentemente a este turno:
              </p>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {employees.filter(emp => emp.isActive).map(emp => {
                  const isAssigned = templateAssignShift.assignedEmployees?.some((e: any) => 
                    (typeof e === "string" ? e : e._id) === emp._id
                  );

                  return (
                    <button
                      key={emp._id}
                      onClick={() => handleToggleTemplateAssignment(templateAssignShift, emp._id)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left cursor-pointer ${
                        isAssigned
                          ? "bg-[#00E5FF]/10 border-[#00E5FF]/30 text-white"
                          : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-[#9D4EDD]/20 flex items-center justify-center text-white text-xs font-semibold">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white">{emp.name}</div>
                          <div className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">{emp.role}</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isAssigned 
                          ? "bg-[#00E5FF] border-[#00E5FF] text-black" 
                          : "border-white/20"
                      }`}>
                        {isAssigned && <CheckCircle size={12} className="text-black stroke-[3px]" />}
                      </div>
                    </button>
                  );
                })}
                {employees.filter(emp => emp.isActive).length === 0 && (
                  <p className="text-xs text-white/40 text-center py-4">No hay empleados activos disponibles.</p>
                )}
              </div>

              <button
                onClick={() => setTemplateAssignShift(null)}
                className="w-full h-10 rounded-xl bg-[#00E5FF] text-black font-semibold uppercase tracking-wider hover:bg-[#00E5FF]/90 active:scale-95 transition-all duration-200 mt-4 cursor-pointer"
              >
                Listo / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= COMPONENT: SUMMARY CARD =================
interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const SummaryCard = ({ label, value, icon, color }: SummaryCardProps) => {
  return (
    <div className="p-4 rounded-xl transition-all hover:-translate-y-0.5" style={{
      background: 'rgba(18, 18, 25, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-0.5">
            {label}
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniResult = ({ label, value, color }: { label: string; value: number; color: string }) => {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
      <div className="text-xl font-black" style={{ color }}>
        {value}
      </div>
      <div className="text-[8px] text-white/40 font-black uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
};

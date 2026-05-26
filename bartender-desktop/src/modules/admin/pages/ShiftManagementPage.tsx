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
import "../styles/luxury-theme.css";

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

  const handleOpenTemplateAssignModal = (shift: ShiftSchedule) => {
    setTemplateAssignShift(shift);
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

  const handleRemoveTemplateEmployee = async (shift: ShiftSchedule, userId: string) => {
    try {
      const currentIds = (shift.assignedEmployees || []).map((e: any) => 
        typeof e === "string" ? e : e._id
      );

      const updatedIds = currentIds.filter(id => id !== userId);

      const updatedShift = await updateShiftSchedule(shift._id, {
        assignedEmployees: updatedIds
      });

      setShifts(prevShifts => 
        prevShifts.map(s => s._id === shift._id ? { ...s, assignedEmployees: updatedShift.assignedEmployees || [] } : s)
      );

      await fetchData();
    } catch (error) {
      console.error("Error removing template employee:", error);
      alert("Error al remover el empleado de la plantilla");
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

  const getShiftAssignmentsList = (shiftId: string) => {
    return assignments.filter(a => getAssignmentShiftId(a) === shiftId);
  };

  return (
    <div className="min-h-screen luxury-bg p-4 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial opacity-20 rounded-full blur-2xl" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-gold opacity-20 blur-xl rounded-2xl animate-pulse" />
              <div className="relative p-5 glass-card">
                <Calendar className="text-[#d4af37]" size={36} />
              </div>
            </div>
            <div>
              <p className="text-xs text-[#d4af37] font-semibold tracking-[0.3em] uppercase mb-2 opacity-80">
                Control de Horarios
              </p>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Gestión de
                <span className="gradient-text"> Turnos</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
              className="flex items-center gap-3 h-12 md:h-14 px-5 md:px-8 rounded-xl bg-gradient-gold text-black font-bold hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all"
            >
              <Plus size={22} />
              <span className="text-sm font-bold tracking-wide uppercase">Nuevo Turno</span>
            </button>
          </div>
        </div>

        {/* ================= SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <SummaryCard
            label="Total Turnos"
            value={shifts.length}
            icon={<Calendar size={24} className="text-[#d4af37]" />}
            color="#d4af37"
          />
          <SummaryCard
            label="Asignaciones"
            value={assignments.length}
            icon={<Users size={24} className="text-[#00d4ff]" />}
            color="#00d4ff"
          />
          <SummaryCard
            label="Empleados"
            value={employees.length}
            icon={<Users size={24} className="text-[#00ff88]" />}
            color="#00ff88"
          />
          <SummaryCard
            label="Turnos Activos"
            value={shifts.filter(s => s.isActive).length}
            icon={<CheckCircle size={24} className="text-[#b147ff]" />}
            color="#b147ff"
          />
        </div>

        {/* ================= ASSIGNMENT PANEL ================= */}
        <form
          onSubmit={handleAssignmentSubmit}
          className="relative group p-[1px] rounded-2xl animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/40 to-[#d4af37]/0 opacity-30 group-hover:opacity-100 transition-opacity duration-1000 blur-xl" />
          <div className="relative glass-card p-8 rounded-2xl bg-[#0a0a0f]/80 backdrop-blur-xl border border-[#d4af37]/20">
            
            <div className="flex flex-col xl:flex-row xl:items-end gap-6">
              <div className="flex items-center gap-5 xl:w-80">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#d4af37] blur-lg opacity-40 rounded-xl" />
                  <div className="relative p-4 rounded-xl bg-[#12121a] border border-[#d4af37]/40">
                    <UserPlus className="text-[#d4af37]" size={26} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
                    Asignación Express
                  </p>
                  <h2 className="text-2xl font-black text-white tracking-tight mt-1" style={{ fontFamily: 'var(--font-display)' }}>
                    Asignar <span className="text-[#d4af37]">Personal</span>
                  </h2>
                </div>
              </div>

              <label className="flex-1 min-w-[200px] group/input">
                <span className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-2 block group-hover/input:text-[#d4af37] transition-colors">
                  Operador Seleccionado
                </span>
                <div className="relative">
                  <div className="absolute inset-0 bg-[#d4af37] opacity-0 group-hover/input:opacity-10 blur-md transition-opacity rounded-xl" />
                  <select
                    value={assignmentData.userId}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, userId: e.target.value }))}
                    className="relative w-full h-14 px-5 rounded-xl bg-[#12121a] border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 hover:border-[#d4af37]/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Buscar operador --</option>
                    {employees.filter(emp => emp.isActive).map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name} · {emp.role.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="flex-1 min-w-[200px] group/input">
                <span className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-2 block group-hover/input:text-[#d4af37] transition-colors">
                  Turno a Asignar
                </span>
                <div className="relative">
                  <div className="absolute inset-0 bg-[#d4af37] opacity-0 group-hover/input:opacity-10 blur-md transition-opacity rounded-xl" />
                  <select
                    value={assignmentData.shiftId}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, shiftId: e.target.value }))}
                    className="relative w-full h-14 px-5 rounded-xl bg-[#12121a] border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 hover:border-[#d4af37]/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Elige un turno --</option>
                    {shifts.filter(shift => shift.isActive).map(shift => {
                      const config = shiftTypes.find(s => s.key === shift.shiftType);
                      return (
                        <option key={shift._id} value={shift._id}>
                          {config?.label || shift.shiftType} [{shift.startTime}-{shift.endTime}]
                        </option>
                      );
                    })}
                  </select>
                </div>
              </label>

              <label className="w-full xl:w-48 group/input">
                <span className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-2 block group-hover/input:text-[#d4af37] transition-colors">
                  Fecha Efectiva
                </span>
                <div className="relative">
                  <div className="absolute inset-0 bg-[#d4af37] opacity-0 group-hover/input:opacity-10 blur-md transition-opacity rounded-xl" />
                  <input
                    type="date"
                    value={assignmentData.date}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, date: e.target.value }))}
                    className="relative w-full h-14 px-5 rounded-xl bg-[#12121a] border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 hover:border-[#d4af37]/50 transition-all [color-scheme:dark]"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={assigning || shifts.length === 0 || employees.length === 0}
                className="h-14 px-8 rounded-xl bg-gradient-gold text-black font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {assigning ? <Loader2 size={24} className="animate-spin" /> : "PROCESAR"}
              </button>
            </div>
          </div>
        </form>

        {/* ================= GENERATION PANEL ================= */}
        <form
          onSubmit={handleGenerateAssignments}
          className="relative group p-[1px] rounded-2xl animate-fade-in-up"
          style={{ animationDelay: '0.18s' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/0 via-[#00d4ff]/30 to-[#00d4ff]/0 opacity-30 group-hover:opacity-100 transition-opacity duration-1000 blur-xl" />
          <div className="relative glass-card p-8 rounded-2xl bg-[#0a0a0f]/80 backdrop-blur-xl border border-[#00d4ff]/20">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col xl:flex-row xl:items-end gap-6">
                <div className="flex items-center gap-5 xl:w-80">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#00d4ff] blur-lg opacity-40 rounded-xl" />
                    <div className="relative p-4 rounded-xl bg-[#12121a] border border-[#00d4ff]/40">
                      <Sparkles className="text-[#00d4ff]" size={26} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#00d4ff] font-black uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">
                      Generador de Agenda
                    </p>
                    <h2 className="text-2xl font-black text-white tracking-tight mt-1" style={{ fontFamily: 'var(--font-display)' }}>
                      Aplicar <span className="text-[#00d4ff]">Turnos</span>
                    </h2>
                  </div>
                </div>

                <label className="flex-1 min-w-[200px] group/input">
                  <span className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-2 block group-hover/input:text-[#00d4ff] transition-colors">
                    Turno base
                  </span>
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#00d4ff] opacity-0 group-hover/input:opacity-10 blur-md transition-opacity rounded-xl" />
                    <select
                      value={generationData.shiftId}
                      onChange={(e) => setGenerationData(prev => ({ ...prev, shiftId: e.target.value }))}
                      className="relative w-full h-14 px-5 rounded-xl bg-[#12121a] border border-white/10 text-white font-medium focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50 hover:border-[#00d4ff]/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- Todos los turnos activos --</option>
                      {shifts.filter(shift => shift.isActive).map(shift => {
                        const config = shiftTypes.find(s => s.key === shift.shiftType);
                        return (
                          <option key={shift._id} value={shift._id}>
                            {config?.label || shift.shiftType} [{shift.startTime}-{shift.endTime}]
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </label>

                <label className="w-full xl:w-44 group/input">
                  <span className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-2 block group-hover/input:text-[#00d4ff] transition-colors">
                    Desde
                  </span>
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#00d4ff] opacity-0 group-hover/input:opacity-10 blur-md transition-opacity rounded-xl" />
                    <input
                      type="date"
                      value={generationData.startDate}
                      onChange={(e) => setGenerationData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="relative w-full h-14 px-5 rounded-xl bg-[#12121a] border border-white/10 text-white font-medium focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50 hover:border-[#00d4ff]/50 transition-all [color-scheme:dark]"
                    />
                  </div>
                </label>

                <label className="w-full xl:w-44 group/input">
                  <span className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-2 block group-hover/input:text-[#00d4ff] transition-colors">
                    Hasta
                  </span>
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#00d4ff] opacity-0 group-hover/input:opacity-10 blur-md transition-opacity rounded-xl" />
                    <input
                      type="date"
                      value={generationData.endDate}
                      onChange={(e) => setGenerationData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="relative w-full h-14 px-5 rounded-xl bg-[#12121a] border border-white/10 text-white font-medium focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50 hover:border-[#00d4ff]/50 transition-all [color-scheme:dark]"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={generating || shifts.length === 0}
                  className="h-14 px-8 rounded-xl bg-[#00d4ff] text-black font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {generating ? <Loader2 size={24} className="animate-spin" /> : "GENERAR"}
                </button>
              </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-5">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-[10px] text-white/45 font-black uppercase tracking-widest">
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
                    className="text-[10px] text-[#00d4ff] font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    {generationData.employeeIds.length ? "Limpiar" : "Todos"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {employees.filter(emp => emp.isActive).slice(0, 12).map(emp => {
                    const selected = generationData.employeeIds.includes(emp._id);
                    return (
                      <button
                        key={emp._id}
                        type="button"
                        onClick={() => toggleGenerationEmployee(emp._id)}
                        className={`px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all ${
                          selected
                            ? "bg-[#00d4ff]/15 border-[#00d4ff]/40 text-[#00d4ff]"
                            : "bg-white/5 border-white/10 text-white/45 hover:text-white"
                        }`}
                      >
                        {emp.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <label className="flex items-center justify-between gap-3 text-xs text-white/65 font-bold">
                  <span>Actualizar agenda existente</span>
                  <input
                    type="checkbox"
                    checked={generationData.overwrite}
                    onChange={(e) => setGenerationData(prev => ({ ...prev, overwrite: e.target.checked }))}
                    className="h-4 w-4 accent-[#00d4ff]"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 text-xs text-white/65 font-bold">
                  <span>Aplicar al perfil del empleado</span>
                  <input
                    type="checkbox"
                    checked={generationData.applyToProfiles}
                    onChange={(e) => setGenerationData(prev => ({ ...prev, applyToProfiles: e.target.checked }))}
                    className="h-4 w-4 accent-[#00d4ff]"
                  />
                </label>

                {generationResult && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <MiniResult label="Creadas" value={generationResult.created} color="#00ff88" />
                    <MiniResult label="Actualizadas" value={generationResult.updated} color="#d4af37" />
                    <MiniResult label="Omitidas" value={generationResult.skipped} color="#ff4757" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

        {/* ================= SHIFTS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <div className="col-span-2 p-12 text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-gold opacity-20 blur-xl rounded-full animate-pulse" />
                <Loader2 size={48} className="relative text-[#d4af37] mx-auto animate-spin" />
              </div>
              <p className="text-white/60 font-semibold tracking-wide">
                Cargando turnos...
              </p>
            </div>
          ) : shifts.length === 0 ? (
            <div className="col-span-2 p-12 text-center glass-card">
              <Calendar size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40 font-semibold tracking-wide">
                No hay turnos configurados
              </p>
            </div>
          ) : (
            shifts.map((shift, index) => {
              const config = shiftTypes.find(s => s.key === shift.shiftType) || shiftTypes[0];
              const assignmentsCount = getAssignmentsCount(shift._id);
              const shiftAssignments = getShiftAssignmentsList(shift._id);
              
              return (
                <div
                  key={shift._id}
                  className={`glass-card p-6 transition-all duration-500 hover:transform hover:scale-[1.02] animate-fade-in-up ${shift.isActive ? 'opacity-100' : 'opacity-50'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-radial opacity-0 group-hover:opacity-30 transition-opacity rounded-xl" style={{ background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)` }} />
                        <div className="relative p-4 rounded-xl bg-white/5 border border-white/10">
                          {config.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-wide mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                          {config.label}
                        </h3>
                        <p className="text-sm text-white/50 font-semibold uppercase tracking-wider">
                          {shift.startTime} - {shift.endTime}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(shift)}
                        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(shift._id)}
                        className="p-3 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all border border-white/10"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
                        Personal
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {assignmentsCount} <span className="text-white/40">/ {shift.maxEmployees}</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
                        Mínimo
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {shift.minEmployees}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
                        Prioridad
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {shift.priority}
                      </div>
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {shift.modules.map((module: string) => (
                      <span
                        key={module}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-semibold uppercase tracking-wider border border-white/10"
                      >
                        {moduleLabels[module] || module}
                      </span>
                    ))}
                  </div>

                  {/* Plantilla Permanente del Turno */}
                  <div className="rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/[0.02] p-4 mb-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#d4af37]" />
                        <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest">
                          Plantilla del Turno (Fija)
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenTemplateAssignModal(shift)}
                        className="p-1 rounded bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/35 hover:border-[#d4af37] text-[#d4af37] transition-all flex items-center justify-center cursor-pointer"
                        title="Asignar empleado permanentemente"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {!shift.assignedEmployees || shift.assignedEmployees.length === 0 ? (
                      <p className="text-xs text-white/35 font-semibold italic">
                        Sin personal en la plantilla por defecto.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {shift.assignedEmployees.map((emp: any) => {
                          const empId = typeof emp === "string" ? emp : emp._id;
                          const empName = typeof emp === "string" ? "Empleado" : emp.name;
                          const empRole = typeof emp === "string" ? "" : emp.role;
                          return (
                            <span
                              key={empId}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#d4af37]/15 to-[#f4e4a6]/5 text-white text-xs font-semibold border border-[#d4af37]/20 hover:border-[#d4af37]/45 transition-all"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                              <span>{empName}</span>
                              {empRole && <span className="text-[9px] text-white/40">({empRole})</span>}
                              <button
                                onClick={() => handleRemoveTemplateEmployee(shift, empId)}
                                className="text-white/40 hover:text-red-400 transition-colors ml-1 font-bold text-xs cursor-pointer"
                                title="Eliminar de la plantilla"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Assigned employees */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                        Personal asignado
                      </p>
                      <span className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest">
                        {shiftAssignments.length} agenda(s)
                      </span>
                    </div>
                    {shiftAssignments.length === 0 ? (
                      <p className="text-xs text-white/35 font-semibold">
                        Sin empleados asignados todavía.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {shiftAssignments.slice(0, 6).map((assignment) => (
                          <span
                            key={assignment._id}
                            className="px-3 py-1.5 rounded-lg bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-black uppercase tracking-wider border border-[#d4af37]/20"
                          >
                            {assignment.userName} · {assignment.date}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {shift.description && (
                    <p className="text-sm text-white/60 font-medium mb-4 italic">
                      {shift.description}
                    </p>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${shift.isActive ? "bg-[#00ff88]" : "bg-[#ff4757]"} animate-pulse`} />
                    <span className={`text-sm font-bold uppercase tracking-wider ${shift.isActive ? "text-[#00ff88]" : "text-[#ff4757]"}`}>
                      {shift.isActive ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto luxury-scrollbar animate-scale-in">
            <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              {editingShift ? "Editar Turno" : "Nuevo Turno"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shift Type */}
              <div>
                <label className="text-sm text-white/60 font-semibold uppercase tracking-wider mb-4 block">
                  Tipo de Turno
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {shiftTypes.map((type) => (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, shiftType: type.key as any }))}
                      className={`
                        p-5 rounded-xl border-2 transition-all text-sm font-bold uppercase tracking-wider flex items-center gap-3
                        ${formData.shiftType === type.key
                          ? `border-[${type.color}] bg-[${type.color}]/10 text-white shadow-lg`
                          : "border-white/10 text-white/40 hover:border-white/20 hover:bg-white/5"
                        }
                      `}
                      style={formData.shiftType === type.key ? {
                        borderColor: type.color,
                        backgroundColor: `${type.color}20`,
                        color: type.color
                      } : {}}
                    >
                      {type.icon}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 font-semibold uppercase tracking-wider mb-2 block">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37]/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 font-semibold uppercase tracking-wider mb-2 block">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37]/50 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Employees */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 font-semibold uppercase tracking-wider mb-2 block">
                    Máximo Empleados
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxEmployees}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxEmployees: parseInt(e.target.value) }))}
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37]/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 font-semibold uppercase tracking-wider mb-2 block">
                    Mínimo Empleados
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.minEmployees}
                    onChange={(e) => setFormData(prev => ({ ...prev, minEmployees: parseInt(e.target.value) }))}
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37]/50 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm text-white/60 font-semibold uppercase tracking-wider mb-2 block">
                  Prioridad
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37]/50 transition-all"
                  required
                />
              </div>

              {/* Modules */}
              <div>
                <label className="text-sm text-white/60 font-semibold uppercase tracking-wider mb-4 block">
                  Módulos Activos
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {availableModules.map((module) => (
                    <button
                      key={module}
                      type="button"
                      onClick={() => toggleModule(module)}
                      className={`
                        p-4 rounded-lg border transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2
                        ${formData.modules.includes(module)
                          ? "bg-gradient-gold text-black border-[#d4af37]"
                          : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
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
                <label className="text-sm text-white/60 font-semibold uppercase tracking-wider mb-2 block">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37]/50 transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-12 rounded-xl bg-white/5 text-white/60 font-bold uppercase tracking-wider hover:bg-white/10 transition-all border border-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-12 rounded-xl bg-gradient-gold text-black font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASIGNAR PLANTILLA TEMPLATE ================= */}
      {templateAssignShift && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto luxury-scrollbar animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.3em] mb-1">
                  Plantilla Permanente
                </p>
                <h2 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Asignar Personal
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Turno: {shiftTypes.find(t => t.key === templateAssignShift.shiftType)?.label || templateAssignShift.shiftType} ({templateAssignShift.startTime} - {templateAssignShift.endTime})
                </p>
              </div>
              <button
                onClick={() => setTemplateAssignShift(null)}
                className="text-white/40 hover:text-white transition-colors text-2xl font-semibold cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-white/60 font-medium">
                Selecciona los empleados activos que pertenecerán permanentemente a este turno:
              </p>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 luxury-scrollbar">
                {employees.filter(emp => emp.isActive).map(emp => {
                  const isAssigned = templateAssignShift.assignedEmployees?.some((e: any) => 
                    (typeof e === "string" ? e : e._id) === emp._id
                  );

                  return (
                    <button
                      key={emp._id}
                      onClick={() => handleToggleTemplateAssignment(templateAssignShift, emp._id)}
                      className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all text-left cursor-pointer ${
                        isAssigned
                          ? "bg-[#d4af37]/15 border-[#d4af37]/45 text-white"
                          : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-white">{emp.name}</div>
                        <div className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">{emp.role} · {emp.email}</div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isAssigned 
                          ? "bg-[#d4af37] border-[#d4af37] text-black" 
                          : "border-white/20"
                      }`}>
                        {isAssigned && <CheckCircle size={14} className="text-black stroke-[3px]" />}
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
                className="w-full h-12 rounded-xl bg-gradient-gold text-black font-black uppercase tracking-wider hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all mt-4 cursor-pointer"
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
    <div className="metric-card group">
      <div className="relative">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br opacity-30 blur-xl rounded-xl" style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }} />
            <div className="relative p-4 rounded-xl bg-white/5 border border-white/10">
              {icon}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1">
              {label}
            </div>
            <div className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {value}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
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

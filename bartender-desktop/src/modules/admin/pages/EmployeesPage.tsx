import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import EmployeeCard from "../components/EmployeeCard";
import EmployeeForm from "../components/EmployeeForm";

import {
  getEmployees,
  createEmployee,
  deactivateUser,
} from "../services/userService";

import type { User } from "../types/user";

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =====================================================
     FETCH EMPLOYEES (SIMPLIFICADO + SAFE SERVICE)
  ===================================================== */
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const data = await getEmployees();

    // 👇 service ya garantiza array
    setUsers(data);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =====================================================
     LISTEN: USER DISABLED (GLOBAL AUTH EVENT)
  ===================================================== */
  useEffect(() => {
    const handleDisabled = () => {
      setError("Tu usuario fue desactivado");
      setUsers([]);
    };

    window.addEventListener("auth:disabled", handleDisabled);

    return () => {
      window.removeEventListener("auth:disabled", handleDisabled);
    };
  }, []);

  /* =====================================================
     CREATE EMPLOYEE
  ===================================================== */
  const handleCreate = async (form: any) => {
    const res = await createEmployee(form);

    if (!res) {
      alert("No se pudo crear el empleado");
      return;
    }

    setOpen(false);
    await fetchData();
  };

  /* =====================================================
     DEACTIVATE EMPLOYEE
  ===================================================== */
  const handleDeactivate = async (id: string) => {
    const ok = window.confirm("¿Desactivar usuario?");
    if (!ok) return;

    const res = await deactivateUser(id);

    if (!res) {
      alert("No se pudo desactivar el usuario");
      return;
    }

    await fetchData();
  };

  /* =====================================================
     LOADING
  ===================================================== */
  if (loading) {
    return (
      <div className="text-white text-sm opacity-70">
        Cargando empleados...
      </div>
    );
  }

  return (
    <div className="space-y-6 glass-royale p-8 rounded-[3rem] shadow-royale animate-fade-in relative overflow-hidden">

      {/* ATMOSPHERIC GLOW */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-between relative z-10">

        <div className="flex items-center gap-6">
          <div className="p-4 bg-surface-3 border border-white/5 rounded-2xl shadow-inner">
            <h1 className="text-3xl font-black text-ivory tracking-tighter uppercase leading-none">
              Directorio
            </h1>
          </div>
          <div>
            <p className="text-[10px] text-gold font-black uppercase tracking-[0.4em] mb-1">
              Operaciones Umbra
            </p>
            <p className="text-xs text-muted font-bold tracking-widest uppercase">
              Gestión de Personal Elite
            </p>

            {error && (
              <p className="text-[10px] text-red font-black tracking-widest mt-2 bg-red/10 px-2 py-1 rounded">
                {error}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 h-14 px-6 rounded-2xl
          bg-grad-gold text-bg shadow-gold/30
          hover:shadow-gold-glow hover:scale-[1.02] active:scale-95
          transition-all"
        >
          <Plus size={20} className="text-bg" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nuevo Colaborador</span>
        </button>
      </div>

      {/* ================= EMPTY ================= */}
      {!error && users.length === 0 && (
        <div className="text-[10px] font-black text-muted uppercase tracking-widest bg-surface-2 p-6 rounded-2xl text-center border border-white/5">
          No hay colaboradores en el sistema
        </div>
      )}

      {/* ================= GRID ================= */}
      <div
        className="
        grid 
        grid-cols-1 
        xl:grid-cols-2 
        2xl:grid-cols-3 
        gap-6
        relative z-10
      "
      >
        {users.map((u) => (
          <div key={u._id}>
            <EmployeeCard
              user={u}
              onDeactivate={handleDeactivate}
            />
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {open && (
        <EmployeeForm
          onSave={handleCreate}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
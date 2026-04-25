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
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-between">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Empleados
          </h1>

          <p className="text-sm text-[#71717A] mt-1">
            Gestión de personal del sistema de bar
          </p>

          {error && (
            <p className="text-xs text-red-400 mt-2">
              {error}
            </p>
          )}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
          bg-[#A78BFA] text-black font-semibold
          hover:shadow-[0_0_25px_rgba(167,139,250,0.35)]
          transition"
        >
          <Plus size={18} />
          Nuevo empleado
        </button>
      </div>

      {/* ================= EMPTY ================= */}
      {!error && users.length === 0 && (
        <div className="text-sm text-[#71717A]">
          No hay empleados registrados
        </div>
      )}

      {/* ================= GRID ================= */}
      <div
        className="
        grid 
        grid-cols-1 
        md:grid-cols-2 
        xl:grid-cols-3 
        gap-5
      "
      >
        {users.map((u) => (
          <div
            key={u._id}
            className="rounded-2xl border border-[rgba(255,255,255,0.06)]
            bg-[#0E131B]/60 backdrop-blur-xl
            shadow-[0_0_25px_rgba(0,0,0,0.4)]
            hover:border-[#A78BFA]/20
            transition"
          >
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
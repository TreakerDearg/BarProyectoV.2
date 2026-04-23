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
     NORMALIZADOR DEFENSIVO (EVITA users.map CRASH)
  ===================================================== */
  const normalizeUsers = (data: any): User[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  /* =====================================================
     FETCH EMPLOYEES (ROBUSTO)
  ===================================================== */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getEmployees();
      const normalized = normalizeUsers(data);

      setUsers(normalized);

    } catch (err: any) {
      console.error("Error fetching employees:", err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Error cargando empleados"
      );

      setUsers([]); // evita crash visual
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =====================================================
     CREATE EMPLOYEE
  ===================================================== */
  const handleCreate = async (form: any) => {
    try {
      await createEmployee(form);
      setOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("Error creating employee:", err);

      alert(
        err?.response?.data?.message ||
        err?.message ||
        "Error creando empleado"
      );
    }
  };

  /* =====================================================
     DEACTIVATE EMPLOYEE
  ===================================================== */
  const handleDeactivate = async (id: string) => {
    try {
      const ok = window.confirm("¿Desactivar usuario?");
      if (!ok) return;

      await deactivateUser(id);
      await fetchData();

    } catch (err: any) {
      console.error("Error deactivating user:", err);

      alert(
        err?.response?.data?.message ||
        err?.message ||
        "Error desactivando usuario"
      );
    }
  };

  /* =====================================================
     LOADING STATE
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

      {/* ================= EMPTY STATE ================= */}
      {!error && users.length === 0 && (
        <div className="text-sm text-[#71717A]">
          No hay empleados registrados
        </div>
      )}

      {/* ================= GRID ================= */}
      <div className="
        grid 
        grid-cols-1 
        md:grid-cols-2 
        xl:grid-cols-3 
        gap-5
      ">

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
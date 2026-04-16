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

  const fetchData = async () => {
    const data = await getEmployees();
    setUsers(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (form: any) => {
    await createEmployee(form);
    setOpen(false);
    fetchData();
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("¿Desactivar usuario?")) return;
    await deactivateUser(id);
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Empleados</h1>

        <button
          onClick={() => setOpen(true)}
          className="btn-primary flex gap-2"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {users.map((u) => (
          <EmployeeCard
            key={u._id}
            user={u}
            onDeactivate={handleDeactivate}
          />
        ))}
      </div>

      {open && (
        <EmployeeForm
          onSave={handleCreate}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
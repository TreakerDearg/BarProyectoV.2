import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type Role = "admin" | "bartender" | "waiter" | "cashier" | "kitchen";

interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

export default function EmployeeForm({
  onSave,
  onClose,
  loading = false,
}: {
  onSave: (data: Omit<EmployeeFormData, "confirmPassword">) => void;
  onClose: () => void;
  loading?: boolean;
}) {
  const [form, setForm] = useState<EmployeeFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "bartender",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  /* ==============================
     HANDLE INPUT
  ============================== */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ==============================
     VALIDATION PRO
  ============================== */
  const validate = (): string => {
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!form.name.trim()) return "El nombre es obligatorio";
    if (form.name.trim().length < 2)
      return "El nombre debe tener al menos 2 caracteres";

    if (!form.email.trim()) return "El email es obligatorio";
    if (!emailRegex.test(form.email))
      return "Email inválido";

    if (!form.password) return "La contraseña es obligatoria";
    if (form.password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres";

    if (form.password !== form.confirmPassword)
      return "Las contraseñas no coinciden";

    return "";
  };

  /* ==============================
     SUBMIT
  ============================== */
  const handleSubmit = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");

    const { confirmPassword, ...data } = form;

    onSave(data);
  };

  /* ==============================
     UI
  ============================== */
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 w-[420px] rounded-2xl p-6 shadow-xl border border-gray-800">

        {/* HEADER */}
        <h2 className="text-xl font-bold text-white mb-4">
          Crear empleado
        </h2>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 text-sm p-2 rounded mb-3">
            {error}
          </div>
        )}

        {/* NAME */}
        <input
          name="name"
          placeholder="Nombre completo"
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
          value={form.name}
        />

        {/* EMAIL */}
        <input
          name="email"
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
          value={form.email}
        />

        {/* PASSWORD */}
        <div className="relative mb-3">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            className="w-full p-2 pr-10 rounded bg-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            value={form.password}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* CONFIRM PASSWORD */}
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirmar contraseña"
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
          value={form.confirmPassword}
        />

        {/* ROLE */}
        <select
          name="role"
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
          value={form.role}
        >
          <option value="bartender">Bartender</option>
          <option value="waiter">Mozo</option>
          <option value="cashier">Caja</option>
          <option value="kitchen">Cocina</option>
          <option value="admin">Admin</option>
        </select>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
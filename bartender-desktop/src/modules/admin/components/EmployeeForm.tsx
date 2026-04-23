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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = (): string => {
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!form.name.trim()) return "El nombre es obligatorio";
    if (form.name.trim().length < 2) return "Mínimo 2 caracteres";

    if (!form.email.trim()) return "El email es obligatorio";
    if (!emailRegex.test(form.email)) return "Email inválido";

    if (!form.password) return "La contraseña es obligatoria";
    if (form.password.length < 6) return "Mínimo 6 caracteres";

    if (form.password !== form.confirmPassword)
      return "Las contraseñas no coinciden";

    return "";
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) return setError(err);

    setError("");

    const { confirmPassword, ...data } = form;
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">

      {/* ================= MODAL ================= */}
      <div className="w-[440px] rounded-2xl border border-[rgba(255,255,255,0.06)]
      bg-[#0E131B]/80 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.7)]
      p-6">

        {/* HEADER */}
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">
            Crear empleado
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            Terminal de gestión de personal
          </p>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#A78BFA]/30 to-transparent mt-3" />
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-3 text-sm text-[#F87171] bg-[#F87171]/10 border border-[#F87171]/20 p-2 rounded-lg">
            {error}
          </div>
        )}

        {/* INPUTS */}
        <div className="space-y-3">

          <input
            name="name"
            placeholder="Nombre completo"
            className="w-full px-3 py-2.5 rounded-xl
            bg-[#111827]/60 border border-[rgba(255,255,255,0.06)]
            text-white placeholder:text-[#71717A]
            outline-none focus:border-[#A78BFA]/40
            focus:shadow-[0_0_20px_rgba(167,139,250,0.15)]
            transition"
            onChange={handleChange}
            value={form.name}
          />

          <input
            name="email"
            placeholder="Email"
            className="w-full px-3 py-2.5 rounded-xl
            bg-[#111827]/60 border border-[rgba(255,255,255,0.06)]
            text-white placeholder:text-[#71717A]
            outline-none focus:border-[#A78BFA]/40
            focus:shadow-[0_0_20px_rgba(167,139,250,0.15)]
            transition"
            onChange={handleChange}
            value={form.email}
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="w-full px-3 py-2.5 pr-10 rounded-xl
              bg-[#111827]/60 border border-[rgba(255,255,255,0.06)]
              text-white placeholder:text-[#71717A]
              outline-none focus:border-[#A78BFA]/40
              focus:shadow-[0_0_20px_rgba(167,139,250,0.15)]
              transition"
              onChange={handleChange}
              value={form.password}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-[#71717A] hover:text-[#A78BFA] transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            className="w-full px-3 py-2.5 rounded-xl
            bg-[#111827]/60 border border-[rgba(255,255,255,0.06)]
            text-white placeholder:text-[#71717A]
            outline-none focus:border-[#A78BFA]/40
            focus:shadow-[0_0_20px_rgba(167,139,250,0.15)]
            transition"
            onChange={handleChange}
            value={form.confirmPassword}
          />

          {/* ROLE */}
          <select
            name="role"
            className="w-full px-3 py-2.5 rounded-xl
            bg-[#111827]/60 border border-[rgba(255,255,255,0.06)]
            text-white outline-none focus:border-[#A78BFA]/40 transition"
            onChange={handleChange}
            value={form.role}
          >
            <option value="bartender">Bartender</option>
            <option value="waiter">Mozo</option>
            <option value="cashier">Caja</option>
            <option value="kitchen">Cocina</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-5">

          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl
            bg-[#3F3F46] text-white hover:bg-[#52525B]
            transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-xl
            bg-[#A78BFA] text-black font-semibold
            hover:shadow-[0_0_25px_rgba(167,139,250,0.35)]
            transition flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            Crear
          </button>
        </div>

      </div>
    </div>
  );
}
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function EmployeeForm({ onSave, onClose }: any) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "bartender",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  //  VALIDACIÓN
  const validate = () => {
    if (!form.name || !form.email || !form.password) {
      return "Todos los campos son obligatorios";
    }

    if (form.password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }

    if (form.password !== form.confirmPassword) {
      return "Las contraseñas no coinciden";
    }

    return "";
  };

  const handleSubmit = () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    const { confirmPassword, ...data } = form;

    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-gray-900 p-6 rounded-xl w-[400px]">
        <h2 className="text-xl mb-4 font-bold">
          Nuevo empleado
        </h2>

        {/* ERROR */}
        {error && (
          <p className="text-red-400 text-sm mb-3">
            {error}
          </p>
        )}

        {/* NAME */}
        <input
          name="name"
          placeholder="Nombre"
          className="input"
          onChange={handleChange}
        />

        {/* EMAIL */}
        <input
          name="email"
          placeholder="Email"
          className="input"
          onChange={handleChange}
        />

        {/* PASSWORD */}
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            className="input pr-10"
            onChange={handleChange}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* CONFIRM PASSWORD */}
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirmar contraseña"
          className="input"
          onChange={handleChange}
        />

        {/* ROLE */}
        <select
          name="role"
          onChange={handleChange}
          className="input"
        >
          <option value="bartender">Bartender</option>
          <option value="waiter">Mozo</option>
          <option value="cashier">Caja</option>
          <option value="admin">Admin</option>
        </select>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="btn-gray">
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
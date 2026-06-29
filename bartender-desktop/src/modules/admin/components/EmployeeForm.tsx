"use client";

import { useState } from "react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  User,
  Mail,
  Lock,
  Shield,
  Loader2,
  Zap,
  Eye,
  EyeOff,
  Award,
  Users,
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";

type Role = "admin" | "bartender" | "waiter" | "cashier" | "kitchen";

interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

const ROLE_OPTIONS = [
  { value: "bartender", label: "Mixólogo / Bartender", icon: <Zap size={18} />, color: "from-cyan-500/20 to-blue-500/10", border: "border-cyan/30", text: "text-cyan-400" },
  { value: "waiter", label: "Servicio / Mozo", icon: <Award size={18} />, color: "from-emerald-500/20 to-green-500/10", border: "border-emerald/30", text: "text-emerald-400" },
  { value: "kitchen", label: "Chef / Cocina", icon: <Zap size={18} />, color: "from-orange-500/20 to-red-500/10", border: "border-orange/30", text: "text-orange-400" },
  { value: "admin", label: "Alto Mando / Admin", icon: <Shield size={18} />, color: "from-gold/20 to-violet-500/10", border: "border-gold/30", text: "text-gold" },
];

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
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = (): string => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!form.name.trim()) return "Se requiere identificar al colaborador";
    if (!form.email.trim() || !emailRegex.test(form.email)) return "Credencial de email inválida";
    if (!form.password || form.password.length < 6) return "Protocolo de seguridad: Mínimo 6 caracteres";
    if (form.password !== form.confirmPassword) return "Conflicto en confirmación de seguridad";
    return "";
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) return setError(err);
    setError("");
    const { confirmPassword, ...data } = form;
    onSave(data);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    if (password.length < 10) return 3;
    return 4;
  };

  const passwordStrength = getPasswordStrength(form.password);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 md:p-8 overflow-y-auto"
    >
      {/* Atmosphere */}
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-gold/10 to-violet/10 rounded-full blur-[150px] -z-10 animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-cyan/10 to-violet/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-3xl overflow-hidden my-auto bg-gradient-to-br from-surface-2 to-surface-3 border border-white/10"
      >
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-gold/10 via-violet/10 to-cyan/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gold to-violet text-black shadow-lg">
              <Users className="text-black" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight uppercase text-white">
                Nuevo Perfil
              </h2>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-1">
                Reclutamiento Estratégico
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          
          {/* Errors */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red/10 border border-red/30 rounded-xl flex items-center gap-3"
            >
              <AlertTriangle size={18} className="text-red-400" />
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">{error}</p>
            </motion.div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={14} /> Identidad del Colaborador
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider ml-1">Nombre Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    placeholder="Ej: John Doe" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white outline-none focus:border-cyan/40 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider ml-1">Email Estratégico</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <input 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="john@umbragroup.com" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white outline-none focus:border-cyan/40 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              <Lock size={14} /> Protocolos de Seguridad
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider ml-1">Clave de Acceso</label>
                <div className="relative group">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-sm font-medium text-white outline-none focus:border-cyan/40 transition-all"
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        passwordStrength >= level 
                          ? level === 1 ? 'bg-red-400' 
                          : level === 2 ? 'bg-orange-400' 
                          : level === 3 ? 'bg-yellow-400' 
                          : 'bg-emerald-400'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider ml-1">Confirmar Protocolo</label>
                <input 
                  name="confirmPassword" 
                  type="password" 
                  value={form.confirmPassword} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-white outline-none focus:border-cyan/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              <Shield size={14} /> Asignación de Rango
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ROLE_OPTIONS.map((role) => (
                <motion.button
                  key={role.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setForm({ ...form, role: role.value as Role })}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 gap-2
                    ${form.role === role.value
                      ? `bg-gradient-to-br ${role.color} ${role.border} shadow-lg`
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div className={`${form.role === role.value ? role.text : 'text-white/50'}`}>
                    {role.icon}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider text-center ${
                    form.role === role.value ? role.text : 'text-white/50'
                  }`}>
                    {role.label.split(' / ')[0]}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-4 bg-gradient-to-r from-gold/5 via-violet/5 to-cyan/5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-gold via-violet to-cyan text-black font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            <span>Establecer Perfil</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
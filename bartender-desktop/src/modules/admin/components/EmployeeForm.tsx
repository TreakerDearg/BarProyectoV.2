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
import "../styles/luxury-theme.css";

type Role = "admin" | "bartender" | "waiter" | "cashier" | "kitchen";

interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

const ROLE_OPTIONS = [
  { value: "bartender", label: "Mixólogo / Bartender", icon: <Zap size={18} /> },
  { value: "waiter", label: "Servicio / Mozo", icon: <Award size={18} /> },
  { value: "kitchen", label: "Chef / Cocina", icon: <Zap size={18} /> },
  { value: "admin", label: "Alto Mando / Admin", icon: <Shield size={18} /> },
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

  return (
    <div className="fixed inset-0 bg-[#0a0a0f]/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 md:p-8 animate-fade-in luxury-bg overflow-y-auto">

      {/* ATMOSPHERE */}
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-[#d4af37]/5 rounded-full blur-[150px] -z-10 animate-pulse-slow" />
      <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#b147ff]/5 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

      <div className="w-full max-w-2xl glass-card rounded-[3rem] overflow-hidden my-auto animate-fade-in-up">
        
        {/* HEADER */}
        <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl shadow-gold-glow" style={{ background: 'var(--gradient-gold)' }}>
              <Users className="text-[#0a0a0f]" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none gradient-text" style={{ fontFamily: 'var(--font-display)' }}>
                Nuevo Perfil
              </h2>
              <p className="text-[10px] text-[#a0a0b0] font-black uppercase tracking-[0.5em] mt-2">
                Reclutamiento Estratégico Umbra
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-14 h-14 rounded-full glass-card flex items-center justify-center hover:border-[#d4af37]/30 text-[#a0a0b0] hover:text-[#d4af37] transition-all">
            <X size={28} />
          </button>
        </div>

        <div className="p-10 md:p-12 space-y-10">
          
          {/* ERRORS */}
          {error && (
            <div className="p-5 bg-[#ff4757]/5 border border-[#ff4757]/20 rounded-2xl flex items-center gap-4">
              <AlertTriangle size={20} className="text-[#ff4757]" />
              <p className="text-[10px] font-black text-[#ff4757] uppercase tracking-widest">{error}</p>
            </div>
          )}

          {/* BASIC INFO */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] flex items-center gap-3">
              <Briefcase size={14} /> Identidad del Colaborador
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-[#a0a0b0] uppercase tracking-widest ml-1">Nombre Completo</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a0a0b0] group-focus-within:text-[#d4af37] transition-colors" size={18} />
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Ej: John Doe" className="luxury-input !pl-14" />
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-[#a0a0b0] uppercase tracking-widest ml-1">Email Estratégico</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a0a0b0] group-focus-within:text-[#d4af37] transition-colors" size={18} />
                  <input name="email" value={form.email} onChange={handleChange} placeholder="john@umbragroup.com" className="luxury-input !pl-14" />
                </div>
              </div>
            </div>
          </div>

          {/* SECURITY */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] flex items-center gap-3">
              <Lock size={14} /> Protocolos de Seguridad
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-[#a0a0b0] uppercase tracking-widest ml-1">Clave de Acceso</label>
                <div className="relative group">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="luxury-input pr-14"
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#a0a0b0] hover:text-[#d4af37] transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-[#a0a0b0] uppercase tracking-widest ml-1">Confirmar Protocolo</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className="luxury-input" />
              </div>
            </div>
          </div>

          {/* ROLE SELECTION */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] flex items-center gap-3">
              <Shield size={14} /> Asignación de Rango
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setForm({ ...form, role: role.value as Role })}
                  className={`
                    flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all duration-500 gap-3
                    ${form.role === role.value
                      ? 'shadow-gold-glow scale-105'
                      : 'glass-card hover:border-white/20'}
                  `}
                  style={form.role === role.value ? {
                    background: 'var(--gradient-gold)',
                    borderColor: '#d4af37',
                    color: '#0a0a0f'
                  } : {}}
                >
                  {role.icon}
                  <span className="text-[8px] font-black uppercase tracking-widest text-center">{role.label.split(' / ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-10 border-t border-white/10 flex gap-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-16 rounded-[1.5rem] glass-card text-xs font-black uppercase tracking-[0.4em] text-[#a0a0b0] hover:text-[#ffffff] transition-all"
          >
            CANCELAR
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] h-16 rounded-[1.5rem] luxury-button flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
            <span className="text-sm font-black uppercase tracking-[0.3em]">ESTABLECER PERFIL</span>
          </button>
        </div>
      </div>
    </div>
  );
}
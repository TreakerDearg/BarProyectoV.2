import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, initialize } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0B0F14] overflow-hidden text-white">

      {/* ================= BACKGROUND GLOW ================= */}
      <div className="absolute inset-0">
        <div className="absolute top-[-25%] left-1/2 w-[600px] h-[600px] -translate-x-1/2 bg-[#A78BFA]/10 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#34D399]/10 blur-[140px]" />
      </div>

      {/* ================= LOGIN CARD ================= */}
      <div className="relative z-10 w-full max-w-md">

        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0E131B]/70 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.6)] p-8">

          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-wide">
              Bartender System
            </h1>

            <p className="text-sm text-[#71717A] mt-1">
              Obsidian Access Terminal
            </p>

            {/* TOP LINE */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#A78BFA]/40 to-transparent mt-4" />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#111827]/60 border border-[rgba(255,255,255,0.06)] text-white placeholder:text-[#71717A] outline-none focus:border-[#A78BFA]/40 focus:shadow-[0_0_20px_rgba(167,139,250,0.15)] transition"
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-xl bg-[#111827]/60 border border-[rgba(255,255,255,0.06)] text-white placeholder:text-[#71717A] outline-none focus:border-[#A78BFA]/40 focus:shadow-[0_0_20px_rgba(167,139,250,0.15)] transition"
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3 text-[#71717A] hover:text-[#A78BFA] transition"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="text-sm text-[#F87171] bg-[#F87171]/10 border border-[#F87171]/20 p-2 rounded-lg">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition
              bg-[#A78BFA] text-black hover:shadow-[0_0_25px_rgba(167,139,250,0.35)]
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : "Acceder al sistema"}
            </button>
          </form>

          {/* FOOTER HINT */}
          <p className="text-center text-[11px] text-[#71717A] mt-6">
            Secure Bar Control System • Obsidian Network
          </p>

        </div>
      </div>
    </div>
  );
}
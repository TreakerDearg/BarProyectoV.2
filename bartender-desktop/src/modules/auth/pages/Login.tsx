import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { saveTokens } from "../../../utils/tokenStorage";
import { setAuthToken } from "../../../services/api";
import { resolveApiBaseUrl } from "../../../services/socketConfig";

export default function Login() {
  const navigate  = useNavigate();
  const { login, isAuthenticated, initialize, setAuth, user } = useAuthStore();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  useEffect(() => { initialize(); }, []);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user?.role === "client") {
      useAuthStore.getState().logout();
      setError("Esta cuenta es de cliente. Iniciá sesión en la web del bar.");
      return;
    }
    if (isAuthenticated && user?.role && user.role !== "client") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  // ── SSO via Electron IPC (bartender://auth?t=<token>) ──────────
  // El main process canjea el OTP y emite "auth:sso".
  useEffect(() => {
    const api = (window as any).electronAPI;
    if (!api?.sso?.onToken) return;

    setSsoLoading(true);

    const cleanup = api.sso.onToken((payload: {
      success: boolean;
      token?: string;
      refreshToken?: string;
      user?: { _id: string; name: string; email: string; role: string; isEmployee?: boolean; shift?: string | null };
      error?: string;
    }) => {
      setSsoLoading(false);

      if (!payload.success || !payload.token || !payload.user) {
        setError(payload.error || "El acceso automático expiró. Iniciá sesión manualmente.");
        return;
      }

      if (payload.user.role === "client") {
        setError("Esta cuenta es de cliente. Iniciá sesión en la web del bar.");
        return;
      }

      saveTokens(payload.token, payload.refreshToken || payload.token);
      setAuthToken(payload.token);
      setAuth(payload.token, payload.user as any, payload.refreshToken);
      navigate("/dashboard");
    });

    const timeout = setTimeout(() => { setSsoLoading(false); }, 10_000);

    return () => {
      cleanup?.();
      clearTimeout(timeout);
    };
  }, [navigate, setAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError("Completá todos los campos"); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  // ── SSO loading screen ──────────────────────────────────────────
  if (ssoLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#030209] text-white">
        <div className="absolute inset-0 z-0"><div className="nebula-aurora" /></div>
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <Loader2 size={48} className="animate-spin text-violet-400" />
          <div>
            <p className="text-lg font-bold tracking-widest text-violet-300 uppercase">
              Iniciando sesión automática…
            </p>
            <p className="text-xs text-violet-400/50 mt-2 font-medium tracking-wider">
              Recibiendo credenciales desde Nebula
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#030209] overflow-hidden text-white">
      <div className="absolute inset-0 z-0">
        <div className="nebula-aurora" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-4">
        <div className="rounded-[2.2rem] border border-violet-500/20 bg-slate-950/75 backdrop-blur-2xl shadow-[0_0_80px_rgba(139,92,246,0.15)] p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-widest bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(167,139,250,0.3)]">
              BARTENDER
            </h1>
            <p className="text-xs text-violet-300/60 font-bold tracking-widest mt-2 uppercase">
              NEBULA_ACCESS_TERMINAL
            </p>
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent mt-4" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900/60 border border-violet-500/10 text-white placeholder:text-gray-500 outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 text-sm font-bold tracking-wide"
            />

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3.5 pr-10 rounded-xl bg-slate-900/60 border border-violet-500/10 text-white placeholder:text-gray-500 outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 text-sm font-bold tracking-wide"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-violet-400 transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-xl font-medium tracking-wide animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white hover:shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed tracking-widest text-xs uppercase"
            >
              {loading ? "Conectando..." : "Iniciar Sesión"}
            </button>
          </form>

          <p className="text-center text-[10px] text-violet-400/40 tracking-widest mt-8 uppercase font-bold">
            Secure Bar Control • Nebula Core v3.0
          </p>
        </div>
      </div>
    </div>
  );
}

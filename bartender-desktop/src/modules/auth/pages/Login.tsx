import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { saveToken } from "../../../utils/tokenStorage";
import { setAuthToken } from "../../../services/api";

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

  // Manejar callback de OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const refreshTokenParam = urlParams.get('refreshToken');
    const errorParam = urlParams.get('error');

    if (tokenParam && refreshTokenParam) {
      saveToken(refreshTokenParam);
      setAuthToken(tokenParam);
      
      // Obtener perfil del usuario
      fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenParam}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const { setAuth } = useAuthStore.getState();
            setAuth(tokenParam, data.data);
            navigate("/dashboard");
          }
        })
        .catch(err => {
          console.error('Error al obtener perfil:', err);
        });
      
      // Limpiar URL
      window.history.replaceState({}, '', '/login');
    } else if (errorParam) {
      setError('Error en autenticación con Google');
      window.history.replaceState({}, '', '/login');
    }
  }, [navigate]);

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
      // FIX: Use err?.message since Axios interceptor already normalized the error object to have a 'message' property
      setError(err?.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/google`, {
        method: 'GET',
        headers: {
          'X-Platform': 'desktop',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        // Redirigir a Google OAuth
        window.location.href = data.authorizationUrl;
      } else {
        setError(data.message || 'Error al iniciar OAuth');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar OAuth');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#030209] overflow-hidden text-white">

      {/* ================= BACKGROUND NEBULA AURORA DRIFT ================= */}
      <div className="absolute inset-0 z-0">
        <div className="nebula-aurora" />
        
        {/* Subtle background space noise */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* ================= LOGIN GLASS CARD ================= */}
      <div className="relative z-10 w-full max-w-md p-4">

        <div className="rounded-[2.2rem] border border-violet-500/20 bg-slate-950/75 backdrop-blur-2xl shadow-[0_0_80px_rgba(139,92,246,0.15)] p-8 relative overflow-hidden group">
          
          {/* Neon top border border gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-widest bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(167,139,250,0.3)]">
              BARTENDER
            </h1>

            <p className="text-xs text-violet-300/60 font-bold tracking-widest mt-2 uppercase">
              NEBULA_ACCESS_TERMINAL
            </p>

            {/* TOP LINE */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent mt-4" />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900/60 border border-violet-500/10 text-white placeholder:text-gray-500 outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 text-sm font-bold tracking-wide"
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* ERROR */}
            {error && (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-xl font-medium tracking-wide animate-shake">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold transition-all duration-300
              bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white hover:shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed tracking-widest text-xs uppercase"
            >
              {loading ? "Conectando..." : "Iniciar Sesión"}
            </button>

            {/* DIVIDER */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-violet-500/20" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-950/75 px-3 text-violet-400/60 font-bold tracking-widest uppercase">o continuar con</span>
              </div>
            </div>

            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold transition-all duration-300
              border border-violet-500/20 bg-slate-900/60 text-white hover:bg-slate-800/60 hover:border-violet-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]
              disabled:opacity-50 disabled:cursor-not-allowed tracking-widest text-xs uppercase flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Google
            </button>
          </form>

          {/* FOOTER HINT */}
          <p className="text-center text-[10px] text-violet-400/40 tracking-widest mt-8 uppercase font-bold">
            Secure Bar Control • Nebula Core v3.0
          </p>

        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginRequest, registerRequest } from "@/lib/api/bartender";
import { destinationAfterLogin, roleLabel } from "@/lib/auth/roles";
import { useClienteStore } from "@/stores/useClienteStore";
import { Loader2, LogOut } from "lucide-react";
import clsx from "clsx";
import ui from "../cliente-ui.module.css";
import { saveAccessToken, saveRefreshToken } from "@/lib/auth/tokenStorage";

export default function CuentaPage() {
  const router = useRouter();
  const { token, user, setAuth, logout } = useClienteStore();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onGoogleLogin() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: 'GET',
        headers: {
          'X-Platform': 'web',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        // Redirigir a Google OAuth
        window.location.href = data.authorizationUrl;
      } else {
        setMessage(data.message || 'Error al iniciar OAuth');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error al iniciar OAuth');
    } finally {
      setLoading(false);
    }
  }

  // Manejar callback de OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const refreshTokenParam = urlParams.get('refreshToken');
    const errorParam = urlParams.get('error');

    if (tokenParam && refreshTokenParam) {
      saveAccessToken(tokenParam);
      saveRefreshToken(refreshTokenParam);
      
      // Obtener perfil del usuario
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenParam}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAuth(tokenParam, data.data);
            router.push(destinationAfterLogin(data.data.role));
          }
        })
        .catch(err => {
          console.error('Error al obtener perfil:', err);
        });
      
      // Limpiar URL
      window.history.replaceState({}, '', '/cliente/cuenta');
    } else if (errorParam) {
      setMessage('Error en autenticación con Google');
      window.history.replaceState({}, '', '/cliente/cuenta');
    }
  }, [router, setAuth]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { token: t, user: u } = await loginRequest(email, password);
      setAuth(t, u);
      router.push(destinationAfterLogin(u.role));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { token: t, user: u } = await registerRequest(name, email, password);
      setAuth(t, u);
      router.push(destinationAfterLogin(u.role));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  if (token && user) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className={clsx(ui.pageTitle, "font-display")}>Tu cuenta</h1>
        <div className={clsx(ui.section, ui.card)}>
          <div className={ui.cardInner}>
            <p className={ui.label}>Nombre</p>
            <p className="text-lg text-foreground">{user.name}</p>
            <p className={clsx(ui.label, "mt-4")}>Email</p>
            <p className="text-foreground">{user.email}</p>
            <p className={clsx(ui.label, "mt-4")}>Rol</p>
            <p className="text-foreground">{roleLabel(user.role)}</p>
            <button
              type="button"
              onClick={() => logout()}
              className={clsx(ui.btnGhost, "mt-8 w-full py-3")}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </div>
        <p className={clsx(ui.section, "text-center text-sm text-muted")}>
          <Link href={destinationAfterLogin(user.role)} className={ui.linkGold}>
            Ir a mi panel
          </Link>
          {user.role === "client" && (
            <>
              {" · "}
              <Link href="/cliente/pedido" className={ui.linkGold}>
                Pedidos
              </Link>
              {" · "}
              <Link href="/cliente/ruleta" className={ui.linkGold}>
                Ruleta
              </Link>
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className={clsx(ui.pageTitle, "font-display")}>Acceso cliente</h1>
      <p className={clsx(ui.lead, "font-sans")}>
        El registro público crea rol <strong className="text-foreground">client</strong>
        , válido para <code>POST /orders</code> y <code>POST /roulette/spin</code>.
        Personal y admin deben usar la{" "}
        <Link href="/" className={ui.linkGold}>
          entrada principal
        </Link>
        .
      </p>

      <div className={ui.segment}>
        <button
          type="button"
          className={tab === "login" ? ui.segmentBtnActive : ui.segmentBtn}
          onClick={() => setTab("login")}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          className={tab === "register" ? ui.segmentBtnActive : ui.segmentBtn}
          onClick={() => setTab("register")}
        >
          Registrarse
        </button>
      </div>

      {message && (
        <p
          className={clsx(
            ui.section,
            message.includes("correctamente") || message.includes("Cuenta creada")
              ? ui.alertSuccess
              : ui.alertError,
          )}
        >
          {message}
        </p>
      )}

      {tab === "login" ? (
        <form onSubmit={onLogin} className="mt-8 space-y-4">
          <div className={ui.field}>
            <label htmlFor="email" className={ui.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={ui.input}
            />
          </div>
          <div className={ui.field}>
            <label htmlFor="password" className={ui.label}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={ui.input}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={clsx(ui.btnPrimary, "w-full py-3")}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            Entrar
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted">o continuar con</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={loading}
            className={clsx(
              "w-full py-3 flex items-center justify-center gap-3",
              "border border-border rounded-md",
              "bg-background hover:bg-muted/50 transition-colors",
              "text-foreground font-medium"
            )}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
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
      ) : (
        <form onSubmit={onRegister} className="mt-8 space-y-4">
          <div className={ui.field}>
            <label htmlFor="name" className={ui.label}>
              Nombre
            </label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={ui.input}
            />
          </div>
          <div className={ui.field}>
            <label htmlFor="remail" className={ui.label}>
              Email
            </label>
            <input
              id="remail"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={ui.input}
            />
          </div>
          <div className={ui.field}>
            <label htmlFor="rpassword" className={ui.label}>
              Contraseña (mín. 6)
            </label>
            <input
              id="rpassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={ui.input}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={clsx(ui.btnPrimary, "w-full py-3")}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            Crear cuenta
          </button>
        </form>
      )}
    </div>
  );
}

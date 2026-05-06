"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginRequest, registerRequest } from "@/lib/api/bartender";
import { destinationAfterLogin, roleLabel } from "@/lib/auth/roles";
import { useClienteStore } from "@/stores/useClienteStore";
import { Loader2, LogOut } from "lucide-react";
import clsx from "clsx";
import ui from "../cliente-ui.module.css";

export default function CuentaPage() {
  const router = useRouter();
  const { token, user, setAuth, logout } = useClienteStore();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

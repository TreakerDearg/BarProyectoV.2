"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest, registerRequest } from "@/lib/api/bartender";
import { destinationAfterLogin } from "@/lib/auth/roles";
import { useClienteStore } from "@/stores/useClienteStore";
import { Loader2, X } from "lucide-react";
import clsx from "clsx";

type Tab = "cliente" | "staff";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Al abrir desde "Crear cuenta" */
  initialTab?: Tab;
  initialClienteSub?: "login" | "register";
};

export function AuthDialog({
  open,
  onClose,
  initialTab = "cliente",
  initialClienteSub = "login",
}: Props) {
  const router = useRouter();
  const setAuth = useClienteStore((s) => s.setAuth);

  const [tab, setTab] = useState<Tab>(initialTab);
  const [clienteSub, setClienteSub] = useState<"login" | "register">(
    initialClienteSub,
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setClienteSub(initialClienteSub);
      setError(null);
    }
  }, [open, initialTab, initialClienteSub]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function goAfterAuth(role: string) {
    router.push(destinationAfterLogin(role));
    onClose();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await loginRequest(email, password);
      setAuth(token, user);
      goAfterAuth(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await registerRequest(name, email, password);
      setAuth(token, user);
      goAfterAuth(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-dialog-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-surface shadow-2xl ring-1 ring-white/10"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 id="auth-dialog-title" className="font-display text-xl font-semibold text-foreground">
            Acceso
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex rounded-full bg-bg-deep p-1 ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => {
                setTab("cliente");
                setError(null);
              }}
              className={clsx(
                "flex-1 rounded-full py-2.5 text-sm font-medium transition",
                tab === "cliente"
                  ? "bg-surface-2 text-foreground shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              Cliente
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("staff");
                setError(null);
              }}
              className={clsx(
                "flex-1 rounded-full py-2.5 text-sm font-medium transition",
                tab === "staff"
                  ? "bg-surface-2 text-foreground shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              Personal / Admin
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            {tab === "cliente" ? (
              <>
                Las cuentas nuevas desde la web son siempre{" "}
                <strong className="text-foreground">cliente</strong> (pedidos,
                ruleta, reservas).
              </>
            ) : (
              <>
                Empleados y administradores usan las credenciales creadas en el
                sistema. Tras entrar, te llevamos al panel según tu rol.
              </>
            )}
          </p>
        </div>

        <div className="px-5 pb-6 pt-4">
          {error && (
            <p className="mb-4 rounded-xl border border-brand-red/40 bg-brand-red/10 px-3 py-2 text-sm text-brand-red-light">
              {error}
            </p>
          )}

          {tab === "staff" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="staff-email" className="text-sm text-muted">
                  Email corporativo
                </label>
                <input
                  id="staff-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-bg-deep px-4 py-3 text-foreground outline-none focus:border-gold/50"
                />
              </div>
              <div>
                <label htmlFor="staff-pass" className="text-sm text-muted">
                  Contraseña
                </label>
                <input
                  id="staff-pass"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-bg-deep px-4 py-3 text-foreground outline-none focus:border-gold/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-3 text-sm font-semibold text-foreground transition hover:bg-brand-red-light disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                Entrar al panel
              </button>
            </form>
          )}

          {tab === "cliente" && (
            <>
              <div className="mb-4 flex rounded-full bg-bg-deep p-1 ring-1 ring-white/10">
                <button
                  type="button"
                  onClick={() => setClienteSub("login")}
                  className={clsx(
                    "flex-1 rounded-full py-2 text-sm font-medium",
                    clienteSub === "login"
                      ? "bg-surface-2 text-foreground"
                      : "text-muted",
                  )}
                >
                  Ya tengo cuenta
                </button>
                <button
                  type="button"
                  onClick={() => setClienteSub("register")}
                  className={clsx(
                    "flex-1 rounded-full py-2 text-sm font-medium",
                    clienteSub === "register"
                      ? "bg-surface-2 text-foreground"
                      : "text-muted",
                  )}
                >
                  Crear cuenta
                </button>
              </div>

              {clienteSub === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="cl-email" className="text-sm text-muted">
                      Email
                    </label>
                    <input
                      id="cl-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-bg-deep px-4 py-3 text-foreground outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="cl-pass" className="text-sm text-muted">
                      Contraseña
                    </label>
                    <input
                      id="cl-pass"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-bg-deep px-4 py-3 text-foreground outline-none focus:border-gold/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-bg-deep transition hover:bg-gold-light disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : null}
                    Entrar
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label htmlFor="reg-name" className="text-sm text-muted">
                      Nombre
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      minLength={2}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-bg-deep px-4 py-3 text-foreground outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-email" className="text-sm text-muted">
                      Email
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-bg-deep px-4 py-3 text-foreground outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-pass" className="text-sm text-muted">
                      Contraseña (mín. 6)
                    </label>
                    <input
                      id="reg-pass"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-bg-deep px-4 py-3 text-foreground outline-none focus:border-gold/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-bg-deep transition hover:bg-gold-light disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : null}
                    Crear cuenta cliente
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

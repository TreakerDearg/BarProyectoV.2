"use client";

// ─────────────────────────────────────────────────────────────────
// useAuth — hook centralizado de autenticación para el cliente web
//
// Wrapper sobre useClienteStore. Agrega:
//   - Lógica de Decision Engine (canAccess, identityStatus, employee)
//   - clearTokens() en logout
//   - refreshToken guardado en register
//   - Google OAuth initiation
//   - Mapeo de errores a mensajes humanos
// ─────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { useClienteStore } from "@/stores/useClienteStore";
import { saveAccessToken, saveRefreshToken, clearTokens } from "@/lib/auth/tokenStorage";
import { isStaffRole } from "@/lib/auth/roles";
import type { AuthUser, IdentityDecisionResponse } from "@/lib/types/api";

// ── Tipos ─────────────────────────────────────────────────────────

export type AuthTab = "login" | "register";

export interface EmployeeDecision {
  /** La ruta del Decision Engine (admin, desktop, etc.) */
  employeeDestination: string;
  identityStatus: string;
  identityStatusLabel: string;
  desktopAccessMessage: IdentityDecisionResponse["desktopAccessMessage"];
}

export type AuthError = string | null;

export interface UseAuthReturn {
  // Estado derivado del store
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  // Estado propio del hook
  loading: boolean;
  error: AuthError;
  /** Si != null, el usuario es empleado y hay que mostrar el EmployeeModal */
  employeeDecision: EmployeeDecision | null;
  // Acciones
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initiateGoogleOAuth: () => Promise<void>;
  /** Procesar respuesta del callback de OAuth (URL params) */
  processOAuthCallback: (params: URLSearchParams) => Promise<{ redirectTo: string } | null>;
  /** Después del EmployeeModal: el usuario eligió continuar como cliente */
  continueAsClient: () => void;
  /** Después del EmployeeModal: el usuario eligió ir al sistema de empleados */
  goToEmployeeSystem: () => string;
  clearError: () => void;
  clearEmployeeDecision: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────

function humanizeError(message: string | undefined, status?: number): string {
  if (!message && !status) return "Algo salió mal. Intentá de nuevo.";

  const msg = (message ?? "").toLowerCase();

  if (msg.includes("credenciales") || msg.includes("contraseña") || status === 401)
    return "El email o la contraseña no son correctos.";
  if (msg.includes("bloqueada") || msg.includes("locked"))
    return "Tu cuenta está bloqueada temporalmente. Intentá más tarde.";
  if (msg.includes("inactiv"))
    return "Tu cuenta está desactivada. Contactá al soporte.";
  if (msg.includes("ya está registrado") || msg.includes("email") || status === 409)
    return "Ya existe una cuenta con ese email.";
  if (msg.includes("contraseña") && msg.includes("mínimo"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("network") || msg.includes("fetch"))
    return "No pudimos conectar con el servidor. Verificá tu conexión.";
  if (status === 500)
    return "Error en el servidor. Intentá en unos minutos.";

  // Si es un mensaje ya legible del backend, usarlo directamente
  if (message && message.length < 100 && !message.includes("Error:") && !message.includes("AxiosError"))
    return message;

  return "Algo salió mal. Intentá de nuevo.";
}

/** Determina si tras el login hay que mostrar el modal de empleado */
function buildEmployeeDecision(data: IdentityDecisionResponse): EmployeeDecision | null {
  if (!data.isEmployee && !isStaffRole(data.user.role)) return null;
  return {
    employeeDestination: data.destination || "/admin",
    identityStatus: data.identityStatus,
    identityStatusLabel: data.identityStatusLabel,
    desktopAccessMessage: data.desktopAccessMessage,
  };
}

// ── Hook ──────────────────────────────────────────────────────────

export function useAuth(): UseAuthReturn {
  const { token, user, setAuth, logout: storeLogout } = useClienteStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError>(null);
  const [employeeDecision, setEmployeeDecision] = useState<EmployeeDecision | null>(null);

  // ── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setEmployeeDecision(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Platform": "web",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: IdentityDecisionResponse = await res.json();

      if (!data.success) {
        setError(humanizeError(data.message, res.status));
        return;
      }

      // Guardar tokens
      saveAccessToken(data.token);
      saveRefreshToken(data.refreshToken);

      // Convertir user del engine (usa id) a AuthUser (usa _id)
      const authUser: AuthUser = {
        _id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };
      setAuth(data.token, authUser);

      // Cuenta bloqueada / inactiva
      if (!data.canAccess && data.blockMessage) {
        setError(humanizeError(data.blockMessage.message));
        return;
      }

      // Empleado → mostrar modal
      const decision = buildEmployeeDecision(data);
      if (decision) {
        setEmployeeDecision(decision);
        return; // No redirigir automáticamente — el modal lo maneja
      }

      // Cliente normal → señal de éxito sin redirección (el caller redirige)
    } catch (e) {
      setError(humanizeError(e instanceof Error ? e.message : undefined));
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  // ── Register ─────────────────────────────────────────────────────
  const register = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Platform": "web",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!data.success && !data.token) {
        setError(humanizeError(data.message, res.status));
        return;
      }

      // Registro devuelve token+user directo (no Decision Engine)
      const rawToken = data.data?.token ?? data.token;
      const rawUser = data.data?.user ?? data.user;

      if (!rawToken || !rawUser) {
        setError("No pudimos completar el registro. Intentá de nuevo.");
        return;
      }

      saveAccessToken(rawToken);
      // Registro no devuelve refreshToken — guardar null (el interceptor Axios lo manejará)

      const authUser: AuthUser = {
        _id: rawUser._id ?? rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        role: rawUser.role ?? "client",
      };
      setAuth(rawToken, authUser);
    } catch (e) {
      setError(humanizeError(e instanceof Error ? e.message : undefined));
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  // ── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearTokens(); // Limpiar localStorage (fix del bug original)
    storeLogout(); // Limpiar Zustand
    setEmployeeDecision(null);
    setError(null);
  }, [storeLogout]);

  // ── Google OAuth ─────────────────────────────────────────────────
  const initiateGoogleOAuth = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: "GET",
        headers: { "X-Platform": "web" },
      });
      const data = await res.json();
      const authUrl = data.data?.authorizationUrl ?? data.authorizationUrl;

      if (authUrl) {
        window.location.href = authUrl;
      } else {
        setError("No se pudo iniciar la autenticación con Google.");
      }
    } catch {
      setError("No se pudo conectar con Google. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Procesar callback OAuth ───────────────────────────────────────
  const processOAuthCallback = useCallback(async (
    params: URLSearchParams
  ): Promise<{ redirectTo: string } | null> => {
    const tokenParam       = params.get("token");
    const refreshTokenParam = params.get("refreshToken");
    const destinationParam  = params.get("destination");
    const canAccessParam    = params.get("canAccess");
    const identityStatus    = params.get("identityStatus");
    const isEmployeeParam   = params.get("isEmployee");
    const error             = params.get("error");

    if (error || !tokenParam || !refreshTokenParam) return null;

    saveAccessToken(tokenParam);
    saveRefreshToken(refreshTokenParam);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenParam}` },
      });
      const data = await res.json();
      if (!data.success) return null;

      const authUser: AuthUser = {
        _id: data.data._id ?? data.data.id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role,
      };
      setAuth(tokenParam, authUser);

      // Detectar empleado desde params del callback
      const employeeFromEngine = isEmployeeParam === "true" || isStaffRole(authUser.role);
      if (employeeFromEngine && canAccessParam !== "false") {
        setEmployeeDecision({
          employeeDestination: destinationParam || "/admin",
          identityStatus: identityStatus || "EMPLOYEE",
          identityStatusLabel: identityStatus || "Empleado",
          desktopAccessMessage: null,
        });
        return null; // El modal se encarga de la redirección
      }

      // Fuera de turno → off-shift
      if (identityStatus === "EMPLOYEE_OFF_SHIFT") {
        return { redirectTo: "/auth/off-shift" };
      }

      return { redirectTo: destinationParam || "/cliente" };
    } catch {
      return null;
    }
  }, [setAuth]);

  // ── Acciones del EmployeeModal ─────────────────────────────────────
  const continueAsClient = useCallback(() => {
    setEmployeeDecision(null);
    // El caller redirige a /cliente
  }, []);

  const goToEmployeeSystem = useCallback((): string => {
    const dest = employeeDecision?.employeeDestination ?? "/admin";
    setEmployeeDecision(null);
    return dest;
  }, [employeeDecision]);

  return {
    isAuthenticated: !!token && !!user,
    user: user ?? null,
    token: token ?? null,
    loading,
    error,
    employeeDecision,
    login,
    register,
    logout,
    initiateGoogleOAuth,
    processOAuthCallback,
    continueAsClient,
    goToEmployeeSystem,
    clearError: () => setError(null),
    clearEmployeeDecision: () => setEmployeeDecision(null),
  };
}

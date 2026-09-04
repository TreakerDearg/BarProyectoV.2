"use client";

// ─────────────────────────────────────────────────────────────────
// useAuth — hook centralizado de autenticación para el cliente web
// ─────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { useClienteStore } from "@/stores/useClienteStore";
import { saveAccessToken, saveRefreshToken, clearTokens } from "@/lib/auth/tokenStorage";
import { isStaffRole } from "@/lib/auth/roles";
import { resolveApiBaseUrl, resolveEmployeeSystemUrl } from "@/lib/api/network";
import type { AuthUser, IdentityDecisionResponse } from "@/lib/types/api";

// ── Tipos ─────────────────────────────────────────────────────────

export type AuthTab = "login" | "register";

export interface EmployeeDecision {
  employeeDestination: string;
  identityStatus: string;
  identityStatusLabel: string;
  desktopAccessMessage: IdentityDecisionResponse["desktopAccessMessage"];
}

export type AuthError = string | null;

export interface UseAuthReturn {
  isAuthenticated: boolean;
  user:            AuthUser | null;
  token:           string | null;
  loading:         boolean;
  error:           AuthError;
  employeeDecision: EmployeeDecision | null;
  login:           (email: string, password: string) => Promise<void>;
  register:        (name: string, email: string, password: string) => Promise<void>;
  logout:          () => void;
  initiateGoogleOAuth:  () => Promise<void>;
  processOAuthCallback: (params: URLSearchParams) => Promise<{ redirectTo: string } | null>;
  continueAsClient:     () => void;
  goToEmployeeSystem:   () => Promise<string>;
  clearError:           () => void;
  clearEmployeeDecision:() => void;
}

// ── Helpers ───────────────────────────────────────────────────────

function humanizeError(message: string | undefined, status?: number): string {
  if (!message && !status) return "Algo salió mal. Intentá de nuevo.";
  const msg = (message ?? "").toLowerCase();

  if (msg.includes("google") || msg.includes("fue creada con"))
    return message!;
  if (msg.includes("credenciales") || msg.includes("contraseña") || status === 401)
    return "El email o la contraseña no son correctos.";
  if (msg.includes("bloqueada") || msg.includes("locked"))
    return "Tu cuenta está bloqueada temporalmente.";
  if (msg.includes("inactiv"))
    return "Tu cuenta está desactivada. Contactá al soporte.";
  if (msg.includes("ya está registrado") || msg.includes("email") || status === 409)
    return "Ya existe una cuenta con ese email.";
  if (msg.includes("contraseña") && msg.includes("mínimo"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("network") || msg.includes("fetch"))
    return "No pudimos conectar con el servidor.";
  if (status === 500)
    return "Error en el servidor. Intentá en unos minutos.";
  if (message && message.length < 100 && !message.includes("Error:") && !message.includes("AxiosError"))
    return message;
  return "Algo salió mal. Intentá de nuevo.";
}

function apiAuthUrl(path: string): string {
  return `${resolveApiBaseUrl()}${path}`;
}

/**
 * Extrae los campos del payload de identidad.
 * El backend envuelve la respuesta en { success, data }.
 * Soporta ambos formatos: plano y envuelto.
 */
function unwrapIdentity(raw: any): IdentityDecisionResponse {
  // Si el backend usa ok(res, identityDecision) → { success, data: {...} }
  // Si hay serialización doble  → { success, data: { success, data: {...} } }
  const payload = raw?.data ?? raw;
  return payload as IdentityDecisionResponse;
}

/**
 * Extrae el user normalizado a AuthUser desde cualquier forma del payload.
 * Soporta: payload.user.id, payload.user._id
 */
function extractAuthUser(payload: any): AuthUser | null {
  const rawUser = payload?.user;
  if (!rawUser) return null;

  const id = rawUser._id ?? rawUser.id;
  if (!id) return null;

  return {
    _id:    String(id),
    name:   rawUser.name   ?? "",
    email:  rawUser.email  ?? "",
    role:   rawUser.role   ?? "client",
    phone:  rawUser.phone  ?? null,
    avatar: rawUser.avatar ?? null,
  };
}

function buildEmployeeDecision(data: IdentityDecisionResponse): EmployeeDecision | null {
  if (data.user?.role === "client") return null;
  if (!data.isEmployee) return null;
  return {
    employeeDestination: data.destination || "/admin",
    identityStatus:      data.identityStatus,
    identityStatusLabel: data.identityStatusLabel,
    desktopAccessMessage: data.desktopAccessMessage,
  };
}

// ── Hook ──────────────────────────────────────────────────────────

export function useAuth(): UseAuthReturn {
  const { token, user, setAuth, logout: storeLogout } = useClienteStore();

  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState<AuthError>(null);
  const [employeeDecision, setEmployeeDecision] = useState<EmployeeDecision | null>(null);

  // ── Login ─────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setEmployeeDecision(null);

    try {
      const res = await fetch(apiAuthUrl("/auth/login"), {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-Platform": "web" },
        body:    JSON.stringify({ email, password }),
      });

      const raw = await res.json();

      // El backend usa ok(res, identityDecision) → { success: true, data: {...} }
      const data = unwrapIdentity(raw);

      // Verificar éxito a nivel HTTP
      if (!raw.success) {
        const msg = raw.message || raw.data?.message || data.message;
        setError(humanizeError(msg, res.status));
        return;
      }

      // Extraer tokens — pueden estar en la raíz del data o en data.data
      const accessToken  = data.token        || (raw.data?.token);
      const refreshTkn   = data.refreshToken || (raw.data?.refreshToken);

      if (!accessToken) {
        setError("No se recibió token de acceso.");
        return;
      }

      saveAccessToken(accessToken);
      if (refreshTkn) saveRefreshToken(refreshTkn);

      // Extraer usuario con guardia defensiva
      const authUser = extractAuthUser(data);
      if (!authUser) {
        setError("No se pudo obtener la información del usuario.");
        return;
      }

      setAuth(accessToken, authUser);

      // Cuenta bloqueada / inactiva
      if (!data.canAccess && data.blockMessage) {
        setError(humanizeError(data.blockMessage.message));
        return;
      }

      // Empleado → mostrar modal para que decida
      const decision = buildEmployeeDecision(data);
      if (decision) {
        setEmployeeDecision(decision);
        return;
      }

      // Cliente normal → éxito (el caller redirige)
    } catch (e) {
      setError(humanizeError(e instanceof Error ? e.message : undefined));
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  // ── Register ──────────────────────────────────────────────────
  const register = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiAuthUrl("/auth/register"), {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-Platform": "web" },
        body:    JSON.stringify({ name, email, password }),
      });

      const raw = await res.json();

      if (!raw.success && !raw.token && !raw.data?.token) {
        setError(humanizeError(raw.message, res.status));
        return;
      }

      // register devuelve { success, data: { token, user } } vía created()
      const rawToken = raw.data?.token ?? raw.token;
      const rawUser  = raw.data?.user  ?? raw.user;

      if (!rawToken || !rawUser) {
        setError("No pudimos completar el registro. Intentá de nuevo.");
        return;
      }

      saveAccessToken(rawToken);

      const authUser = extractAuthUser({ user: rawUser });
      if (!authUser) {
        setError("No se pudo obtener la información del usuario.");
        return;
      }

      setAuth(rawToken, authUser);
    } catch (e) {
      setError(humanizeError(e instanceof Error ? e.message : undefined));
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  // ── Logout ────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearTokens();
    storeLogout();
    setEmployeeDecision(null);
    setError(null);
  }, [storeLogout]);

  // ── Google OAuth ──────────────────────────────────────────────
  // IMPORTANTE: solo para clientes web. NO redirigir empleados al Desktop.
  // Los empleados acceden al Desktop desde el botón "Sistema de empleados"
  // en el LoginForm — que abre directamente la URL del Desktop sin OAuth.
  const initiateGoogleOAuth = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Enviamos X-Platform: web explícitamente para que el backend
      // genere un state con platform=web y nunca redirija a bartender://
      const res = await fetch(apiAuthUrl("/auth/google"), {
        method:  "GET",
        headers: { "X-Platform": "web", "X-Audience": "client" },
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

  // ── Procesar callback OAuth ───────────────────────────────────
  const processOAuthCallback = useCallback(async (
    params: URLSearchParams
  ): Promise<{ redirectTo: string } | null> => {
    const tokenParam        = params.get("token");
    const refreshTokenParam = params.get("refreshToken");
    const identityStatus    = params.get("identityStatus");
    const errorParam        = params.get("error");

    if (errorParam || !tokenParam || !refreshTokenParam) return null;

    saveAccessToken(tokenParam);
    saveRefreshToken(refreshTokenParam);

    try {
      const res  = await fetch(apiAuthUrl("/auth/me"), {
        headers: { Authorization: `Bearer ${tokenParam}` },
      });
      const raw  = await res.json();
      if (!raw.success) return null;

      // /auth/me devuelve el payload de perfil en raw.data
      const profileRaw = raw.data ?? raw;
      const authUser = extractAuthUser({ user: profileRaw });
      if (!authUser) return null;

      setAuth(tokenParam, authUser);

      // Cliente → siempre a /cliente/cuenta. Sin modal, sin preguntas.
      if (authUser.role === "client") {
        return { redirectTo: "/cliente/cuenta" };
      }

      // Bloqueado / inactivo → volver al login con mensaje
      if (identityStatus === "INACTIVE" || identityStatus === "LOCKED") {
        return { redirectTo: "/cliente/cuenta?error=account_blocked" };
      }

      // Empleado/Admin que accedió con Google desde la web →
      // mostrar el modal para que decida si continúa como cliente o va al Desktop.
      const dest = authUser.role === "admin" ? "/admin" : "/desktop";
      setEmployeeDecision({
        employeeDestination: dest,
        identityStatus:      identityStatus || "EMPLOYEE",
        identityStatusLabel: identityStatus || "Empleado",
        desktopAccessMessage: null,
      });
      return null; // El modal maneja la redirección

    } catch {
      return null;
    }
  }, [setAuth]);

  // ── Acciones del EmployeeModal ────────────────────────────────
  const continueAsClient = useCallback(() => {
    setEmployeeDecision(null);
  }, []);

  const goToEmployeeSystem = useCallback(async (): Promise<string> => {
    const dest = employeeDecision?.employeeDestination ?? "/admin";
    setEmployeeDecision(null);
    return resolveEmployeeSystemUrl(dest);
  }, [employeeDecision]);

  return {
    isAuthenticated: !!token && !!user,
    user:            user ?? null,
    token:           token ?? null,
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
    clearError:            () => setError(null),
    clearEmployeeDecision: () => setEmployeeDecision(null),
  };
}

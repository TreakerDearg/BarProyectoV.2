"use client";

// ─────────────────────────────────────────────────────────────────
// /cliente/cuenta — Autenticación + Cuenta del cliente
//
// Esta página unifica:
//   1. Login
//   2. Registro
//   3. Perfil del cliente autenticado
//   4. Detección de empleado (EmployeeModal)
//
// Arquitectura:
//   CuentaPage (composición)
//     → useAuth (lógica de auth sobre Zustand + tokenStorage)
//     → AuthLayout (contenedor visual)
//       → LoginForm / RegisterForm / AccountView
//     → EmployeeModal (modal de detección de empleado)
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "./components/AuthLayout";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { AccountView } from "./components/AccountView";
import { EmployeeModal } from "./components/EmployeeModal";

type Tab = "login" | "register";

export default function CuentaPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");

  const {
    isAuthenticated,
    user,
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
    clearError,
  } = useAuth();

  // ── Manejar callback de OAuth (legado, cuando el backend redirige a esta página)
  // El flujo principal va a /auth/callback, pero por compatibilidad también
  // manejamos el caso en que lleguen tokens en la URL de /cliente/cuenta.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hasToken = params.get("token");
    if (!hasToken) return;

    // Limpiar URL primero para no re-procesar en re-renders
    window.history.replaceState({}, "", "/cliente/cuenta");

    processOAuthCallback(params).then((result) => {
      if (result) {
        router.replace(result.redirectTo);
      }
      // Si result es null, el EmployeeModal ya está visible (manejado por useAuth)
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  // ── Acción: login correcto → redirigir
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      clearError();
      await login(email, password);
      // Si employeeDecision != null → el modal se muestra, no redirigimos
      // Si no hay decisión pendiente después del login, redirigimos
    },
    [login, clearError]
  );

  // Efecto: cuando login termina y no hay employeeDecision → redirigir a /cliente
  useEffect(() => {
    if (isAuthenticated && !employeeDecision && !loading) {
      // Solo redirigir si el usuario está en la página de auth
      // (no si ya estaba autenticado al entrar)
      const params = new URLSearchParams(window.location.search);
      if (!params.get("redirected")) {
        // Marcar para evitar redirect loop en perfil
      }
    }
  }, [isAuthenticated, employeeDecision, loading, router]);

  // ── Acción: register correcto → redirigir
  const handleRegister = useCallback(
    async (name: string, email: string, password: string) => {
      clearError();
      await register(name, email, password);
    },
    [register, clearError]
  );

  // useEffect que redirige a /cliente cuando se autentica como cliente normal
  // (después de login o registro exitoso, sin employeeDecision)
  const wasAuthenticated = isAuthenticated;
  useEffect(() => {
    // Solo redirigir si: se acaba de autenticar, no hay modal de empleado,
    // y no hay token en la URL (para no interferir con el callback handler)
    if (
      isAuthenticated &&
      !employeeDecision &&
      !loading &&
      typeof window !== "undefined" &&
      !new URLSearchParams(window.location.search).get("token")
    ) {
      // Si el usuario es cliente → /cliente
      // Si tiene rol de staff pero eligió continuar → ya fue manejado por EmployeeModal
      if (user?.role === "client") {
        router.replace("/cliente");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, employeeDecision, loading]);

  // ── Acciones del EmployeeModal
  const handleGoToSystem = useCallback(() => {
    const dest = goToEmployeeSystem();
    router.replace(dest);
  }, [goToEmployeeSystem, router]);

  const handleContinueAsClient = useCallback(() => {
    continueAsClient();
    router.replace("/cliente");
  }, [continueAsClient, router]);

  // ── Logout
  const handleLogout = useCallback(() => {
    logout();
    setTab("login");
    // No redirigir — quedamos en /cliente/cuenta con la vista de login
  }, [logout]);

  // ── Switch entre tabs (limpiar error)
  const switchToRegister = useCallback(() => {
    clearError();
    setTab("register");
  }, [clearError]);

  const switchToLogin = useCallback(() => {
    clearError();
    setTab("login");
  }, [clearError]);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  // Vista autenticada — perfil del cliente
  if (isAuthenticated && user && !employeeDecision) {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "40px 20px 80px",
          width: "100%",
        }}
      >
        <AccountView user={user} onLogout={handleLogout} />
      </div>
    );
  }

  // Vista de auth (login / registro) — usa AuthLayout de dos columnas
  return (
    <>
      <AuthLayout>
        {tab === "login" ? (
          <LoginForm
            loading={loading}
            error={error}
            onLogin={handleLogin}
            onGoogleLogin={initiateGoogleOAuth}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <RegisterForm
            loading={loading}
            error={error}
            onRegister={handleRegister}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </AuthLayout>

      {/* EmployeeModal — aparece sobre cualquier estado */}
      <EmployeeModal
        decision={employeeDecision}
        onGoToSystem={handleGoToSystem}
        onContinueAsClient={handleContinueAsClient}
      />
    </>
  );
}

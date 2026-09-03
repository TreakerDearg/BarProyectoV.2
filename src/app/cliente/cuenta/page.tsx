"use client";

// ─────────────────────────────────────────────────────────────────
// /cliente/cuenta — Autenticación + perfil
//
// Si el usuario YA está autenticado, se queda en esta página (AccountView).
// Solo redirige a /cliente inmediatamente después de un login/registro
// nuevo — no cuando entra a "Mi cuenta" desde el navbar.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
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
  const justSignedIn = useRef(false);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.get("token")) return;

    window.history.replaceState({}, "", "/cliente/cuenta");

    processOAuthCallback(params).then((result) => {
      if (result?.redirectTo && result.redirectTo !== "/cliente/cuenta") {
        router.replace(result.redirectTo);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      clearError();
      justSignedIn.current = true;
      await login(email, password);
    },
    [login, clearError]
  );

  const handleRegister = useCallback(
    async (name: string, email: string, password: string) => {
      clearError();
      justSignedIn.current = true;
      await register(name, email, password);
    },
    [register, clearError]
  );

  useEffect(() => {
    if (
      !justSignedIn.current ||
      !isAuthenticated ||
      employeeDecision ||
      loading ||
      user?.role !== "client"
    ) {
      return;
    }
    justSignedIn.current = false;
    router.replace("/cliente");
  }, [isAuthenticated, employeeDecision, loading, user?.role, router]);

  const handleGoToSystem = useCallback(() => {
    goToEmployeeSystem().then((dest) => {
      if (dest && dest !== "/cliente") {
        router.replace(dest);
      }
    });
  }, [goToEmployeeSystem, router]);

  const handleContinueAsClient = useCallback(() => {
    continueAsClient();
    router.replace("/cliente");
  }, [continueAsClient, router]);

  const handleLogout = useCallback(() => {
    logout();
    setTab("login");
  }, [logout]);

  const switchToRegister = useCallback(() => {
    clearError();
    setTab("register");
  }, [clearError]);

  const switchToLogin = useCallback(() => {
    clearError();
    setTab("login");
  }, [clearError]);

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
            onGoogleLogin={initiateGoogleOAuth}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </AuthLayout>

      <EmployeeModal
        decision={employeeDecision}
        onGoToSystem={handleGoToSystem}
        onContinueAsClient={handleContinueAsClient}
      />
    </>
  );
}

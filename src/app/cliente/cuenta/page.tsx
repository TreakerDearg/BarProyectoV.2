"use client";

// ─────────────────────────────────────────────────────────────────
// /cliente/cuenta — Autenticación + perfil
//
// Si el usuario ya está autenticado como cliente, se queda en esta página
// y ve AccountView. Si es empleado, se abre EmployeeModal.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { resolveEmployeeSystemUrl } from "@/lib/api/network";
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
      await login(email, password);
    },
    [login, clearError]
  );

  const handleRegister = useCallback(
    async (name: string, email: string, password: string) => {
      clearError();
      await register(name, email, password);
    },
    [register, clearError]
  );

  const handleGoToSystem = useCallback(() => {
    goToEmployeeSystem().then((dest) => {
      if (!dest) return;
      if (/^https?:\/\//i.test(dest)) {
        window.location.href = dest;
        return;
      }
      router.replace(dest);
    });
  }, [goToEmployeeSystem, router]);

  const handleOpenEmployeeSystem = useCallback(() => {
    window.location.href = resolveEmployeeSystemUrl();
  }, []);

  const handleContinueAsClient = useCallback(() => {
    continueAsClient();
    router.replace("/cliente/cuenta");
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
            onEmployeeSystemOpen={handleOpenEmployeeSystem}
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

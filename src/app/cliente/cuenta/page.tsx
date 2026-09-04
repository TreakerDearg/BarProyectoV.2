"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { resolveEmployeeSystemUrl } from "@/lib/api/network";
import { AuthLayout }    from "./components/AuthLayout";
import { LoginForm }     from "./components/LoginForm";
import { RegisterForm }  from "./components/RegisterForm";
import { AccountView }   from "./components/AccountView";
import { EmployeeModal } from "./components/EmployeeModal";

type Tab = "login" | "register";

export default function CuentaPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");

  // Cuando el empleado pulsa el botón "Empleado" sin hacer login,
  // mostramos el modal con una decisión estática (no viene del Decision Engine).
  const [showEmployeeEntryModal, setShowEmployeeEntryModal] = useState(false);

  const {
    isAuthenticated, user, loading, error,
    employeeDecision,
    login, register, logout,
    initiateGoogleOAuth, processOAuthCallback,
    continueAsClient, goToEmployeeSystem,
    clearError,
  } = useAuth();

  // Procesar callback de OAuth si hay token en la URL
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

  const handleLogin = useCallback(async (email: string, password: string) => {
    clearError();
    await login(email, password);
  }, [login, clearError]);

  const handleRegister = useCallback(async (name: string, email: string, password: string) => {
    clearError();
    await register(name, email, password);
  }, [register, clearError]);

  // Botón "Empleado" en LoginForm — muestra el modal sin hacer login primero.
  // El empleado puede elegir entre ir al Desktop o continuar como cliente.
  const handleEmployeeBtnClick = useCallback(() => {
    setShowEmployeeEntryModal(true);
  }, []);

  const handleGoToSystem = useCallback(() => {
    // Cerrar ambos modales
    setShowEmployeeEntryModal(false);
    // goToEmployeeSystem retorna la URL del sistema Desktop
    if (employeeDecision) {
      goToEmployeeSystem().then((dest) => {
        if (!dest) return;
        if (/^https?:\/\//i.test(dest)) {
          window.location.href = dest;
          return;
        }
        router.replace(dest);
      });
    } else {
      // Redirección directa al Desktop cuando viene del botón "Empleado"
      window.location.href = resolveEmployeeSystemUrl();
    }
  }, [employeeDecision, goToEmployeeSystem, router]);

  const handleContinueAsClient = useCallback(() => {
    setShowEmployeeEntryModal(false);
    continueAsClient();
    router.replace("/cliente/cuenta");
  }, [continueAsClient, router]);

  const handleLogout = useCallback(() => {
    logout();
    setTab("login");
  }, [logout]);

  const switchToRegister = useCallback(() => { clearError(); setTab("register"); }, [clearError]);
  const switchToLogin    = useCallback(() => { clearError(); setTab("login");    }, [clearError]);

  // Decidir qué decisión usar para el modal:
  // - Si viene del login (employeeDecision del hook) → esa tiene contexto real
  // - Si viene del botón "Empleado" (showEmployeeEntryModal) → decisión genérica
  const activeDecision = employeeDecision ?? (showEmployeeEntryModal
    ? {
        employeeDestination:  resolveEmployeeSystemUrl(),
        identityStatus:       "EMPLOYEE",
        identityStatusLabel:  "Empleado",
        desktopAccessMessage: null,
      }
    : null);

  // Vista autenticada
  if (isAuthenticated && user && !activeDecision) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 80px", width: "100%" }}>
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
            onEmployeeSystemOpen={handleEmployeeBtnClick}
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

      {/* Modal unificado — tanto para login de empleado como para el botón directo */}
      <EmployeeModal
        decision={activeDecision}
        onGoToSystem={handleGoToSystem}
        onContinueAsClient={handleContinueAsClient}
      />
    </>
  );
}

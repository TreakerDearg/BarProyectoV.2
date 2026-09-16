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
import styles from "./components/AccountView.module.css";

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
      // Solo redirigir si hay un redirectTo explícito y NO hay employeeDecision
      // (employeeDecision indica que debe mostrarse el modal para empleados)
      if (result?.redirectTo && result.redirectTo !== "/cliente/cuenta" && !employeeDecision) {
        router.replace(result.redirectTo);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeDecision]);

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

    if (employeeDecision) {
      goToEmployeeSystem().then((dest) => {
        if (!dest) return;
        // Redirigir directamente al sistema de empleados
        window.location.href = dest;
      });
    } else {
      // Redirección directa al Desktop cuando viene del botón "Empleado" sin login
      const dest = resolveEmployeeSystemUrl();
      window.location.href = dest;
    }
  }, [employeeDecision, goToEmployeeSystem]);

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
      <div className={styles.accountShell}>
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

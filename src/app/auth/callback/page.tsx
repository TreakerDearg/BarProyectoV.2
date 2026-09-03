"use client";

// ─────────────────────────────────────────────────────────────────
// /auth/callback — landing del redirect de Google OAuth
//
// El backend (googleCallback) redirige a:
//   FRONTEND_URL/auth/callback?token=...&refreshToken=...&destination=...
//   &canAccess=...&identityStatus=...&isEmployee=...
//
// Este componente:
//   1. Lee los params
//   2. Delega a useAuth.processOAuthCallback
//   3. Si hay EmployeeDecision → muestra EmployeeModal
//   4. Si no → redirige al destino correcto
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { EmployeeModal } from "@/app/cliente/cuenta/components/EmployeeModal";
import { AlertTriangle } from "lucide-react";
import styles from "./AuthCallback.module.css";

type CallbackStatus = "loading" | "employee_prompt" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();
  const {
    loading,
    error,
    employeeDecision,
    processOAuthCallback,
    goToEmployeeSystem,
    continueAsClient,
  } = useAuth();

  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");

    // Error devuelto por el backend
    if (errorParam || (!params.get("token"))) {
      setErrorMsg(
        errorParam === "desktop_client"
          ? "Esta cuenta es de cliente. Google creó o usó tu cuenta en la web del bar, no en Nebula."
          : errorParam === "oauth_error"
          ? "Error al autenticar con Google. Intentá de nuevo."
          : "La sesión de autenticación expiró o fue inválida."
      );
      setStatus("error");
      return;
    }

    // Limpiar URL
    window.history.replaceState({}, "", "/auth/callback");

    // Procesar callback
    processOAuthCallback(params).then((result) => {
      if (result) {
        // Redirigir al destino
        router.replace(result.redirectTo);
      } else if (error) {
        setErrorMsg(error);
        setStatus("error");
      }
      // Si result es null y no hay error → EmployeeModal ya está en useAuth state
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mostrar EmployeeModal cuando useAuth lo activa
  useEffect(() => {
    if (employeeDecision) {
      setStatus("employee_prompt");
    }
  }, [employeeDecision]);

  // Mostrar error si loading=false y hay error
  useEffect(() => {
    if (!loading && error && status === "loading") {
      setErrorMsg(error);
      setStatus("error");
    }
  }, [loading, error, status]);

  const handleGoToSystem = () => {
    goToEmployeeSystem().then((dest) => {
      // Si ya lanzamos bartender://, dest es "/cliente" — no hacemos redirect adicional.
      // Si es /admin u otro, navegamos.
      if (dest && dest !== "/cliente") {
        router.replace(dest);
      }
    });
  };

  const handleContinueAsClient = () => {
    continueAsClient();
    router.replace("/cliente");
  };

  // ── Estado de error ────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.errorIcon} aria-hidden="true">
            <AlertTriangle size={32} />
          </div>
          <h1 className={styles.errorTitle}>Error al iniciar sesión</h1>
          <p className={styles.errorDesc}>{errorMsg || "Algo salió mal con la autenticación."}</p>
          <a href="/cliente/cuenta" className={styles.retryLink}>
            Volver al login
          </a>
        </div>
      </div>
    );
  }

  // ── Estado de carga ────────────────────────────────────────────
  return (
    <>
      <div className={styles.wrapper} aria-label="Iniciando sesión con Google" role="status">
        <div className={styles.card}>
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.loadingText}>Iniciando sesión con Google…</p>
        </div>
      </div>

      {/* EmployeeModal — visible cuando useAuth detecta empleado */}
      <EmployeeModal
        decision={employeeDecision}
        onGoToSystem={handleGoToSystem}
        onContinueAsClient={handleContinueAsClient}
      />
    </>
  );
}

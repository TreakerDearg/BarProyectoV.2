"use client";

import { useEffect, useRef, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EmployeeDecision } from "@/hooks/useAuth";
import styles from "./EmployeeModal.module.css";

// ─────────────────────────────────────────────────────────────────
// EmployeeModal
//
// Aparece cuando un usuario con rol de empleado (bartender, waiter,
// cashier, kitchen, admin, etc.) inicia sesión desde la web.
//
// Les pregunta si quieren entrar al sistema Nebula (bartender-desktop /
// panel de admin) o continuar navegando como cliente.
// ─────────────────────────────────────────────────────────────────

interface EmployeeModalProps {
  decision: EmployeeDecision | null;
  onGoToSystem: () => void;      // → redirect al sistema de empleados
  onContinueAsClient: () => void; // → redirect a /cliente
}

const ROLE_LABELS: Record<string, string> = {
  EMPLOYEE:          "empleado",
  EMPLOYEE_WORKING:  "empleado activo",
  EMPLOYEE_OFF_SHIFT: "empleado fuera de turno",
  EMPLOYEE_BREAK:    "empleado en descanso",
  ADMIN:             "administrador",
  OWNER:             "propietario",
};

export const EmployeeModal = memo(function EmployeeModal({
  decision,
  onGoToSystem,
  onContinueAsClient,
}: EmployeeModalProps) {
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const isOpen = decision !== null;

  // Focus trap + Escape
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => primaryBtnRef.current?.focus(), 100);
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onContinueAsClient();
    };
    window.addEventListener("keydown", handler);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", handler);
    };
  }, [isOpen, onContinueAsClient]);

  // Bloquear scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const roleLabel = decision
    ? (ROLE_LABELS[decision.identityStatus] ?? "empleado")
    : "";

  const isOffShift = decision?.identityStatus === "EMPLOYEE_OFF_SHIFT";

  return (
    <AnimatePresence>
      {isOpen && decision && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onContinueAsClient}
            aria-hidden="true"
          />

          {/* Panel — bottom sheet mobile / modal desktop */}
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Detección de cuenta de empleado"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Drag handle mobile */}
            <div className={styles.dragHandle} aria-hidden="true" />

            {/* Ícono */}
            <div className={styles.iconWrapper} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Texto */}
            <div className={styles.body}>
              <h2 className={styles.title}>
                Detectamos que sos {roleLabel}
              </h2>

              <p className={styles.description}>
                {isOffShift
                  ? "Estás fuera de turno. Podés acceder al panel de Nebula o navegar como cliente."
                  : "Podés acceder al sistema Nebula para empleados o continuar como cliente."}
              </p>

              {/* Información extra de fuera de turno */}
              {isOffShift && decision.desktopAccessMessage && (
                <div className={styles.shiftInfo}>
                  <svg viewBox="0 0 20 20" fill="none" className={styles.shiftIcon} aria-hidden="true">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    {decision.desktopAccessMessage.message ?? "Tu próximo turno aún no comenzó."}
                  </span>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className={styles.actions}>
              <button
                ref={primaryBtnRef}
                type="button"
                className={styles.primaryAction}
                onClick={onGoToSystem}
              >
                <svg viewBox="0 0 24 24" fill="none" className={styles.actionIcon} aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8 21h8M12 17v4"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Ir al sistema Nebula
              </button>

              <button
                type="button"
                className={styles.secondaryAction}
                onClick={onContinueAsClient}
              >
                <svg viewBox="0 0 24 24" fill="none" className={styles.actionIcon} aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="9 22 9 12 15 12 15 22"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Continuar como cliente
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AuthError } from "@/hooks/useAuth";
import styles from "./AuthForms.module.css";

// ─────────────────────────────────────────────────────────────────
// RegisterForm
// ─────────────────────────────────────────────────────────────────

interface RegisterFormProps {
  loading: boolean;
  error: AuthError;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export function RegisterForm({
  loading,
  error,
  onRegister,
  onSwitchToLogin,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setConfirmError(null);

      if (password !== confirmPassword) {
        setConfirmError("Las contraseñas no coinciden.");
        return;
      }
      await onRegister(name, email, password);
    },
    [name, email, password, confirmPassword, onRegister]
  );

  const displayError = confirmError || error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Heading */}
      <div className={styles.heading}>
        <h1 className={styles.title}>Crear tu cuenta</h1>
        <p className={styles.subtitle}>
          Únite a Nebula y empezá a disfrutar la experiencia.
        </p>
      </div>

      {/* Error */}
      <AnimatePresence mode="wait">
        {displayError && (
          <motion.div
            className={styles.errorBanner}
            role="alert"
            aria-live="assertive"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg viewBox="0 0 20 20" fill="none" className={styles.errorIcon} aria-hidden="true">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6v4m0 3v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {displayError}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Nombre */}
        <div className={styles.field}>
          <label htmlFor="reg-name" className={styles.label}>Nombre</label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            required
            minLength={2}
            disabled={loading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            aria-required="true"
          />
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label htmlFor="reg-email" className={styles.label}>Email</label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            aria-required="true"
          />
        </div>

        {/* Contraseña */}
        <div className={styles.field}>
          <label htmlFor="reg-password" className={styles.label}>
            Contraseña
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputWithAction}
              aria-required="true"
              aria-describedby="reg-password-hint"
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" className={styles.eyeIcon} aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className={styles.eyeIcon} aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>
          <p id="reg-password-hint" className={styles.fieldHint}>
            Al menos 6 caracteres.
          </p>
        </div>

        {/* Confirmar contraseña */}
        <div className={styles.field}>
          <label htmlFor="reg-confirm" className={styles.label}>Confirmar contraseña</label>
          <input
            id="reg-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Repetí tu contraseña"
            required
            disabled={loading}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmError) setConfirmError(null);
            }}
            className={`${styles.input} ${confirmError ? styles.inputError : ""}`}
            aria-required="true"
            aria-invalid={confirmError ? "true" : undefined}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !name || !email || !password || !confirmPassword}
          className={styles.submitBtn}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className={styles.btnSpinner} aria-hidden="true" />
              Creando cuenta…
            </>
          ) : (
            "Crear cuenta"
          )}
        </button>
      </form>

      {/* Switch a login */}
      <p className={styles.switchText}>
        ¿Ya tenés cuenta?{" "}
        <button
          type="button"
          className={styles.switchLink}
          onClick={onSwitchToLogin}
        >
          Iniciar sesión
        </button>
      </p>
    </motion.div>
  );
}

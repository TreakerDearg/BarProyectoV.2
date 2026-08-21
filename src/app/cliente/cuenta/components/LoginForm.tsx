"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { AuthError } from "@/hooks/useAuth";
import styles from "./AuthForms.module.css";

// ─────────────────────────────────────────────────────────────────
// LoginForm
// ─────────────────────────────────────────────────────────────────

interface LoginFormProps {
  loading: boolean;
  error: AuthError;
  onLogin: (email: string, password: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  onSwitchToRegister: () => void;
}

export function LoginForm({
  loading,
  error,
  onLogin,
  onGoogleLogin,
  onSwitchToRegister,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onLogin(email, password);
    },
    [email, password, onLogin]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Heading */}
      <div className={styles.heading}>
        <h1 className={styles.title}>Bienvenido nuevamente</h1>
        <p className={styles.subtitle}>
          Entrá para continuar tu experiencia en Nebula.
        </p>
      </div>

      {/* Error */}
      <AnimatePresence mode="wait">
        {error && (
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
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Email */}
        <div className={styles.field}>
          <label htmlFor="login-email" className={styles.label}>
            Email
          </label>
          <input
            id="login-email"
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
          <div className={styles.labelRow}>
            <label htmlFor="login-password" className={styles.label}>
              Contraseña
            </label>
          </div>
          <div className={styles.inputWrapper}>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputWithAction}
              aria-required="true"
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              tabIndex={0}
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
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className={styles.submitBtn}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className={styles.btnSpinner} aria-hidden="true" />
              Ingresando…
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      {/* Divider + Google */}
      <div className={styles.divider} aria-hidden="true">
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>o continuar con</span>
        <span className={styles.dividerLine} />
      </div>

      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={loading}
        className={styles.googleBtn}
        aria-label="Continuar con Google"
      >
        {/* SVG de Google */}
        <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuar con Google
      </button>

      {/* Switch a registro */}
      <p className={styles.switchText}>
        ¿No tenés cuenta?{" "}
        <button
          type="button"
          className={styles.switchLink}
          onClick={onSwitchToRegister}
        >
          Crear cuenta
        </button>
      </p>
    </motion.div>
  );
}

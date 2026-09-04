"use client";

/**
 * TableCodeGate
 * Pantalla de bloqueo que aparece en la carta cuando el cliente
 * no tiene un tableCode activo en el store.
 *
 * Flujo:
 *   1. El empleado abre la mesa en el Desktop → se genera un código de 3 dígitos.
 *   2. El cliente ingresa ese código aquí.
 *   3. Se llama a GET /tables/code/:code → se obtiene tableId + sessionId.
 *   4. Se guarda en useClienteStore y se habilita la carta.
 *
 * El cliente también puede optar por "Continuar sin mesa" (modo visitante),
 * lo que permite ver la carta pero no hacer pedidos asociados a mesa.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, QrCode, ArrowRight, GlassWater } from "lucide-react";
import { getTableByCode } from "@/lib/api/bartender";
import { useClienteStore } from "@/stores/useClienteStore";
import styles from "./TableCodeGate.module.css";

interface Props {
  onUnlocked:    () => void;
  onSkip:        () => void;
}

export function TableCodeGate({ onUnlocked, onSkip }: Props) {
  const setTableSession = useClienteStore((s) => s.setTableSession);

  // Tres campos de un dígito
  const [digits,  setDigits]  = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const code = digits.join("");

  // Auto-submit cuando los 3 dígitos están completos
  useEffect(() => {
    if (code.length === 3 && !loading && !success) {
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleDigit = (idx: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1); // solo el último dígito
    setError(null);
    const next = [...digits];
    next[idx] = d;
    setDigits(next);
    // Mover foco al siguiente
    if (d && idx < 2) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) refs[idx - 1].current?.focus();
    if (e.key === "ArrowRight" && idx < 2) refs[idx + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 3);
    if (pasted.length === 0) return;
    const next = ["", "", ""];
    pasted.split("").forEach((c, i) => { if (i < 3) next[i] = c; });
    setDigits(next);
    // Enfocar el último campo llenado o el que sigue
    const lastIdx = Math.min(pasted.length, 2);
    refs[lastIdx].current?.focus();
  };

  const handleSubmit = useCallback(async () => {
    if (code.length !== 3) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTableByCode(code);
      setTableSession(data.tableId, data.sessionId, data.tableCode);
      setSuccess(true);
      // Pequeño delay para mostrar el estado de éxito antes de cerrar
      setTimeout(() => onUnlocked(), 900);
    } catch (e: any) {
      setError(e.message ?? "Código incorrecto. Pedile el código al empleado.");
      setDigits(["", "", ""]);
      setTimeout(() => refs[0].current?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }, [code, setTableSession, onUnlocked]);

  return (
    <motion.div
      className={styles.gate}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fondo decorativo */}
      <div className={styles.gateBackground} aria-hidden="true" />

      <motion.div
        className={styles.gateCard}
        initial={{ scale: 0.94, y: 20, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.06 }}
      >
        {/* Ícono */}
        <div className={styles.gateIcon} aria-hidden="true">
          {success
            ? <GlassWater size={36} />
            : <QrCode size={36} />}
        </div>

        <div className={styles.gateText}>
          <h1 className={styles.gateTitle}>
            {success ? "¡Mesa conectada!" : "Código de mesa"}
          </h1>
          <p className={styles.gateSub}>
            {success
              ? "La carta fue desbloqueada"
              : "Ingresá el código de 3 dígitos que te dio el empleado para acceder a la carta"}
          </p>
        </div>

        {/* Inputs de código */}
        {!success && (
          <div
            className={styles.codeRow}
            onPaste={handlePaste}
            role="group"
            aria-label="Código de mesa de 3 dígitos"
          >
            {digits.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="text"
                inputMode="numeric"
                pattern="\d"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`${styles.codeDigit} ${error ? styles.codeDigitError : d ? styles.codeDigitFilled : ""}`}
                aria-label={`Dígito ${i + 1} del código de mesa`}
                autoFocus={i === 0}
                disabled={loading}
                autoComplete="off"
              />
            ))}
          </div>
        )}

        {/* Estado success */}
        {success && (
          <motion.div
            className={styles.successBadge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <span className={styles.successDot} />
            Mesa activa
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.p
            className={styles.errorMsg}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
          >
            {error}
          </motion.p>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className={styles.loadingRow}>
            <Loader2 size={20} className="animate-spin" />
            <span>Verificando…</span>
          </div>
        )}

        {/* Skip */}
        {!success && !loading && (
          <button
            type="button"
            onClick={onSkip}
            className={styles.skipBtn}
          >
            Continuar sin mesa
            <ArrowRight size={14} />
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

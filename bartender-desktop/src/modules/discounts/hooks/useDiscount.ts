// hooks/useDiscount.ts - Sistema Nebula de Descuentos

import { useMemo, useState, useCallback } from "react";
import type {
    DiscountType,
    SelectedItem,
    DiscountReason,
} from "../types/discounts";

interface UseDiscountProps {
  items: SelectedItem[];
}

export function useDiscount({ items }: UseDiscountProps) {
  const [type, setType] = useState<DiscountType>("PERCENT");
  const [valueInput, setValueInput] = useState<string>("0");
  const [reason, setReason] = useState<DiscountReason>("WAIT_TIME");
  const [note, setNote] = useState("");
  const value = Number(valueInput || 0);

  /* =========================
     SUBTOTAL NEBULA
  ========================= */
  const subtotal = useMemo(() => {
    // Optimización: calcular solo si hay items seleccionados
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) return 0;
    
    return selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  /* =========================
     CÁLCULO DE DESCUENTO NEBULA
  ========================= */
  const discountAmount = useMemo(() => {
    // Optimización: calcular solo si hay subtotal
    if (subtotal === 0) return 0;
    
    if (type === "PERCENT") {
      return subtotal * (value / 100);
    }
    return value;
  }, [type, value, subtotal]);

  /* =========================
     TOTAL FINAL NEBULA
  ========================= */
  const finalTotal = useMemo(() => {
    return Math.max(subtotal - discountAmount, 0);
  }, [subtotal, discountAmount]);

  /* =========================
     VALIDACIONES NEBULA
  ========================= */
  const errors = useMemo(() => {
    const errs: string[] = [];

    const selectedItems = items.filter((i) => i.selected);

    // Validar que haya items seleccionados
    if (selectedItems.length === 0) {
      errs.push("Selecciona al menos un producto para aplicar el descuento");
    }

    // Validar valor del descuento
    if (value <= 0) {
      errs.push("El descuento debe ser mayor a 0");
    }

    // Validar porcentaje máximo
    if (type === "PERCENT" && value > 100) {
      errs.push("El porcentaje no puede exceder 100%");
    }

    // Validar que el descuento no exceda el subtotal
    if (discountAmount > subtotal && subtotal > 0) {
      errs.push(`El descuento ($${discountAmount.toFixed(2)}) no puede exceder el subtotal ($${subtotal.toFixed(2)})`);
    }

    // Validar que el valor sea un número válido
    if (isNaN(value) || !isFinite(value)) {
      errs.push("El valor del descuento no es válido");
    }

    return errs;
  }, [value, type, discountAmount, subtotal, items]);

  const isValid = errors.length === 0;

  /* =========================
     MANEJADORES DE TECLADO NEBULA
  ========================= */
  const appendNumber = useCallback((num: string) => {
    setValueInput((prev) => {
      if (num === "." && prev.includes(".")) return prev;
      if (prev === "0" && num !== ".") return num;
      return `${prev}${num}`;
    });
  }, []);

  const removeLast = useCallback(() => {
    setValueInput((prev) => {
      const next = prev.slice(0, -1);
      return next.length > 0 ? next : "0";
    });
  }, []);

  const reset = useCallback(() => {
    setValueInput("0");
    setNote("");
    setType("PERCENT");
    setReason("WAIT_TIME");
  }, []);

  /* =========================
     CONSTRUCTOR DE PAYLOAD NEBULA
  ========================= */
  const buildPayload = useCallback((orderId: string) => {
    const selectedItems = items
      .filter((i) => i.selected)
      .map((i) => i._id);

    return {
      orderId,
      items: selectedItems,
      type,
      value,
      reason,
      note,
    };
  }, [items, type, value, reason, note]);

  return {
    /* estado */
    type,
    value,
    valueInput,
    reason,
    note,

    /* setters */
    setType,
    setValue: setValueInput,
    setReason,
    setNote,

    /* calculados */
    subtotal,
    discountAmount,
    finalTotal,

    /* validación */
    errors,
    isValid,

    /* acciones */
    appendNumber,
    removeLast,
    reset,
    buildPayload,
  };
}
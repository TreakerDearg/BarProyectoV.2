// hooks/useDiscount.ts

import { useMemo, useState } from "react";
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
  const [value, setValue] = useState<number>(0);
  const [reason, setReason] = useState<DiscountReason>("WAIT_TIME");
  const [note, setNote] = useState("");

  /* =========================
     SUBTOTAL
  ========================= */
  const subtotal = useMemo(() => {
    return items
      .filter((i) => i.selected)
      .reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  /* =========================
     DISCOUNT CALCULATION
  ========================= */
  const discountAmount = useMemo(() => {
    if (type === "PERCENT") {
      return subtotal * (value / 100);
    }
    return value;
  }, [type, value, subtotal]);

  /* =========================
     FINAL TOTAL
  ========================= */
  const finalTotal = useMemo(() => {
    return Math.max(subtotal - discountAmount, 0);
  }, [subtotal, discountAmount]);

  /* =========================
     VALIDATIONS
  ========================= */
  const errors = useMemo(() => {
    const errs: string[] = [];

    if (value <= 0) errs.push("Discount must be greater than 0");

    if (type === "PERCENT" && value > 100)
      errs.push("Percentage cannot exceed 100%");

    if (discountAmount > subtotal)
      errs.push("Discount cannot exceed subtotal");

    if (subtotal === 0)
      errs.push("No items selected");

    return errs;
  }, [value, type, discountAmount, subtotal]);

  const isValid = errors.length === 0;

  /* =========================
     KEYPAD HANDLERS
  ========================= */
  const appendNumber = (num: string) => {
    setValue((prev) => Number(`${prev}${num}`));
  };

  const removeLast = () => {
    setValue((prev) => Number(prev.toString().slice(0, -1)) || 0);
  };

  const reset = () => {
    setValue(0);
    setNote("");
  };

  /* =========================
     PAYLOAD BUILDER
  ========================= */
  const buildPayload = (orderId: string) => {
    const selectedItems = items
      .filter((i) => i.selected)
      .map((i) => ({
        product: i.product,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));

    return {
      orderId,
      items: selectedItems,
      type,
      value,
      reason,
      note,
    };
  };

  return {
    /* state */
    type,
    value,
    reason,
    note,

    /* setters */
    setType,
    setValue,
    setReason,
    setNote,

    /* computed */
    subtotal,
    discountAmount,
    finalTotal,

    /* validation */
    errors,
    isValid,

    /* actions */
    appendNumber,
    removeLast,
    reset,
    buildPayload,
  };
}
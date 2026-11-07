"use client";

/**
 * PaymentMethodSelector — Modal de cobro tipo POS.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Layout 2 columnas:
 *   Izquierda: balance grande + resumen + vuelto en tiempo real
 *   Derecha:   grid de métodos + sub-formulario inline por método
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, DollarSign, Smartphone, Wallet,
  Split, X, Check, Sparkles,
} from "lucide-react";
import {
  getAvailablePaymentMethods,
  type PaymentMethodId,
  PaymentServiceError,
  getPaymentErrorMessage,
  isNetworkError,
} from "../services/tableService";
import DiscountModal from "./DiscountModal";

/* ── Tipos ─────────────────────────────────────────────────── */
interface PaymentMethod {
  _id:         string;
  method:      string;
  displayName: string;
  description: string;
  isActive:    boolean;
  isAvailable: boolean;
  priority:    number;
  icon?:       string;
}

type PaymentDetails = {
  amountPaid?:  number;
  totalSplits?: number;
  method?:      PaymentMethodId;
  cardDetails?: { lastFour: string; cardType: "visa" | "mastercard" | "amex" | "other" };
  notes?:       string;
};

interface Props {
  tableId:    string;
  sessionId:  string;
  orderId?:   string;
  balanceDue: number;
  tableNumber?: number;
  onSelect:   (method: PaymentMethodId, data?: PaymentDetails) => void;
  onClose:    () => void;
  onApplyDiscount?: (discount: { type: "PERCENT" | "FLAT"; value: number; reason: string; note?: string }) => void;
  discounts?: Array<{ amount: number; type: "PERCENT" | "FLAT"; reason: string; note?: string }>;
  subtotal?:  number;
}

/* ── Métodos por defecto ────────────────────────────────────── */
const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { _id: "cash-default",     method: "cash",     displayName: "Efectivo",        description: "Pago en efectivo",                   isActive: true, isAvailable: true, priority: 100 },
  { _id: "card-default",     method: "card",     displayName: "Tarjeta",         description: "Pago con tarjeta",                   isActive: true, isAvailable: true, priority: 90  },
  { _id: "transfer-default", method: "transfer", displayName: "Transferencia",   description: "Transferencia bancaria",             isActive: true, isAvailable: true, priority: 80  },
  { _id: "split-default",    method: "split",    displayName: "Dividir Cuenta",  description: "Dividir entre varias personas",      isActive: true, isAvailable: true, priority: 70  },
];

/* ── Input reutilizable con estilo dark ─────────────────────── */
function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl py-3 px-4 font-bold outline-none transition-all"
      style={{ background: "#293042", border: "1px solid #30363D", color: "#E6EDF3" }}
      onFocus={(e) => {
        (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(240,180,41,0.50)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D";
        props.onBlur?.(e);
      }}
    />
  );
}

/* ── Componente principal ───────────────────────────────────── */
export default function PaymentMethodSelector({
  tableId,
  sessionId,
  balanceDue,
  onSelect,
  onClose,
  onApplyDiscount,
  discounts = [],
  subtotal = balanceDue,
  tableNumber,
}: Props) {
  void tableId;
  void sessionId;

  const [methods,       setMethods]       = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [selectedMethod,setSelectedMethod]= useState<PaymentMethodId | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [cashAmountPaid,setCashAmountPaid]= useState(balanceDue);
  const [cardDetails,   setCardDetails]   = useState({
    lastFour: "",
    cardType: "other" as "visa" | "mastercard" | "amex" | "other",
  });
  const [splitDetails, setSplitDetails]   = useState({
    totalSplits: 2,
    method: "cash" as PaymentMethodId,
    amounts: [] as number[],
  });
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  useEffect(() => { setCashAmountPaid(balanceDue); }, [balanceDue]);
  useEffect(() => { fetchAvailableMethods(); }, []);

  /* ── Fetch métodos ──────────────────────────────────────────── */
  const fetchAvailableMethods = async () => {
    try {
      setLoading(true);
      const response   = await getAvailablePaymentMethods();
      const arr        = Array.isArray(response) ? response : [];
      if (arr.length > 0) {
        const converted = arr.map((m) => ({
          _id:         m.id,
          method:      m.id as PaymentMethodId,
          displayName: m.name,
          description: m.description,
          isActive:    !m.disabled,
          isAvailable: !m.disabled,
          priority:    100,
          icon:        m.icon,
        }));
        setMethods(converted.length ? converted : DEFAULT_PAYMENT_METHODS);
      } else {
        setMethods(DEFAULT_PAYMENT_METHODS);
      }
    } catch (error) {
      if (error instanceof PaymentServiceError)
        console.error("Payment Service Error:", getPaymentErrorMessage(error), isNetworkError(error));
      setMethods(DEFAULT_PAYMENT_METHODS);
    } finally {
      setLoading(false);
    }
  };

  /* ── Ícono por método ───────────────────────────────────────── */
  const getMethodIcon = (method: string) => {
    switch (method) {
      case "cash":     return DollarSign;
      case "transfer": return CreditCard;
      case "card":     return CreditCard;
      case "wallet":   return Smartphone;
      case "split":    return Split;
      default:         return Wallet;
    }
  };

  /* ── Handlers de pago ──────────────────────────────────────── */
  const handleCashPayment = () => {
    if (cashAmountPaid < balanceDue) {
      alert(`Monto insuficiente. Total: $${balanceDue.toFixed(2)}`);
      return;
    }
    onSelect("cash", { amountPaid: cashAmountPaid });
  };

  const handleCardPayment = () => {
    if (!cardDetails.lastFour || cardDetails.lastFour.length !== 4) {
      alert("Por favor ingresa los últimos 4 dígitos de la tarjeta");
      return;
    }
    onSelect("card", { cardDetails });
  };

  const handleSplitPayment = () => {
    if (splitDetails.totalSplits < 2) return;
    onSelect("split", { totalSplits: splitDetails.totalSplits, method: splitDetails.method });
  };

  const handleProcess = () => {
    if (!selectedMethod) return;
    switch (selectedMethod) {
      case "cash":     return handleCashPayment();
      case "card":     return handleCardPayment();
      case "split":    return handleSplitPayment();
      default:         return onSelect(selectedMethod);
    }
  };

  const handleApplyDiscount = (discount: { type: "PERCENT" | "FLAT"; value: number; reason: string; note?: string }) => {
    onApplyDiscount?.(discount);
    setIsDiscountModalOpen(false);
  };

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-2xl flex overflow-hidden rounded-2xl shadow-2xl"
        style={{ background: "#1C2333", border: "1px solid #30363D", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ══ IZQUIERDA — balance + resumen ══════════════════ */}
        <div
          className="w-64 flex-shrink-0 flex flex-col p-6 gap-4"
          style={{ background: "#161B22", borderRight: "1px solid #30363D" }}
        >
          {/* Identificador de mesa */}
          {tableNumber != null && (
            <div className="flex items-center gap-2">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0"
                style={{ background: "#F0B429", color: "#0D1117" }}
              >
                {tableNumber}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#F0B429" }}>
                  Mesa
                </p>
                <p className="text-xs" style={{ color: "#566270" }}>Cobro de sesión</p>
              </div>
            </div>
          )}

          {/* Monto a cobrar */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#566270" }}>
              Total a cobrar
            </p>
            <p className="text-4xl font-black leading-none" style={{ color: "#E6EDF3" }}>
              ${balanceDue.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Descuentos aplicados */}
          {discounts.length > 0 && (
            <div
              className="p-3 rounded-xl space-y-1.5"
              style={{ background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.20)" }}
            >
              <p className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: "rgba(240,180,41,0.60)" }}>
                Descuentos
              </p>
              {discounts.map((d, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span style={{ color: "#8B949E" }}>{d.reason}</span>
                  <span style={{ color: "#F0B429", fontWeight: 700 }}>−${d.amount.toFixed(2)}</span>
                </div>
              ))}
              <div
                className="flex justify-between pt-1.5 text-xs font-bold"
                style={{ borderTop: "1px solid rgba(240,180,41,0.15)", color: "#E6EDF3" }}
              >
                <span>Original</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Vuelto — efectivo */}
          {selectedMethod === "cash" && cashAmountPaid >= balanceDue && (
            <div
              className="p-3 rounded-xl"
              style={{ background: "rgba(63,185,80,0.08)", border: "1px solid rgba(63,185,80,0.25)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#566270" }}>
                Vuelto
              </p>
              <p className="text-3xl font-black" style={{ color: "#3FB950" }}>
                ${(cashAmountPaid - balanceDue).toFixed(2)}
              </p>
            </div>
          )}

          {/* Por persona — split */}
          {selectedMethod === "split" && splitDetails.totalSplits >= 2 && (
            <div
              className="p-3 rounded-xl"
              style={{ background: "rgba(163,113,247,0.08)", border: "1px solid rgba(163,113,247,0.25)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#566270" }}>
                Por persona
              </p>
              <p className="text-3xl font-black" style={{ color: "#A371F7" }}>
                ${(balanceDue / splitDetails.totalSplits).toFixed(2)}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "#566270" }}>
                {splitDetails.totalSplits} personas
              </p>
            </div>
          )}

          {/* Botón descuento (opcional) */}
          {onApplyDiscount && (
            <button
              type="button"
              onClick={() => setIsDiscountModalOpen(true)}
              className="mt-auto flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all"
              style={{ background: "rgba(240,180,41,0.08)", border: "1px solid rgba(240,180,41,0.20)", color: "#F0B429" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,180,41,0.15)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,180,41,0.08)"; }}
            >
              <Sparkles size={13} /> Descuento
            </button>
          )}
        </div>

        {/* ══ DERECHA — métodos + sub-form ═══════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-5 flex-shrink-0"
            style={{ borderBottom: "1px solid #30363D" }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#566270" }}>
                Forma de pago
              </p>
              <h2 className="text-lg font-bold" style={{ color: "#E6EDF3" }}>
                Selecciona un método
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "#21283A", border: "1px solid #30363D", color: "#566270" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
            >
              <X size={17} />
            </button>
          </div>

          {/* Contenido scrollable */}
          <div
            className="flex-1 overflow-y-auto p-6 space-y-4"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(240,180,41,0.30)", borderTopColor: "#F0B429" }}
                />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#566270" }}>
                  Cargando métodos…
                </p>
              </div>
            ) : (
              <>
                {/* Grid de métodos */}
                <div className="grid grid-cols-2 gap-3">
                  {methods
                    .filter((m) => m.isAvailable)
                    .sort((a, b) => b.priority - a.priority)
                    .map((method) => {
                      const Icon     = getMethodIcon(method.method);
                      const isActive = selectedMethod === method.method;
                      return (
                        <motion.button
                          key={method._id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedMethod(method.method as PaymentMethodId)}
                          className="relative p-4 rounded-xl flex flex-col items-center gap-3 transition-all"
                          style={{
                            background: isActive ? "rgba(240,180,41,0.15)" : "#21283A",
                            border:     `2px solid ${isActive ? "rgba(240,180,41,0.50)" : "#30363D"}`,
                            boxShadow:  isActive ? "0 0 16px rgba(240,180,41,0.12)" : "none",
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                            style={{
                              background: isActive ? "#F0B429" : "#293042",
                              color:      isActive ? "#0D1117" : "#8B949E",
                            }}
                          >
                            <Icon size={22} />
                          </div>
                          <p
                            className="text-xs font-black uppercase tracking-wide"
                            style={{ color: isActive ? "#E6EDF3" : "#8B949E" }}
                          >
                            {method.displayName}
                          </p>
                          {isActive && (
                            <div
                              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: "#F0B429" }}
                            >
                              <Check size={11} style={{ color: "#0D1117", strokeWidth: 3 }} />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                </div>

                {/* Sub-formulario según método */}
                <AnimatePresence mode="wait">
                  {selectedMethod && (
                    <motion.div
                      key={selectedMethod}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="rounded-xl p-5 space-y-4"
                      style={{ background: "#21283A", border: "1px solid #30363D" }}
                    >
                      {/* ── EFECTIVO ── */}
                      {selectedMethod === "cash" && (
                        <>
                          <p className="text-xs font-black uppercase tracking-wider" style={{ color: "#8B949E" }}>
                            Monto entregado por el cliente
                          </p>
                          <DarkInput
                            type="number"
                            min={balanceDue}
                            step="0.01"
                            value={cashAmountPaid}
                            onChange={(e) => setCashAmountPaid(parseFloat(e.target.value) || 0)}
                          />
                        </>
                      )}

                      {/* ── TARJETA ── */}
                      {selectedMethod === "card" && (
                        <>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#566270" }}>
                              Últimos 4 dígitos
                            </p>
                            <DarkInput
                              type="text"
                              maxLength={4}
                              value={cardDetails.lastFour}
                              placeholder="****"
                              onChange={(e) => setCardDetails({ ...cardDetails, lastFour: e.target.value })}
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#566270" }}>
                              Tipo de tarjeta
                            </p>
                            <select
                              value={cardDetails.cardType}
                              onChange={(e) => setCardDetails({ ...cardDetails, cardType: e.target.value as any })}
                              className="select-dark w-full"
                              style={{ colorScheme: "dark" }}
                            >
                              <option value="visa">Visa</option>
                              <option value="mastercard">Mastercard</option>
                              <option value="amex">American Express</option>
                              <option value="other">Otra</option>
                            </select>
                          </div>
                        </>
                      )}

                      {/* ── DIVIDIR ── */}
                      {selectedMethod === "split" && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#566270" }}>
                            Cantidad de personas
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setSplitDetails((p) => ({ ...p, totalSplits: Math.max(2, p.totalSplits - 1) }))}
                              className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl transition-colors flex-shrink-0"
                              style={{ background: "#293042", border: "1px solid #30363D", color: "#8B949E" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F85149"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
                            >
                              −
                            </button>
                            <span className="text-4xl font-black flex-1 text-center" style={{ color: "#A371F7" }}>
                              {splitDetails.totalSplits}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSplitDetails((p) => ({ ...p, totalSplits: Math.min(10, p.totalSplits + 1) }))}
                              className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl transition-colors flex-shrink-0"
                              style={{ background: "#293042", border: "1px solid #30363D", color: "#8B949E" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#3FB950"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── TRANSFERENCIA (sin campos extra) ── */}
                      {selectedMethod === "transfer" && (
                        <p className="text-sm text-center" style={{ color: "#8B949E" }}>
                          Confirma la transferencia recibida y presiona Procesar.
                        </p>
                      )}

                      {/* Botón procesar */}
                      <button
                        type="button"
                        onClick={handleProcess}
                        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        style={{ background: "#F0B429", color: "#0D1117", boxShadow: "0 4px 16px rgba(240,180,41,0.25)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F5C842"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0B429"; }}
                      >
                        <Check size={16} /> Procesar pago
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!selectedMethod && (
                  <p className="text-center text-xs" style={{ color: "#566270" }}>
                    Selecciona un método de pago para continuar
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal de descuento */}
      {isDiscountModalOpen && (
        <DiscountModal
          onApply={handleApplyDiscount}
          onClose={() => setIsDiscountModalOpen(false)}
        />
      )}
    </motion.div>
  );
}

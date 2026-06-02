"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, DollarSign, Smartphone, Wallet, Split, X, Check } from "lucide-react";
import {
  getAvailablePaymentMethods,
  PaymentServiceError,
  getPaymentErrorMessage,
  isNetworkError
} from "../services/tableService";

interface PaymentMethod {
  _id: string;
  method: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isAvailable: boolean;
  priority: number;
  icon?: string;
}

interface Props {
  tableId: string;
  sessionId: string;
  balanceDue: number;
  onSelect: (method: string, data?: any) => void;
  onClose: () => void;
}

// Métodos de pago por defecto en caso de error de API
const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    _id: "cash-default",
    method: "cash",
    displayName: "Efectivo",
    description: "Pago en efectivo",
    isActive: true,
    isAvailable: true,
    priority: 100,
  },
  {
    _id: "card-default",
    method: "card",
    displayName: "Tarjeta",
    description: "Pago con tarjeta de crédito/débito",
    isActive: true,
    isAvailable: true,
    priority: 90,
  },
  {
    _id: "transfer-default",
    method: "transfer",
    displayName: "Transferencia",
    description: "Transferencia bancaria",
    isActive: true,
    isAvailable: true,
    priority: 80,
  },
  {
    _id: "split-default",
    method: "split",
    displayName: "Dividir Cuenta",
    description: "Dividir la cuenta entre varias personas",
    isActive: true,
    isAvailable: true,
    priority: 70,
  },
];

export default function PaymentMethodSelector({
  tableId: _tableId,
  sessionId: _sessionId,
  balanceDue,
  onSelect,
  onClose,
}: Props) {
  const [methods, setMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cashAmountPaid, setCashAmountPaid] = useState(balanceDue);
  const [cardDetails, setCardDetails] = useState({
    lastFour: "",
    cardType: "other" as "visa" | "mastercard" | "amex" | "other",
  });

  const [splitDetails, setSplitDetails] = useState({
    totalSplits: 2,
    method: "cash",
    amounts: [] as number[],
  });

  useEffect(() => {
    setCashAmountPaid(balanceDue);
  }, [balanceDue]);

  useEffect(() => {
    fetchAvailableMethods();
  }, []);

  const fetchAvailableMethods = async () => {
    try {
      setLoading(true);
      const response = await getAvailablePaymentMethods();
      const methodsArray = Array.isArray(response)
        ? response
        : (response && (response as any).methods) || [];

      if (methodsArray && methodsArray.length > 0) {
        const convertedMethods = methodsArray
          .filter((m: any) => m.id !== "partial")
          .map((m: any) => ({
            _id: m.id,
            method: m.id,
            displayName: m.name,
            description: m.description,
            isActive: !m.disabled,
            isAvailable: !m.disabled,
            priority: 100,
            icon: m.icon,
          }));
        setMethods(convertedMethods.length ? convertedMethods : DEFAULT_PAYMENT_METHODS);
      } else {
        // Usar métodos por defecto si la API retorna vacío
        setMethods(DEFAULT_PAYMENT_METHODS);
      }
    } catch (error) {
      console.error("Error fetching payment methods, using defaults:", error);
      if (error instanceof PaymentServiceError) {
        console.error("Payment Service Error:", {
          message: getPaymentErrorMessage(error),
          code: error.errorCode,
          isNetwork: isNetworkError(error)
        });
      }
      // Usar métodos por defecto en caso de error
      setMethods(DEFAULT_PAYMENT_METHODS);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "cash": return DollarSign;
      case "transfer": return CreditCard;
      case "card": return CreditCard;
      case "wallet": return Smartphone;
      case "split": return Split;
      default: return Wallet;
    }
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
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

    onSelect("split", {
      totalSplits: splitDetails.totalSplits,
      method: splitDetails.method,
    });
  };

  const handleCashPayment = () => {
    if (cashAmountPaid < balanceDue) {
      alert(`Monto insuficiente. Total: $${balanceDue.toFixed(2)}`);
      return;
    }
    onSelect("cash", { amountPaid: cashAmountPaid });
  };

  const handleStandardPayment = (method: string) => {
    if (method === "cash") {
      handleCashPayment();
    } else {
      onSelect(method);
    }
  };

  const renderMethodInfo = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod) {
      case "card":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4"
          >
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Detalles de Tarjeta</h3>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">
                Últimos 4 dígitos
              </label>
              <input
                type="text"
                maxLength={4}
                value={cardDetails.lastFour}
                onChange={(e) => setCardDetails({ ...cardDetails, lastFour: e.target.value })}
                className="w-full bg-surface-2 border border-white/10 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-gold/50"
                placeholder="****"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">
                Tipo de Tarjeta
              </label>
              <select
                value={cardDetails.cardType}
                onChange={(e) => setCardDetails({ ...cardDetails, cardType: e.target.value as any })}
                className="w-full bg-surface-2 border border-white/10 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-gold/50"
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
                <option value="other">Otra</option>
              </select>
            </div>
            <button
              onClick={handleCardPayment}
              className="w-full btn btn-gold py-4 rounded-xl font-black uppercase tracking-widest text-sm"
            >
              Procesar Pago
            </button>
          </motion.div>
        );

      case "split":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4"
          >
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Dividir Cuenta</h3>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">
                Cantidad de Divisiones
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={splitDetails.totalSplits}
                onChange={(e) => setSplitDetails({ ...splitDetails, totalSplits: parseInt(e.target.value) || 2 })}
                className="w-full bg-surface-2 border border-white/10 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">
                Monto por División: ${(balanceDue / splitDetails.totalSplits).toFixed(2)}
              </label>
            </div>
            <button
              onClick={handleSplitPayment}
              className="w-full btn btn-gold py-4 rounded-xl font-black uppercase tracking-widest text-sm"
            >
              Cerrar cuenta dividida
            </button>
          </motion.div>
        );

      case "cash":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4"
          >
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Efectivo</h3>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">
                Total a cobrar: ${balanceDue.toFixed(2)}
              </label>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">
                Monto entregado
              </label>
              <input
                type="number"
                min={balanceDue}
                step="0.01"
                value={cashAmountPaid}
                onChange={(e) => setCashAmountPaid(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-2 border border-white/10 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-gold/50"
              />
            </div>
            {cashAmountPaid >= balanceDue && (
              <p className="text-sm font-bold text-gold">
                Vuelto: ${(cashAmountPaid - balanceDue).toFixed(2)}
              </p>
            )}
            <button
              onClick={handleCashPayment}
              className="w-full btn btn-gold py-4 rounded-xl font-black uppercase tracking-widest text-sm"
            >
              Procesar Pago
            </button>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <button
              onClick={() => handleStandardPayment(selectedMethod)}
              className="w-full btn btn-gold py-4 rounded-xl font-black uppercase tracking-widest text-sm"
            >
              Procesar Pago
            </button>
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-8 border-b border-white/10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-gold" />
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Método de Pago</p>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">${balanceDue.toFixed(2)}</h2>
            <p className="text-[10px] text-muted mt-1">Saldo de sesión</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-sm font-black text-muted uppercase tracking-widest">Cargando métodos...</p>
            </div>
          ) : (
            <>
              {/* METHODS GRID */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {methods
                  .filter(m => m.isAvailable)
                  .sort((a, b) => b.priority - a.priority)
                  .map((method) => {
                    const Icon = getMethodIcon(method.method);
                    return (
                      <motion.button
                        key={method._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMethodSelect(method.method)}
                        className={`
                          p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3
                          ${selectedMethod === method.method
                            ? "border-gold bg-gold/10 shadow-gold-glow"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                          }
                        `}
                      >
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center
                          ${selectedMethod === method.method ? "bg-gold text-black" : "bg-white/10 text-muted"}
                        `}>
                          <Icon size={24} />
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-black uppercase tracking-wider ${
                            selectedMethod === method.method ? "text-white" : "text-muted"
                          }`}>
                            {method.displayName}
                          </p>
                        </div>
                        {selectedMethod === method.method && (
                          <div className="absolute top-2 right-2">
                            <Check size={14} className="text-gold" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
              </div>

              {/* METHOD SPECIFIC INFO */}
              <AnimatePresence>
                {renderMethodInfo()}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

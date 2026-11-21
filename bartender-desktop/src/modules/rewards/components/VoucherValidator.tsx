import { useState, useEffect } from "react";
import { Search, CheckCircle2, AlertCircle, Package, User, Coins, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import type { VoucherValidationResult } from "../types/reward";
import { getOrders } from "../../orders/services/orderService";
import type { Order } from "../../orders/types/order";

interface VoucherValidatorProps {
  onValidate: (code: string) => Promise<VoucherValidationResult>;
  onClaim: (code: string, orderId?: string) => Promise<{ success: boolean; message: string; order?: unknown }>;
  onSuccessClaim?: () => void;
}

export default function VoucherValidator({ onValidate, onClaim, onSuccessClaim }: VoucherValidatorProps) {
  const [code, setCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [voucher, setVoucher] = useState<VoucherValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  useEffect(() => {
    // Cargar órdenes activas para permitir asociar el canje a una mesa
    getOrders()
      .then((data) => {
        const active = (Array.isArray(data) ? data : []).filter(
          (o) => o.status === "pending" || o.status === "in-progress"
        );
        setActiveOrders(active);
      })
      .catch((err) => console.error("Error al cargar comandas activas:", err));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setValidating(true);
    setError(null);
    setSuccessMessage(null);
    setVoucher(null);

    try {
      const result = await onValidate(code.trim());
      setVoucher(result);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "No se encontró ningún cupón con ese código");
    } finally {
      setValidating(false);
    }
  };

  const handleClaim = async () => {
    if (!voucher) return;
    setClaiming(true);
    setError(null);

    try {
      const res = await onClaim(voucher.code, selectedOrderId || undefined);
      setSuccessMessage(res.message || `¡Cupón #${voucher.code} canjeado con éxito!`);
      setVoucher(null);
      setCode("");
      setSelectedOrderId("");
      onSuccessClaim?.();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Error al procesar el canje del cupón");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-xl max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#E6EDF3] tracking-tight flex items-center gap-2">
          <Search size={20} className="text-[#F0B429]" />
          Validador & Canjeador de Cupones en Barra
        </h2>
        <p className="text-xs text-[#8B949E] mt-1">
          Ingresa el código alfanumérico provisto por el cliente desde su aplicación móvil (Ej: REW-8429)
        </p>
      </div>

      {/* Input de Búsqueda */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ej: REW-8429 o código numérico..."
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl pl-4 pr-10 py-3 text-sm font-mono tracking-wider text-[#E6EDF3] uppercase placeholder-[#8B949E]/40 focus:outline-none focus:border-[#F0B429] transition-colors"
          />
          {code && (
            <button
              type="button"
              onClick={() => { setCode(""); setVoucher(null); setError(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3]"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={validating || !code.trim()}
          className="px-6 py-3 rounded-xl bg-[#F0B429] hover:bg-[#F0B429]/90 disabled:opacity-50 text-[#0D1117] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-[#F0B429]/10"
        >
          {validating ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Verificar
        </button>
      </form>

      {/* Feedback de Error o Éxito */}
      {error && (
        <div className="p-4 rounded-xl bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] text-xs flex items-center gap-3 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-[#3FB950]/10 border border-[#3FB950]/30 text-[#3FB950] text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Voucher Detail Card */}
      {voucher && (
        <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-5 space-y-4 animate-fade-in">
          
          {/* Top Status */}
          <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#F0B429] bg-[#F0B429]/10 px-2.5 py-1 rounded-md border border-[#F0B429]/30">
                #{voucher.code}
              </span>
              <span className="text-[10px] text-[#8B949E]">
                Emitido el {new Date(voucher.redeemedAt).toLocaleDateString()} a las {new Date(voucher.redeemedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              voucher.status === "pending"
                ? "bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30"
                : "bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30"
            }`}>
              {voucher.status === "pending" ? "Disponible para Canjear" : "Ya Canjeado"}
            </span>
          </div>

          {/* Customer & Reward Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Cliente */}
            <div className="p-3.5 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1.5">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                <User size={12} />
                Titular del Cupón
              </span>
              <p className="text-sm font-bold text-[#E6EDF3]">{voucher.user.name}</p>
              {voucher.user.email && (
                <p className="text-[11px] text-[#8B949E] truncate">{voucher.user.email}</p>
              )}
            </div>

            {/* Recompensa */}
            <div className="p-3.5 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1.5">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                <Coins size={12} className="text-[#F0B429]" />
                Premio Solicitado ({voucher.reward.categoryLabel})
              </span>
              <p className="text-sm font-bold text-[#F0B429]">{voucher.reward.name}</p>
              <p className="text-[11px] text-[#8B949E]">
                Costo: {voucher.reward.pointsCost} puntos deducidos
              </p>
            </div>
          </div>

          {/* Ítem de Carta Asociado */}
          {voucher.reward.product && (
            <div className="p-3 rounded-lg bg-[#1C2333] border border-[#30363D] flex items-center gap-3">
              <Package size={16} className="text-[#388BFD]" />
              <div className="flex-1 text-xs">
                <span className="text-[#8B949E]">Ítem a preparar en estación: </span>
                <strong className="text-[#E6EDF3]">{voucher.reward.product.name}</strong>
              </div>
            </div>
          )}

          {/* Opciones de Canje */}
          {voucher.status === "pending" && (
            <div className="pt-3 border-t border-[#30363D] space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1.5">
                  Asociar a Comanda / Mesa Activa (Opcional)
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                >
                  <option value="">-- Sin comanda (Entrega directa en barra) --</option>
                  {activeOrders.map((o) => (
                    <option key={o._id} value={o._id}>
                      Comanda #{o._id?.slice(-4)} - Mesa {typeof o.table === "object" ? (o.table as { number?: number })?.number : o.table || "S/M"} (${o.total})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#8B949E] mt-1">
                  Si seleccionas una comanda, el ítem se agregará automáticamente con precio $0 y la etiqueta <strong>CANJE: {voucher.reward.name}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClaim}
                disabled={claiming}
                className="w-full py-3 rounded-xl bg-[#3FB950] hover:bg-[#3FB950]/90 disabled:opacity-50 text-[#0D1117] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#3FB950]/20"
              >
                {claiming ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Confirmar y Registrar Entrega de Recompensa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

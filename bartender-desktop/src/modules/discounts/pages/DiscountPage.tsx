import { useState, useEffect } from "react";
import OrderList from "../components/OrderList";
import OrderDetails from "../components/OrderDetails";
import DiscountKeypad from "../components/DiscountKeypad";
import DiscountReasonForm from "../components/DiscountReasonForm";
import DiscountStats from "../components/DiscountStats";

import { useDiscount } from "../hooks/useDiscount";
import { discountService } from "../services/discountService";

import type { Order, SelectedItem } from "../types/discounts";
import { Sparkles, Save, Loader2, Info } from "lucide-react";

export default function DiscountPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingApply, setLoadingApply] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    todayTotal: 0,
    averagePercent: 0,
    appliedCount: 0,
  });

  /* =========================
     HOOK CENTRAL
  ========================= */
  const discount = useDiscount({ items });

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await discountService.getActiveOrders();
      setOrders(data);

      setSelectedOrder((prev) => {
        if (!prev) return data[0] ?? null;
        return data.find((o) => o._id === prev._id) ?? data[0] ?? null;
      });
    } catch (err: any) {
      setError(err.message || "Error cargando ordenes");
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await discountService.getTodayStats();
      setStats(data);
    } catch {
      // stats no debe bloquear la pantalla
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadStats();
  }, []);

  /* =========================
     CUANDO CAMBIA LA ORDEN
  ========================= */
  useEffect(() => {
    if (!selectedOrder) return;

    const mappedItems: SelectedItem[] = selectedOrder.items.map((item) => ({
      ...item,
      selected: false,
    }));

    setItems(mappedItems);
    discount.reset();
  }, [selectedOrder]);

  /* =========================
     APPLY DISCOUNT
  ========================= */
  const handleApplyDiscount = async () => {
    if (!selectedOrder) return;

    if (!discount.isValid) {
      setError(discount.errors[0] || "Datos de descuento invalidos");
      return;
    }

    try {
      setLoadingApply(true);
      setError(null);
      setFeedback(null);
      const payload = discount.buildPayload(selectedOrder._id);

      await discountService.applyDiscount(payload);

      setFeedback("Descuento aplicado correctamente");
      discount.reset();
      await Promise.all([loadOrders(), loadStats()]);
    } catch (err: any) {
      setError(err.message || "Error aplicando descuento");
    } finally {
      setLoadingApply(false);
    }
  };

  return (
    <div className="space-y-6 glass-royale p-8 rounded-[3rem] shadow-royale animate-fade-in relative overflow-hidden">
      {/* ATMOSPHERIC GLOW */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-surface-3 border border-white/5 rounded-2xl shadow-inner">
            <Sparkles className="text-cyan-400" size={32} />
          </div>
          <div>
            <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mb-1">
              Terminal de Descuentos
            </p>
            <h1 className="text-3xl font-black text-ivory tracking-tighter uppercase leading-none">
              Manual Discount Console
            </h1>
            <p className="text-xs text-muted font-bold tracking-widest uppercase mt-2">
              Aplica ajustes manuales por orden de forma táctica
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red/10 border border-red/30 text-red px-6 py-4 rounded-2xl shadow-inner flex items-center gap-3 relative z-10">
          <Info size={16} />
          <span className="text-xs font-bold tracking-wider uppercase">{error}</span>
        </div>
      )}

      {feedback && (
        <div className="bg-lime/10 border border-lime/30 text-lime px-6 py-4 rounded-2xl shadow-inner flex items-center gap-3 relative z-10">
          <Info size={16} />
          <span className="text-xs font-bold tracking-wider uppercase">{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 relative z-10">
        {/* =========================
            LEFT: ORDERS
        ========================= */}
        <div className="col-span-12 xl:col-span-4 flex flex-col">
          <div className="bg-surface-2 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-royale flex-1 h-[600px] overflow-hidden flex flex-col">
            <OrderList
              orders={orders}
              selectedOrderId={selectedOrder?._id}
              loading={loadingOrders}
              onSelectOrder={setSelectedOrder}
            />
          </div>
        </div>

        {/* =========================
            CENTER: ORDER DETAILS
        ========================= */}
        <div className="col-span-12 xl:col-span-4 flex flex-col">
          <div className="bg-surface-2 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-royale flex-1 h-[600px] overflow-hidden flex flex-col">
            {selectedOrder ? (
              <OrderDetails
                order={selectedOrder}
                items={items}
                setItems={setItems}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl mt-8">
                <Info size={32} className="text-muted mb-4 opacity-50" />
                <p className="text-xs text-muted font-bold tracking-widest uppercase">
                  Selecciona una orden activa<br/>para gestionar detalles
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =========================
            RIGHT: DISCOUNT PANEL
        ========================= */}
        <div className="col-span-12 xl:col-span-4 flex flex-col">
          <div className="bg-surface-3/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-royale flex-1 h-[600px] overflow-y-auto space-y-6">
            <DiscountKeypad
              type={discount.type}
              setType={discount.setType}
              value={discount.value}
              valueInput={discount.valueInput}
              appendNumber={discount.appendNumber}
              removeLast={discount.removeLast}
            />

            <div className="bg-surface-2 border border-white/5 p-5 rounded-2xl shadow-inner space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted uppercase tracking-wider">Subtotal Selección</span>
                <span className="font-black text-ivory">${discount.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-cyan-400 uppercase tracking-wider">Ajuste Objetivo</span>
                <span className="font-black text-cyan-400">-${discount.discountAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex justify-between items-center text-sm">
                <span className="font-black text-lime uppercase tracking-widest">Total Final</span>
                <span className="font-black text-lime text-lg">${discount.finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <DiscountReasonForm
              reason={discount.reason}
              setReason={discount.setReason}
              note={discount.note}
              setNote={discount.setNote}
            />

            {/* =========================
                ERRORS
            ========================= */}
            {!discount.isValid && (
              <div className="bg-red/5 border border-red/20 p-4 rounded-2xl space-y-1">
                {discount.errors.map((err, i) => (
                  <p key={i} className="text-red text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-red" />
                    {err}
                  </p>
                ))}
              </div>
            )}

            {/* =========================
                APPLY BUTTON
            ========================= */}
            <button
              onClick={handleApplyDiscount}
              disabled={!discount.isValid || !selectedOrder || loadingApply}
              className="w-full h-14 bg-grad-gold text-bg font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-gold/30 hover:shadow-gold-glow transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-auto"
            >
              {loadingApply ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Aplicar Ajuste
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          STATS
      ========================= */}
      <div className="relative z-10">
        <DiscountStats data={stats} loading={loadingStats} />
      </div>
    </div>
  );
}
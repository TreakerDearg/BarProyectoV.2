import { useState, useEffect } from "react";
import OrderList from "../components/OrderList";
import OrderDetails from "../components/OrderDetails";
import DiscountKeypad from "../components/DiscountKeypad";
import DiscountReasonForm from "../components/DiscountReasonForm";
import DiscountStats from "../components/DiscountStats";

import { useDiscount } from "../hooks/useDiscount";
import { discountService } from "../services/discountService";

import type { Order, SelectedItem } from "../types/discounts";

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Manual Discount Console</h1>
        <p className="text-sm text-gray-400 mt-1">
          Aplica ajustes manuales por orden sin romper el flujo operativo del POS.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {feedback && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
      {/* =========================
          LEFT: ORDERS
      ========================= */}
      <div className="col-span-12 xl:col-span-4">
        <OrderList
          orders={orders}
          selectedOrderId={selectedOrder?._id}
          loading={loadingOrders}
          onSelectOrder={setSelectedOrder}
        />
      </div>

      {/* =========================
          CENTER: ORDER DETAILS
      ========================= */}
      <div className="col-span-12 xl:col-span-4">
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            items={items}
            setItems={setItems}
          />
        )}
        {!selectedOrder && (
          <div className="bg-surface-container border border-white/10 p-6 rounded-xl text-sm text-gray-400">
            Selecciona una orden abierta para ver detalles.
          </div>
        )}
      </div>

      {/* =========================
          RIGHT: DISCOUNT PANEL
      ========================= */}
      <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">
        <DiscountKeypad
          type={discount.type}
          setType={discount.setType}
          value={discount.value}
          valueInput={discount.valueInput}
          appendNumber={discount.appendNumber}
          removeLast={discount.removeLast}
        />

        <div className="bg-surface-container border border-white/10 p-3 rounded-xl text-sm">
          <p className="text-gray-300">Subtotal selected: ${discount.subtotal.toFixed(2)}</p>
          <p className="text-primary font-semibold">
            Target adjustment: -${discount.discountAmount.toFixed(2)}
          </p>
          <p className="font-bold text-white">
            Final after discount: ${discount.finalTotal.toFixed(2)}
          </p>
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
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
            {discount.errors.map((err, i) => (
              <p key={i} className="text-red-400 text-xs">
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
          className="bg-primary text-black py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {loadingApply ? "Applying..." : "Apply Adjustment"}
        </button>
      </div>
      </div>

      {/* =========================
          STATS
      ========================= */}
      <div>
        <DiscountStats data={stats} loading={loadingStats} />
      </div>
    </div>
  );
}
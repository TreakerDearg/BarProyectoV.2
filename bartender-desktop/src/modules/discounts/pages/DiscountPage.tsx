// pages/DiscountPage.tsx

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<SelectedItem[]>([]);

  /* =========================
     HOOK CENTRAL
  ========================= */
  const discount = useDiscount({ items });

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
      console.warn(discount.errors);
      return;
    }

    try {
      const payload = discount.buildPayload(selectedOrder._id);

      await discountService.applyDiscount(payload);

      // reset UI
      discount.reset();

      // opcional: refrescar orden
      console.log("Discount applied");
    } catch (error) {
      console.error("Error applying discount", error);
    }
  };

  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      {/* =========================
          LEFT: ORDERS
      ========================= */}
      <div className="col-span-4">
        <OrderList onSelectOrder={setSelectedOrder} />
      </div>

      {/* =========================
          CENTER: ORDER DETAILS
      ========================= */}
      <div className="col-span-4">
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            items={items}
            setItems={setItems}
          />
        )}
      </div>

      {/* =========================
          RIGHT: DISCOUNT PANEL
      ========================= */}
      <div className="col-span-4 flex flex-col gap-4">
        <DiscountKeypad
          type={discount.type}
          setType={discount.setType}
          value={discount.value}
          setValue={discount.setValue}
          appendNumber={discount.appendNumber}
          removeLast={discount.removeLast}
        />

        {/* 👇 feedback en tiempo real */}
        <div className="bg-surface-container p-3 rounded-xl text-sm">
          <p>Subtotal: ${discount.subtotal.toFixed(2)}</p>
          <p className="text-primary">
            Discount: -${discount.discountAmount.toFixed(2)}
          </p>
          <p className="font-bold">
            Final: ${discount.finalTotal.toFixed(2)}
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
          <div className="bg-red-500/10 border border-red-500 p-3 rounded">
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
          disabled={!discount.isValid}
          className="bg-primary text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          APPLY DISCOUNT
        </button>
      </div>

      {/* =========================
          STATS
      ========================= */}
      <div className="col-span-12">
        <DiscountStats />
      </div>
    </div>
  );
}
"use client";

import { TrendingDown, Percent, DollarSign, Info } from "lucide-react";

interface DiscountItem {
  amount: number;
  type: "PERCENT" | "FLAT";
  reason: string;
  note?: string;
}

interface Props {
  subtotal: number;
  discounts: DiscountItem[];
  finalTotal: number;
  compact?: boolean;
}

export default function DiscountSummary({ 
  subtotal, 
  discounts, 
  finalTotal, 
  compact = false 
}: Props) {
  const totalDiscount = discounts.reduce((acc, d) => acc + d.amount, 0);
  const hasDiscounts = discounts.length > 0;

  if (compact) {
    return (
      <div className="p-3 rounded-xl border" style={{
        background: 'rgba(0, 229, 255, 0.05)',
        borderColor: 'rgba(0, 229, 255, 0.15)'
      }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingDown size={14} className="text-cyan" />
            <span className="text-xs font-semibold text-white/70">Descuentos</span>
          </div>
          {hasDiscounts && (
            <span className="text-xs font-bold text-cyan">
              -${totalDiscount.toFixed(2)}
            </span>
          )}
        </div>
        {hasDiscounts && (
          <div className="space-y-1">
            {discounts.map((discount, index) => (
              <div key={index} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-white/50">
                  {discount.type === "PERCENT" ? (
                    <Percent size={10} />
                  ) : (
                    <DollarSign size={10} />
                  )}
                  <span>{discount.reason}</span>
                </div>
                <span className="text-white/70">
                  -${discount.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-white/50">Total</span>
          <span className="text-sm font-bold text-cyan">
            ${finalTotal.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border" style={{
      background: 'rgba(0, 229, 255, 0.05)',
      borderColor: 'rgba(0, 229, 255, 0.15)'
    }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-cyan/20 rounded-lg">
          <TrendingDown size={16} className="text-cyan" />
        </div>
        <h3 className="text-sm font-bold text-white">Resumen de Descuentos</h3>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Subtotal</span>
          <span className="font-semibold text-white">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {hasDiscounts ? (
          <div className="space-y-1.5">
            {discounts.map((discount, index) => (
              <div key={index} className="flex items-start justify-between text-xs">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-white/70">
                    {discount.type === "PERCENT" ? (
                      <Percent size={12} className="text-cyan" />
                    ) : (
                      <DollarSign size={12} className="text-violet" />
                    )}
                    <span className="font-medium">{discount.reason}</span>
                  </div>
                  {discount.note && (
                    <p className="text-[10px] text-white/40 mt-0.5 ml-5">
                      {discount.note}
                    </p>
                  )}
                </div>
                <span className="font-bold text-cyan">
                  -${discount.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Info size={12} />
            <span>No hay descuentos aplicados</span>
          </div>
        )}

        <div className="h-px bg-white/10 my-2" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/50">Total a pagar</span>
          <span className="text-xl font-bold text-cyan">
            ${finalTotal.toFixed(2)}
          </span>
        </div>

        {hasDiscounts && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Ahorro total</span>
            <span className="font-bold text-emerald">
              -${totalDiscount.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

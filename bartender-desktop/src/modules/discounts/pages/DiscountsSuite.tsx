"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Percent, TrendingUp, Megaphone, Calendar } from "lucide-react";
import DiscountsSuiteHeader from "../components/DiscountsSuiteHeader";
import DiscountPage        from "./DiscountPage";
import DynamicPricingPage  from "./DynamicPricingPage";
import PromotionsPage      from "./PromotionsPage";
import DiscountEventsPage  from "./DiscountEventsPage";

type DiscountView = "manual" | "dynamic-pricing" | "promotions" | "events";

const VIEW_META: Record<DiscountView, { title: string; subtitle: string; icon: React.ElementType }> = {
  "manual":          { title: "Descuentos Manuales",   subtitle: "Aplica descuentos a órdenes activas",          icon: Percent    },
  "dynamic-pricing": { title: "Precios Dinámicos",      subtitle: "Ajusta el multiplicador global de precios",     icon: TrendingUp },
  "promotions":      { title: "Promociones",            subtitle: "Gestiona promociones programadas",              icon: Megaphone  },
  "events":          { title: "Eventos de Descuento",   subtitle: "Auditoría y trazabilidad de cambios",           icon: Calendar   },
};

export default function DiscountsSuite() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentView, setCurrentView] = useState<DiscountView>(() => {
    const p = searchParams.get("view");
    return (p && p in VIEW_META) ? p as DiscountView : "manual";
  });

  useEffect(() => { setSearchParams({ view: currentView }, { replace: true }); }, [currentView]);

  useEffect(() => {
    const p = searchParams.get("view");
    if (p && p in VIEW_META && p !== currentView) setCurrentView(p as DiscountView);
  }, [searchParams]);

  const meta = VIEW_META[currentView];
  const TitleIcon = meta.icon;

  return (
    <div className="w-full space-y-2">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20">
          <TitleIcon size={18} className="text-gold" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ivory leading-tight">{meta.title}</h1>
          <p className="text-[11px] text-muted mt-0.5">{meta.subtitle}</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <DiscountsSuiteHeader
        title={meta.title}
        subtitle={meta.subtitle}
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenTutorial={() => {}}
      />

      {/* Content */}
      <div>
        {currentView === "manual"          && <DiscountPage />}
        {currentView === "dynamic-pricing" && <DynamicPricingPage />}
        {currentView === "promotions"      && <PromotionsPage />}
        {currentView === "events"          && <DiscountEventsPage />}
      </div>
    </div>
  );
}

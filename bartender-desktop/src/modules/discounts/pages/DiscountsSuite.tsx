"use client";

/**
 * DiscountsSuite — Contenedor del sistema de descuentos.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Solo muestra los tabs + la vista activa.
 * Sin título duplicado (el Header global ya lo muestra).
 */
import { useState, useEffect } from "react";
import { useSearchParams }     from "react-router-dom";
import DiscountsSuiteHeader    from "../components/DiscountsSuiteHeader";
import DiscountPage            from "./DiscountPage";
import DynamicPricingPage      from "./DynamicPricingPage";
import PromotionsPage          from "./PromotionsPage";
import DiscountEventsPage      from "./DiscountEventsPage";

type DiscountView = "manual" | "dynamic-pricing" | "promotions" | "events";

const VALID_VIEWS = new Set<DiscountView>(["manual", "dynamic-pricing", "promotions", "events"]);

export default function DiscountsSuite() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentView, setCurrentView] = useState<DiscountView>(() => {
    const p = searchParams.get("view") as DiscountView;
    return VALID_VIEWS.has(p) ? p : "manual";
  });

  useEffect(() => {
    setSearchParams({ view: currentView }, { replace: true });
  }, [currentView]);

  useEffect(() => {
    const p = searchParams.get("view") as DiscountView;
    if (VALID_VIEWS.has(p) && p !== currentView) setCurrentView(p);
  }, [searchParams]);

  return (
    <div
      className="flex flex-col h-full min-h-0"
      style={{ background: "#0D1117", color: "#E6EDF3" }}
    >
      {/* Tabs de navegación */}
      <div
        className="flex-shrink-0 px-6 py-3"
        style={{ borderBottom: "1px solid #30363D" }}
      >
        <DiscountsSuiteHeader
          title=""
          subtitle=""
          currentView={currentView}
          onViewChange={setCurrentView}
          onOpenTutorial={() => {}}
        />
      </div>

      {/* Contenido de la vista activa */}
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
      >
        {currentView === "manual"          && <DiscountPage />}
        {currentView === "dynamic-pricing" && <DynamicPricingPage />}
        {currentView === "promotions"      && <PromotionsPage />}
        {currentView === "events"          && <DiscountEventsPage />}
      </div>
    </div>
  );
}

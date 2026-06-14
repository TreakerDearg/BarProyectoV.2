"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DiscountsSuiteHeader from "../components/DiscountsSuiteHeader";
import DiscountPage from "./DiscountPage";
import DynamicPricingPage from "./DynamicPricingPage";
import PromotionsPage from "./PromotionsPage";
import DiscountEventsPage from "./DiscountEventsPage";

type DiscountView = "manual" | "dynamic-pricing" | "promotions" | "events";

const viewConfig = {
  manual: {
    title: "Descuentos Manuales",
    subtitle: "Aplica descuentos a órdenes activas",
  },
  "dynamic-pricing": {
    title: "Precios Dinámicos",
    subtitle: "Ajusta multiplicadores globales de precios",
  },
  promotions: {
    title: "Promociones",
    subtitle: "Gestiona promociones programadas",
  },
  events: {
    title: "Eventos de Descuento",
    subtitle: "Auditoría y trazabilidad de cambios",
  },
};

export default function DiscountsSuite() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<DiscountView>(() => {
    const viewParam = searchParams.get("view");
    if (viewParam && Object.keys(viewConfig).includes(viewParam)) {
      return viewParam as DiscountView;
    }
    return "manual";
  });

  // Update URL when view changes
  useEffect(() => {
    setSearchParams({ view: currentView });
  }, [currentView, setSearchParams]);

  // Sync with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam && Object.keys(viewConfig).includes(viewParam)) {
      setCurrentView(viewParam as DiscountView);
    }
  }, [searchParams]);

  const handleViewChange = (view: DiscountView) => {
    setCurrentView(view);
  };

  const config = viewConfig[currentView];

  return (
    <div className="discounts-suite">
      <DiscountsSuiteHeader
        title={config.title}
        subtitle={config.subtitle}
        currentView={currentView}
        onViewChange={handleViewChange}
        onOpenTutorial={() => {
          // Handle tutorial open - will be implemented per view
        }}
      />

      <div className="discounts-content">
        {currentView === "manual" && <DiscountPage />}
        {currentView === "dynamic-pricing" && <DynamicPricingPage />}
        {currentView === "promotions" && <PromotionsPage />}
        {currentView === "events" && <DiscountEventsPage />}
      </div>
    </div>
  );
}

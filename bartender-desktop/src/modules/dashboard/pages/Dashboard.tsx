import { useState } from "react";
import { useDashboard } from "../hooks/useDashboard";
import ServiceDashboard from "../views/ServiceDashboard";
import AnalyticsVersus from "../views/AnalyticsVersus";
import SalesDiscounts from "../views/SalesDiscounts";

export default function Dashboard() {
  const { data, loading } = useDashboard();
  const [activeTab, setActiveTab] = useState<"service" | "analytics" | "sales">("service");

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center text-bar-gold">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-bar-gold animate-spin" />
          <p>Cargando sistemas operativos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between border-b border-obsidian/40 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Control Operacional</h1>
          <p className="text-sm text-gray-400">Resumen en vivo del servicio actual</p>
        </div>

        <div className="flex space-x-2 bg-void p-1 rounded-lg border border-obsidian/60">
          <button
            onClick={() => setActiveTab("service")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "service" ? "bg-bar-gold/20 text-bar-gold" : "text-gray-400 hover:text-white"
            }`}
          >
            Service
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "analytics" ? "bg-bar-gold/20 text-bar-gold" : "text-gray-400 hover:text-white"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "sales" ? "bg-bar-gold/20 text-bar-gold" : "text-gray-400 hover:text-white"
            }`}
          >
            Sales & Discounts
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === "service" && <ServiceDashboard data={data} />}
        {activeTab === "analytics" && <AnalyticsVersus data={data} />}
        {activeTab === "sales" && <SalesDiscounts data={data} />}
      </div>
    </div>
  );
}
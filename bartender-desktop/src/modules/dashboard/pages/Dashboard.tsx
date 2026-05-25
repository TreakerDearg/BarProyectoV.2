"use client";

import { useState, type ReactNode } from "react";
import {
  Zap,
  ShieldCheck,
  BarChart3,
  DollarSign,
  PackageSearch,
  Monitor,
  X,
  Sparkles,
  LayoutGrid,
  HelpCircle,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useDashboardTutorial } from "../hooks/useDashboardTutorial";
import DashboardTutorial from "../components/tutorial/DashboardTutorial";
import DashboardAlertsBanner from "../components/DashboardAlertsBanner";
import ServiceDashboard from "../views/ServiceDashboard";
import AnalyticsVersus from "../views/AnalyticsVersus";
import SalesDiscounts from "../views/SalesDiscounts";
import InventoryDashboard from "../views/InventoryDashboard";
import RealTimeDiscountAlert from "../components/RealTimeDiscountAlert";
import DashboardKpiStrip from "../components/DashboardKpiStrip";
import {
  useDashboardUiStore,
  type DashboardTab,
} from "../store/dashboardUiStore";
import "../../../styles/dashboard-theme.css";

const TABS: { id: DashboardTab; label: string; icon: ReactNode }[] = [
  { id: "service", label: "Operación", icon: <Zap size={18} /> },
  { id: "analytics", label: "Análisis", icon: <BarChart3 size={18} /> },
  { id: "sales", label: "Ventas", icon: <DollarSign size={18} /> },
  { id: "inventory", label: "Inventario", icon: <PackageSearch size={18} /> },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("service");
  const [range, setRange] = useState("7");
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showAnalyticsReport, setShowAnalyticsReport] = useState(false);
  const {
    data,
    loading,
    error,
    lastSync,
    socketConnected,
    reload,
  } = useDashboard(activeTab, range);
  const { mode, setMode } = useDashboardUiStore();
  const {
    isOpen: tutorialOpen,
    openTutorial,
    closeTutorial,
    completeTutorial,
  } = useDashboardTutorial();

  if (loading && !data) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center nebula-dashboard-root relative overflow-hidden">
        <div className="absolute inset-0 nebula-aurora opacity-60" />
        <div className="relative flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border-2 border-violet-400/30 border-t-violet-300 animate-spin" />
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-ivory">Sincronizando</h2>
            <p className="text-xs text-violet-300/80">Centro Nebula</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 nebula-dashboard-root p-6">
        <p className="text-sm text-red text-center max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => reload()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600/30 border border-violet-400/30 text-sm font-semibold text-ivory hover:bg-violet-600/40"
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="nebula-dashboard-root flex flex-col h-full gap-6 md:gap-8 animate-fade-in-up-fusion relative">
      <RealTimeDiscountAlert />
      <DashboardTutorial
        isOpen={tutorialOpen}
        onClose={() => closeTutorial()}
        onComplete={completeTutorial}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="nebula-aurora" />
      </div>

      {/* Cabecera */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-400/20 shadow-[0_0_24px_rgba(139,92,246,0.15)]">
            <Monitor className="text-violet-200" size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ivory flex items-center gap-2">
              <Sparkles className="text-violet-300 w-6 h-6" />
              Panel Nebula
            </h1>
            <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-violet-400/70" />
              Operación del local · Nebula v3
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openTutorial}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
            title="Tutorial del panel"
            data-tutorial="help-button"
          >
            <HelpCircle size={16} />
            Tutorial
          </button>
          <ModeToggle mode={mode} onChange={setMode} />
          <nav
            data-tutorial="tabs"
            className="flex flex-wrap bg-surface-3/40 p-1.5 rounded-2xl border border-white/8"
            aria-label="Secciones del panel"
          >
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </nav>
        </div>
      </header>

      <DashboardAlertsBanner />

      <DashboardKpiStrip tab={activeTab} data={data} mode={mode} />

      <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar pb-8">
        {activeTab === "service" && (
          <ServiceDashboard
            data={data}
            mode={mode}
            onViewActivityLog={() => setShowActivityLog(true)}
          />
        )}
        {activeTab === "analytics" && (
          <AnalyticsVersus
            data={data}
            mode={mode}
            onRangeChange={setRange}
            onViewReport={() => setShowAnalyticsReport(true)}
          />
        )}
        {activeTab === "sales" && (
          <SalesDiscounts data={data} mode={mode} onRangeChange={setRange} />
        )}
        {activeTab === "inventory" && (
          <InventoryDashboard data={data} mode={mode} />
        )}
      </div>

      <SyncBadge connected={socketConnected} lastSync={lastSync} />

      {showActivityLog && (
        <Modal
          title="Registro de actividad"
          onClose={() => setShowActivityLog(false)}
        >
          <div className="space-y-3">
            {data.recentReservations?.map((res: { name: string; partySize: number; startTime: string }, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-surface-3/50 border border-white/5"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ivory">
                      {res.name}
                    </p>
                    <p className="text-xs text-muted">
                      {res.partySize} personas
                    </p>
                  </div>
                  <p className="text-xs text-violet-300 shrink-0">
                    {new Date(res.startTime).toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
            ))}
            {(!data.recentReservations ||
              data.recentReservations.length === 0) && (
              <p className="text-center text-muted py-8 text-sm">
                No hay actividad reciente
              </p>
            )}
          </div>
        </Modal>
      )}

      {showAnalyticsReport && (
        <Modal
          title="Reporte analítico"
          onClose={() => setShowAnalyticsReport(false)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReportStat
              label="Ventas totales"
              value={`$${data.totalSales?.toLocaleString("es-MX") ?? "0"}`}
              accent="gold"
            />
            <ReportStat
              label="Órdenes"
              value={String(data.totalOrders ?? 0)}
            />
            <ReportStat
              label="Ticket promedio"
              value={`$${data.avgTicket?.toFixed(2) ?? "0.00"}`}
              accent="lime"
            />
            <ReportStat
              label="Descuentos"
              value={`$${data.discountsGiven?.toLocaleString("es-MX") ?? "0"}`}
              accent="red"
            />
          </div>
          <p className="text-center text-muted text-xs mt-6">
            Generado por Centro Nebula
          </p>
        </Modal>
      )}
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: "simple" | "advanced";
  onChange: (m: "simple" | "advanced") => void;
}) {
  return (
    <div
      className="flex p-1 rounded-xl border border-white/8 bg-surface-3/30"
      role="group"
      aria-label="Modo de visualización"
      data-tutorial="mode-toggle"
    >
      <button
        type="button"
        onClick={() => onChange("simple")}
        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
          mode === "simple"
            ? "bg-violet-500/25 text-violet-100 border border-violet-400/30"
            : "text-muted hover:text-ivory"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <LayoutGrid size={14} />
          Simple
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange("advanced")}
        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
          mode === "advanced"
            ? "bg-violet-500/25 text-violet-100 border border-violet-400/30"
            : "text-muted hover:text-ivory"
        }`}
      >
        Avanzado
      </button>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
        active
          ? "bg-gradient-to-r from-violet-600/40 to-cyan-600/30 text-ivory border border-violet-400/25 shadow-[0_0_16px_rgba(139,92,246,0.2)]"
          : "text-muted hover:text-ivory hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SyncBadge({
  connected,
  lastSync,
}: {
  connected: boolean;
  lastSync: string | null;
}) {
  const timeLabel = lastSync
    ? new Date(lastSync).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      data-tutorial="sync-status"
      className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[11px] text-muted"
    >
      {connected ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Conectado a Nebula</span>
        </>
      ) : (
        <>
          <WifiOff size={12} className="text-amber-400" />
          <span className="text-amber-400/90">Reconectando…</span>
        </>
      )}
      {timeLabel && (
        <span className="opacity-60">· Actualizado {timeLabel}</span>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative nebula-panel p-6 md:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-ivory">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ivory p-1"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ReportStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gold" | "lime" | "red";
}) {
  const color =
    accent === "gold"
      ? "text-gold"
      : accent === "lime"
        ? "text-lime"
        : accent === "red"
          ? "text-red"
          : "text-ivory";
  return (
    <div className="p-5 rounded-xl bg-surface-3/50 border border-white/5">
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

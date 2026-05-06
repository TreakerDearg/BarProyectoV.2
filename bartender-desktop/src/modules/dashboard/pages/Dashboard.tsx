"use client";

import { useState } from "react";
import { 
  Zap, 
  ShieldCheck, 
  BarChart3,
  DollarSign,
  Users,
  Timer,
  Box,
  Monitor,
  TrendingUp,
  PackageSearch
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import ServiceDashboard from "../views/ServiceDashboard";
import AnalyticsVersus from "../views/AnalyticsVersus";
import SalesDiscounts from "../views/SalesDiscounts";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"service" | "analytics" | "sales" | "inventory">("service");
  const { data, loading } = useDashboard(activeTab);

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[200px] animate-pulse-slow" />
        <div className="relative flex flex-col items-center gap-8">
          <div className="w-24 h-24 rounded-[2rem] border-2 border-gold/20 border-t-gold animate-spin shadow-gold-glow" />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-ivory tracking-[0.5em] uppercase">Sincronizando</h2>
            <p className="text-[10px] text-gold font-black uppercase tracking-[0.8em] animate-pulse">Umbra Command Center v3.0</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-10 p-4 relative overflow-hidden">
      
      {/* ATMOSPHERIC BACKGROUNDS */}
      <div className="fixed -top-[10%] -right-[5%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[180px] -z-10 animate-pulse-slow" />
      <div className="fixed -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-emerald-400/5 rounded-full blur-[150px] -z-10 animate-pulse-slow" />

      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-grad-gold rounded-[2rem] shadow-gold-glow animate-float">
              <Monitor className="text-bg" size={36} />
            </div>
            <div>
              <h1 className="text-7xl font-black tracking-tighter text-grad-gold uppercase leading-none drop-shadow-2xl">
                Command
              </h1>
              <p className="text-[11px] font-black text-muted uppercase tracking-[0.6em] ml-1 mt-2 flex items-center gap-2">
                <ShieldCheck size={14} className="text-gold opacity-50" />
                Operational Intelligence · <span className="text-grad-gold">Umbra VIP v3.0</span>
              </p>
            </div>
          </div>
        </div>

        {/* TACTICAL NAVIGATION */}
        <div className="flex bg-surface-3/30 p-2 rounded-[2.5rem] border border-white/5 shadow-royale">
          <TabButton 
            active={activeTab === 'service'} 
            onClick={() => setActiveTab('service')}
            icon={<Zap size={18} />}
            label="Service"
          />
          <TabButton 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')}
            icon={<BarChart3 size={18} />}
            label="Analytics"
          />
          <TabButton 
            active={activeTab === 'sales'} 
            onClick={() => setActiveTab('sales')}
            icon={<DollarSign size={18} />}
            label="Sales"
          />
          <TabButton 
            active={activeTab === 'inventory'} 
            onClick={() => setActiveTab('inventory')}
            icon={<PackageSearch size={18} />}
            label="Inventory"
          />
        </div>
      </div>

      {/* GLOBAL KPI STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <KPICard label="Ingresos Totales" value={`$${data.totalSales?.toFixed(0) || 0}`} icon={<TrendingUp size={20} />} trend="+14%" color="gold" />
        <KPICard label="Órdenes Activas" value={data.activeOrdersCount || 0} icon={<Box size={20} />} trend="Live" color="emerald" />
        <KPICard label="Tiempo Promedio" value="12m" icon={<Timer size={20} />} trend="-2m" color="cyan" />
        <KPICard label="Reservas Hoy" value={data.reservationsToday || 0} icon={<Users size={20} />} trend="Peak" color="ember" />
      </div>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-32 min-h-0">
        <div className="animate-slide-up">
          {activeTab === "service" && <ServiceDashboard data={data} />}
          {activeTab === "analytics" && <AnalyticsVersus data={data} />}
          {activeTab === "sales" && <SalesDiscounts data={data} />}
          {activeTab === "inventory" && (
            <div className="p-10 text-center text-muted">
               <h2 className="text-2xl font-black uppercase text-ivory mb-4">Módulo de Bóveda (Inventario)</h2>
               <p className="max-w-md mx-auto text-xs tracking-widest leading-loose">
                  Análisis crítico de existencias, valor de stock (${data.inventory?.stockValue?.toLocaleString()}) y alertas de reposición inmediata.
               </p>
               <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  {data.inventory?.criticalItems?.map((item: any) => (
                    <div key={item._id} className="p-6 rounded-3xl bg-red/5 border border-red/10">
                      <p className="text-[10px] font-black text-red uppercase mb-2">REPOSICIÓN CRÍTICA</p>
                      <p className="text-lg font-bold text-ivory uppercase">{item.name}</p>
                      <p className="text-2xl font-black text-red mt-2">{item.stock} {item.unit || 'uds'}</p>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-4 bg-surface-3/80 backdrop-blur-2xl rounded-full border border-white/10 shadow-royale z-50 animate-bounce-slow">
        <div className="w-2 h-2 rounded-full bg-lime animate-pulse shadow-lime-glow" />
        <p className="text-[9px] font-black text-ivory uppercase tracking-[0.3em]">Sistema Operativo Totalmente Sincronizado</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-4 px-10 py-4 rounded-[2rem] transition-all duration-500
        ${active 
          ? 'bg-grad-gold text-bg shadow-gold-glow scale-105' 
          : 'text-muted hover:text-ivory hover:bg-white/5'}
      `}
    >
      {icon}
      <span className="text-xs font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}

function KPICard({ label, value, icon, trend, color }: any) {
  const colors: any = {
    gold: "text-gold border-gold/20 bg-gold/5",
    emerald: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
    cyan: "text-cyan-400 border-cyan-400/20 bg-cyan-400/5",
    ember: "text-ember border-ember/20 bg-ember/5",
  };
  const activeColor = colors[color] || colors.gold;

  return (
    <div className="glass-royale p-8 rounded-[2.5rem] border border-white/5 group hover:border-white/10 transition-all relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{label}</p>
        <div className={`${activeColor.split(' ')[0]} opacity-30 group-hover:opacity-100 transition-opacity`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-5xl font-black ${activeColor.split(' ')[0]} tracking-tighter leading-none`}>{value}</p>
        <div className={`px-3 py-1 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest ${trend.includes('+') || trend === 'Live' ? 'text-lime' : 'text-red'}`}>
          {trend}
        </div>
      </div>
    </div>
  );
}
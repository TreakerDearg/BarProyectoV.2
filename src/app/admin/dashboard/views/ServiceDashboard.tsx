"use client";

import type { DashboardStats } from "../services/dashboardService";
import RevenueStreamChart from "../components/charts/RevenueStreamChart";
import TopPerformanceBars from "../components/performance/TopPerformanceBars";
import ServiceHealth from "../components/health/ServiceHealth";
import InventoryAlerts from "../components/alerts/InventoryAlerts";
import LiveActivity from "../components/alerts/LiveActivity";
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  Box, 
  Target, 
  Flame, 
  Droplets, 
  ShieldAlert,
  ArrowRight,
  Monitor
} from "lucide-react";

interface Props {
  data: DashboardStats;
}

export default function ServiceDashboard({ data }: Props) {
  return (
    <div className="grid grid-cols-12 gap-8 animate-fade-in">
      
      {/* ================= MAIN ANALYTICS ================= */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        
        {/* REVENUE STREAM */}
        <div className="glass-royale rounded-[3rem] p-10 border border-white/5 relative overflow-hidden group shadow-royale">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
            <TrendingUp size={80} className="text-gold" />
          </div>
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-ivory tracking-tighter uppercase">Flujo de Ingresos</h3>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] mt-1">Monitoreo de Transacciones en Vivo</p>
            </div>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ESTABLE
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <RevenueStreamChart data={data.salesData} />
          </div>
        </div>

        {/* PERFORMANCE MIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-royale rounded-[2.5rem] p-10 border border-white/5 group relative overflow-hidden">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-gold/10 text-gold shadow-gold-glow">
                  <Flame size={24} />
                </div>
                <h3 className="text-lg font-black text-ivory tracking-tighter uppercase">Mixología Top</h3>
             </div>
             <TopPerformanceBars items={data?.topDrinks || []} color="text-gold" bgBar="bg-grad-gold shadow-gold-glow" />
          </div>

          <div className="glass-royale rounded-[2.5rem] p-10 border border-white/5 group relative overflow-hidden">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-emerald-400/10 text-emerald-400 shadow-emerald-400/10">
                  <Target size={24} />
                </div>
                <h3 className="text-lg font-black text-ivory tracking-tighter uppercase">Gastronomía Top</h3>
             </div>
             <TopPerformanceBars items={data?.topFoods || []} color="text-emerald-400" bgBar="bg-emerald-400 shadow-emerald-400/20" />
          </div>
        </div>
      </div>

      {/* ================= SIDEBAR MONITORING ================= */}
      <div className="col-span-12 lg:col-span-4 space-y-8">
        
        {/* SERVICE HEALTH */}
        <div className="glass-royale rounded-[2.5rem] p-8 border border-white/10 shadow-royale">
          <div className="flex items-center gap-4 mb-6">
            <Monitor size={20} className="text-gold" />
            <h3 className="text-sm font-black text-ivory tracking-[0.2em] uppercase">Estado de Operación</h3>
          </div>
          <ServiceHealth data={data} />
        </div>

        {/* INVENTORY ALERTS */}
        <div className="glass-royale rounded-[2.5rem] p-8 border border-white/5 bg-red/5 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <ShieldAlert size={20} className="text-red animate-pulse" />
            <h3 className="text-sm font-black text-red tracking-[0.2em] uppercase">Alertas de Bóveda</h3>
          </div>
          <InventoryAlerts lowStock={data?.inventory?.lowStock || 0} outOfStock={data?.inventory?.outOfStock || 0} />
        </div>

        {/* LIVE ACTIVITY */}
        <div className="glass-royale rounded-[2.5rem] p-8 border border-white/5 flex-1 min-h-[400px]">
          <div className="flex items-center gap-4 mb-6">
            <Activity size={20} className="text-gold" />
            <h3 className="text-sm font-black text-ivory tracking-[0.2em] uppercase">Actividad en Vivo</h3>
          </div>
          <LiveActivity reservations={data.recentReservations} />
          
          <button className="w-full mt-10 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-4 hover:bg-gold/5 hover:border-gold/30 transition-all group">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted group-hover:text-gold">Ver Log Completo</span>
            <ArrowRight size={14} className="text-muted group-hover:text-gold group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  );
}

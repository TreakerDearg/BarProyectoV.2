"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllUserRouletteStats } from "../services/rouletteService";
import type { EmployeeRouletteStats } from "../services/rouletteService";
import { getSocket } from "../../../services/socket";
import { User2, RefreshCw, Trophy, Sparkles, Zap, Award, Star } from "lucide-react";

export default function PityTrackerPanel() {
  const [employees, setEmployees] = useState<EmployeeRouletteStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAllUserRouletteStats();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees roulette stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Listen to real-time spin outcomes to automatically update the dashboard
    const socket = getSocket();
    if (socket) {
      socket.on("roulette:spin", fetchStats);
      socket.on("roulette:admin:spin", fetchStats);
    }

    return () => {
      if (socket) {
        socket.off("roulette:spin", fetchStats);
        socket.off("roulette:admin:spin", fetchStats);
      }
    };
  }, [fetchStats]);

  if (loading && employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="text-gold animate-spin mb-4" size={32} />
        <span className="text-[10px] text-muted font-black tracking-widest uppercase">
          Cargando Pity Tracker...
        </span>
      </div>
    );
  }

  return (
    <div className="relative glass-royale border border-white/5 rounded-[2.5rem] p-10 shadow-royale overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-ivory tracking-tighter uppercase flex items-center gap-4">
            <Trophy size={24} className="text-gold animate-pulse" />
            Live Employee <span className="text-grad-gold">Pity Tracker</span>
          </h2>
          <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] mt-1">
            Garantías de Rareza y Progreso por Desempeño
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-5 py-2.5 bg-surface-3/30 hover:bg-gold/10 text-[9px] font-black tracking-widest text-gold rounded-xl border border-gold/20 transition-all active:scale-95"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> REFRESCAR
        </button>
      </div>

      {/* ================= BODY ================= */}
      <div className="space-y-6 max-h-[650px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
        {employees.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/5 rounded-3xl p-6">
            <User2 size={32} className="text-muted/30 mx-auto mb-3" />
            <p className="text-xs text-muted font-black uppercase tracking-wider">No se encontraron empleados activos</p>
          </div>
        ) : (
          employees.map(({ user, stats }) => {
            return (
              <div
                key={user.id}
                className="group relative p-8 rounded-3xl border border-white/5 bg-surface-3/15 hover:border-gold/20 hover:bg-surface-3/30 transition-all duration-500 shadow-lg"
              >
                {/* Employee Header Info */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-white/5 flex items-center justify-center text-xl shadow-inner group-hover:border-gold/35 transition-colors">
                      👤
                    </div>
                    <div>
                      <h3 className="text-base font-black text-ivory tracking-tight uppercase group-hover:text-gold transition-colors">
                        {user.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="px-3 py-1 bg-surface-3 text-muted text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                          {user.role}
                        </span>
                        {user.shift && (
                          <span className="px-3 py-1 bg-gold/5 text-gold text-[8px] font-black uppercase tracking-widest rounded-lg border border-gold/10">
                            Shift: {user.shift}
                          </span>
                        )}
                        <span className="text-[9px] text-muted font-bold">
                          Spins Totales: <strong className="text-ivory font-black">{stats.totalSpins}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* KPI luck buff display */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-muted font-black tracking-widest uppercase">KPI PRODUCTIVIDAD</span>
                        <span className="text-xs font-black text-gold">{user.kpiScore}%</span>
                      </div>
                      {user.hasLuckBuff ? (
                        <div className="flex items-center gap-1.5 mt-1 text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20 shadow-emerald-400/5 animate-pulse">
                          <Sparkles size={10} /> Buff de Suerte Activo (x{user.luckMultiplier})
                        </div>
                      ) : (
                        <div className="text-[8px] text-muted/60 font-bold uppercase tracking-widest mt-1">
                          Sin buff de suerte (Meta: 80%)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bars (Pity indicators) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                  {/* RARE Pity */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                      <span className="text-blue-400 flex items-center gap-1"><Zap size={10} /> Garantía RARE</span>
                      <span className="text-ivory">{stats.spinsSinceRare}/10 spins</span>
                    </div>
                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <div
                        className="h-full rounded-full bg-blue-400 transition-all duration-1000 shadow-md shadow-blue-400/20"
                        style={{ width: `${Math.min((stats.spinsSinceRare / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[8px] text-muted uppercase font-bold tracking-widest">
                      {stats.nextRarePity === 0 
                        ? "🏆 ¡Siguiente spin garantizado!" 
                        : `Garantizado en ${stats.nextRarePity} spins`}
                    </p>
                  </div>

                  {/* EPIC Pity */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                      <span className="text-purple-400 flex items-center gap-1"><Award size={10} /> Garantía EPIC</span>
                      <span className="text-ivory">{stats.spinsSinceEpic}/25 spins</span>
                    </div>
                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <div
                        className="h-full rounded-full bg-purple-400 transition-all duration-1000 shadow-md shadow-purple-400/20"
                        style={{ width: `${Math.min((stats.spinsSinceEpic / 25) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[8px] text-muted uppercase font-bold tracking-widest">
                      {stats.nextEpicPity === 0 
                        ? "🏆 ¡Siguiente spin garantizado!" 
                        : `Garantizado en ${stats.nextEpicPity} spins`}
                    </p>
                  </div>

                  {/* LEGENDARY Pity */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                      <span className="text-gold flex items-center gap-1"><Star size={10} /> Garantía LEGENDARY</span>
                      <span className="text-ivory">{stats.spinsSinceLegendary}/50 spins</span>
                    </div>
                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <div
                        className="h-full rounded-full bg-grad-gold transition-all duration-1000 shadow-md shadow-gold/20"
                        style={{ width: `${Math.min((stats.spinsSinceLegendary / 50) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[8px] text-muted uppercase font-bold tracking-widest">
                      {stats.nextLegendaryPity === 0 
                        ? "🏆 ¡Siguiente spin garantizado!" 
                        : `Garantizado en ${stats.nextLegendaryPity} spins`}
                    </p>
                  </div>
                </div>

                {/* Prize Breakdown list */}
                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/5 text-[9px] text-muted uppercase font-black tracking-widest justify-between items-center">
                  <span>🏆 Premios logrados:</span>
                  <div className="flex gap-4">
                    <span className="text-ivory">Common: <strong className="text-grad-gold">{stats.prizesWon.common}</strong></span>
                    <span className="text-blue-400">Rare: <strong className="text-grad-gold">{stats.prizesWon.rare}</strong></span>
                    <span className="text-purple-400">Epic: <strong className="text-grad-gold">{stats.prizesWon.epic}</strong></span>
                    <span className="text-gold">Legendary: <strong className="text-grad-gold">{stats.prizesWon.legendary}</strong></span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

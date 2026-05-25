import type { DashboardStats } from "../services/dashboardService";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Activity, 
  Trophy,
  ArrowUpRight,
  Sparkles
} from "lucide-react";

interface Props {
  data: DashboardStats;
}

export default function AnalyticsVersus({ data }: Props) {
  const radarData = data?.versusStats?.radarData || [];
  const headToHead = data?.versusStats?.headToHead || [];
  
  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      
      {/* ================= HEADER ANALYTICS ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <div>
          <h2 className="text-4xl font-black text-ivory tracking-tighter uppercase mb-2 flex items-center gap-4">
            <Sparkles className="text-gold" size={32} />
            Analytics <span className="text-grad-gold">// Versus</span>
          </h2>
          <p className="text-[10px] text-muted font-black uppercase tracking-[0.5em]">
            Protocolo de Comparación: Mixología de Autor vs. Clásicos
          </p>
        </div>
        <div className="flex bg-surface-3/30 p-1.5 rounded-2xl border border-white/5">
          {["24H", "7D", "30D"].map((t) => (
            <button key={t} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${t === '7D' ? 'bg-grad-gold text-bg' : 'text-muted hover:text-ivory'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ================= TOP SECTION: VELOCITY & MATRIX ================= */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* MATRIX CHART */}
        <div className="col-span-12 xl:col-span-6 glass-royale rounded-[3rem] p-10 border border-white/5 relative overflow-hidden group shadow-royale">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">Matriz de Atributos</h3>
              <p className="text-[9px] text-muted font-black uppercase tracking-[0.3em] mt-1">Comparativa de Rendimiento Operativo</p>
            </div>
            <div className="flex gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold shadow-gold-glow" />
                  <span className="text-[9px] font-black text-ivory tracking-widest uppercase">AUTOR</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-emerald-400/20" />
                  <span className="text-[9px] font-black text-ivory tracking-widest uppercase">CLÁSICO</span>
               </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Author" dataKey="A" stroke="#D4A340" strokeWidth={3} fill="#D4A340" fillOpacity={0.15} />
                <Radar name="Classic" dataKey="B" stroke="#34D399" strokeWidth={3} fill="#34D399" fillOpacity={0.05} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INSIGHTS STRIP */}
        <div className="col-span-12 xl:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-8">
           <InsightCard 
              label="Velocidad Clásica" 
              value="8.4" 
              subValue="ORD/HR" 
              icon={<Zap size={24} />} 
              trend="+12%" 
              color="emerald" 
           />
           <InsightCard 
              label="Velocidad Autor" 
              value="5.2" 
              subValue="ORD/HR" 
              icon={<Activity size={24} />} 
              trend="+24%" 
              color="gold" 
           />
           <InsightCard 
              label="Rentabilidad Neta" 
              value="62%" 
              subValue="MARGIN" 
              icon={<TrendingUp size={24} />} 
              trend="Peak" 
              color="gold" 
           />
           <InsightCard 
              label="Retención" 
              value="91%" 
              subValue="LOYALTY" 
              icon={<Target size={24} />} 
              trend="+5%" 
              color="emerald" 
           />
        </div>

      </div>

      {/* ================= BOTTOM SECTION: HEAD-TO-HEAD BATTLE ================= */}
      <div className="glass-royale rounded-[3rem] border border-white/5 overflow-hidden shadow-royale">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div className="flex items-center gap-6">
            <div className="p-3 rounded-2xl bg-gold/10 text-gold shadow-gold-glow">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">Battle of the Bar</h3>
              <p className="text-[9px] text-muted font-black uppercase tracking-[0.3em] mt-1">Comparativa Directa de Desempeño</p>
            </div>
          </div>
          <button className="px-8 py-3 rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all flex items-center gap-3 group">
            Ver Reporte Completo
            <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-muted uppercase tracking-[0.4em]">
                <th className="p-10 pl-14">Rank</th>
                <th className="p-10">Cocktail</th>
                <th className="p-10 text-center">Categoría</th>
                <th className="p-10 text-right">Vendidos</th>
                <th className="p-10 text-right">Profit Neto</th>
                <th className="p-10 text-center pr-14">Rendimiento</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {headToHead.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/2 transition-all group">
                  <td className="p-10 pl-14">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${item.rank === 1 ? 'bg-grad-gold text-bg shadow-gold-glow' : 'bg-surface-3/50 text-muted border border-white/5'}`}>
                      {item.rank}
                    </div>
                  </td>
                  <td className="p-10 font-black text-ivory uppercase tracking-tighter text-lg">
                    {item.name}
                  </td>
                  <td className="p-10 text-center">
                    <span className={`text-[9px] font-black tracking-widest px-4 py-2 rounded-xl border ${item.category === 'AUTHOR' ? 'border-gold/30 text-gold bg-gold/5' : 'border-emerald-400/30 text-emerald-400 bg-emerald-400/5'}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="p-10 text-right font-black text-ivory opacity-60 text-lg tracking-tighter">{item.sold.toLocaleString()}</td>
                  <td className="p-10 text-right font-black text-lime text-lg tracking-tighter">{item.profit}</td>
                  <td className="p-10 pr-14">
                    <div className="w-48 h-2 bg-surface-3/50 rounded-full overflow-hidden ml-auto border border-white/5">
                      <div className={`h-full ${item.category === 'AUTHOR' ? 'bg-grad-gold shadow-gold-glow' : 'bg-emerald-400 shadow-emerald-400/20'}`} style={{ width: `${item.perf}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function InsightCard({ label, value, subValue, icon, trend, color }: any) {
  const theme = color === 'gold' ? 'text-gold bg-gold/5 border-gold/10' : 'text-emerald-400 bg-emerald-400/5 border-emerald-400/10';
  return (
    <div className="glass-royale rounded-[2.5rem] p-10 border border-white/5 group hover:border-white/10 transition-all relative overflow-hidden">
       <div className="flex justify-between items-start mb-8">
          <div className={`p-4 rounded-2xl ${theme} transition-all group-hover:scale-110`}>
             {icon}
          </div>
          <div className="text-[10px] font-black text-lime px-3 py-1 rounded-full bg-lime/10 border border-lime/20">
             {trend}
          </div>
       </div>
       <div className="flex items-end gap-3">
          <p className="text-5xl font-black text-ivory tracking-tighter">{value}</p>
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">{subValue}</p>
       </div>
       <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mt-4">{label}</p>
    </div>
  );
}

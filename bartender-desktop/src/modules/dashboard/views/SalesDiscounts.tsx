import type { DashboardStats } from "../services/dashboardService";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { 
  DollarSign, 
  Gift, 
  RotateCw, 
  ArrowUpRight,
  TrendingUp,
  BarChart4,
  LayoutPanelLeft
} from "lucide-react";

interface Props {
  data: DashboardStats;
}

export default function SalesDiscounts({ data }: Props) {
  const hourlyData = data.hourlyData || [];
  
  const totalSpins = data?.rouletteSpins?.total || 1;
  const acceptedSpins = data?.rouletteSpins?.accepted || 0;
  const acceptedPct = Math.round((acceptedSpins / totalSpins) * 100);

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <div>
          <h2 className="text-4xl font-black text-ivory tracking-tighter uppercase mb-2 flex items-center gap-4">
            <BarChart4 className="text-emerald-400" size={32} />
            Sales <span className="text-grad-gold">& Discounts</span>
          </h2>
          <p className="text-[10px] text-muted font-black uppercase tracking-[0.5em]">
            Métricas de Rendimiento Financiero e Impacto de Descuentos
          </p>
        </div>
        <div className="flex bg-surface-3/30 p-1.5 rounded-2xl border border-white/5">
          {["DIARIO", "SEMANAL", "MENSUAL"].map((t) => (
            <button key={t} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${t === 'DIARIO' ? 'bg-grad-gold text-bg' : 'text-muted hover:text-ivory'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ================= KPI ROW ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <SalesKPICard 
          label="Total Ingresos" 
          value={`$${data.totalSales?.toLocaleString() || "0"}`} 
          icon={<DollarSign size={24} />} 
          sub="Basado en facturación real" 
          color="gold"
          trend="+15.2%"
        />

        <SalesKPICard 
          label="Incentivos Aplicados" 
          value={`$${data.discountsGiven?.toLocaleString() || "0"}`} 
          icon={<Gift size={24} />} 
          sub="Impacto total de promociones" 
          color="emerald"
          trend="8.5%"
        />

        <SalesKPICard 
          label="Engagement Ruleta" 
          value={`${data.rouletteSpins?.total || 0}`} 
          icon={<RotateCw size={24} />} 
          sub={`${acceptedPct}% de aceptación VIP`} 
          color="gold"
          trend="Peak"
        />

      </div>

      {/* ================= MAIN CHARTS ================= */}
      <div className="grid grid-cols-12 gap-8">
        
        <div className="col-span-12 lg:col-span-8 glass-royale rounded-[3rem] p-10 border border-white/5 shadow-royale">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">Rendimiento por Hora</h3>
              <p className="text-[9px] text-muted font-black uppercase tracking-[0.3em] mt-1">Comparativa de Ventas vs Incentivos</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-black text-muted tracking-widest uppercase">VENTAS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold" />
                <span className="text-[9px] font-black text-muted tracking-widest uppercase">DESCUENTOS</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4A340" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#D4A340" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.1)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }} />
                <Area type="monotone" dataKey="sales" stroke="#34D399" strokeWidth={3} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="discounts" stroke="#D4A340" strokeWidth={3} strokeDasharray="6 6" fill="url(#discGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass-royale rounded-[3rem] p-10 border border-white/5 flex flex-col justify-between">
           <div>
              <h3 className="text-xl font-black text-ivory tracking-tighter uppercase mb-2">Distribución</h3>
              <p className="text-[9px] text-muted font-black uppercase tracking-[0.3em]">Canales de Ingresos</p>
           </div>
           
           <div className="space-y-8 mt-10">
              {(data?.revenueByCategory || []).slice(0, 4).map((item: any, idx: number) => {
                 const totalRev = (data?.revenueByCategory || []).reduce((acc: number, curr: any) => acc + curr.value, 0) || 1;
                 const pct = Math.round((item.value / totalRev) * 100);
                 return (
                   <DistributionRow 
                     key={idx} 
                     label={item.name} 
                     value={pct} 
                     color={idx % 2 === 0 ? "gold" : "emerald"} 
                   />
                 );
              })}
              {(!data?.revenueByCategory || data.revenueByCategory.length === 0) && (
                <div className="text-center opacity-30 py-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-ivory">Sin Datos de Categoría</p>
                </div>
              )}
           </div>

           <div className="mt-10 pt-10 border-t border-white/5">
              <div className="flex items-center gap-4 text-gold">
                 <LayoutPanelLeft size={20} />
                 <p className="text-[10px] font-black uppercase tracking-widest text-ivory">Canal Dominante</p>
              </div>
              <p className="text-3xl font-black text-grad-gold tracking-tighter mt-4 uppercase">
                {data?.revenueByCategory?.[0]?.name || "N/A"}
              </p>
           </div>
        </div>

      </div>

      {/* ================= TABLE SECTION ================= */}
      <div className="glass-royale rounded-[3rem] border border-white/5 overflow-hidden shadow-royale">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/2">
           <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">Mixología de Alto Rendimiento</h3>
           <div className="bg-surface-3/50 border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-4 text-xs">
              <TrendingUp size={16} className="text-gold" />
              <span className="text-[10px] font-black text-muted uppercase tracking-widest">Análisis de Rentabilidad</span>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-muted uppercase tracking-[0.4em]">
                <th className="p-10 pl-14">Cocktail</th>
                <th className="p-10 text-center">Unidades</th>
                <th className="p-10 text-right">Revenue Bruto</th>
                <th className="p-10 text-right">Costo Incentivo</th>
                <th className="p-10 text-center">Tendencia</th>
                <th className="p-10 text-center pr-14 pr-14">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm font-black text-ivory">
              {data?.topDrinks?.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/2 transition-all">
                  <td className="p-10 pl-14">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-surface-3 border border-white/5 flex items-center justify-center text-xl shadow-inner">
                          🍸
                       </div>
                       <span className="text-lg tracking-tighter uppercase">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-10 text-center opacity-60 text-lg">{item.qty}</td>
                  <td className="p-10 text-right text-lg">${item.revenue.toLocaleString()}</td>
                  <td className="p-10 text-right text-emerald-400 text-lg">-${(item.revenue * 0.1).toFixed(0)}</td>
                  <td className="p-10 text-center">
                    <span className="px-4 py-2 rounded-xl bg-lime/10 text-lime border border-lime/20 text-[9px] tracking-widest">+12.4%</span>
                  </td>
                  <td className="p-10 text-center pr-14">
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                       <ArrowUpRight size={18} className="text-muted" />
                    </button>
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

function SalesKPICard({ label, value, icon, sub, color, trend }: any) {
  const theme = color === 'gold' ? 'text-gold' : 'text-emerald-400';
  return (
    <div className="glass-royale p-10 rounded-[3rem] border border-white/5 group hover:border-white/10 transition-all relative overflow-hidden shadow-royale">
      <div className="flex justify-between items-start mb-8">
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{label}</p>
        <div className={`${theme} opacity-30 group-hover:opacity-100 transition-opacity`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-5xl font-black ${theme} tracking-tighter leading-none`}>{value}</p>
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mt-4">{sub}</p>
        </div>
        <div className="px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black text-lime uppercase tracking-widest bg-lime/5">
          {trend}
        </div>
      </div>
    </div>
  );
}

function DistributionRow({ label, value, color }: any) {
  const theme = color === 'gold' ? 'bg-grad-gold shadow-gold-glow' : 'bg-emerald-400 shadow-emerald-400/20';
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
        <span className="text-ivory opacity-60">{label}</span>
        <span className={color === 'gold' ? 'text-gold' : 'text-emerald-400'}>{value}%</span>
      </div>
      <div className="w-full h-2 bg-surface-3/50 rounded-full overflow-hidden border border-white/5">
        <div className={`h-full ${theme}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

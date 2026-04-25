import type { DashboardStats } from "../services/dashboardService";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: DashboardStats;
}

export default function SalesDiscounts({ data }: Props) {
  // Datos reales desde el backend
  const hourlyData = data.hourlyData || [];
  
  // Calcular métricas de la ruleta
  const totalSpins = data.rouletteSpins?.total || 1; // evitar division por 0
  const acceptedSpins = data.rouletteSpins?.accepted || 0;
  const rejectedSpins = data.rouletteSpins?.rejected || 0;
  
  const acceptedPct = Math.round((acceptedSpins / totalSpins) * 100);
  const rejectedPct = Math.round((rejectedSpins / totalSpins) * 100);

  const cocktails = (data.topDrinks || []).map((drink) => ({
    name: drink.name,
    desc: "Cocktail", // Idealmente vendría del backend
    sold: drink.qty,
    rev: `$${drink.revenue.toLocaleString()}`,
    disc: "$-", // Idealmente calcularíamos el descuento por trago
    trend: "+10%", // Mocked for now
    up: true,
    color: "text-[#00FFFF]"
  }));

  return (
    <div className="flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end border-b border-obsidian/40 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide mb-1">
            Sales & Discounts
          </h2>
          <p className="text-xs text-gray-400">
            Real-time performance metrics and discount impact analysis.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-mono">
          <button className="px-4 py-1.5 border border-obsidian bg-[#FF007F]/20 text-[#FF007F] rounded shadow-[0_0_10px_rgba(255,0,127,0.2)]">DAILY</button>
          <button className="px-4 py-1.5 border border-obsidian rounded text-gray-400 hover:text-white transition">WEEKLY</button>
          <button className="px-4 py-1.5 border border-obsidian rounded text-gray-400 hover:text-white transition">MONTHLY</button>
        </div>
      </div>

      {/* TOP ROW: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* DISCOUNTS GIVEN */}
        <div className="bg-void border border-obsidian/40 rounded-xl p-6 shadow-glass relative flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">DISCOUNTS GIVEN</span>
            <span className="text-[#00FFFF]">🎁</span>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-white mb-2">${data.discountsGiven?.toLocaleString() || "0"}</h3>
            <p className="text-xs text-gray-500 mb-4">Total savings provided to customers</p>
            <div className="w-full h-1.5 bg-obsidian rounded-full overflow-hidden">
              <div className="h-full bg-[#00FFFF] shadow-[0_0_8px_#00FFFF] w-[65%]" />
            </div>
            <p className="text-[10px] text-[#00FFFF] text-right mt-1 font-mono">65% utilization of budget</p>
          </div>
        </div>

        {/* TOTAL REVENUE */}
        <div className="bg-void border border-[#FF007F]/50 rounded-xl p-6 shadow-[0_0_20px_rgba(255,0,127,0.15)] relative flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF007F]/10 to-transparent rounded-xl pointer-events-none" />
          <span className="text-[10px] text-[#FF007F] font-mono tracking-widest uppercase mb-2 relative z-10">TOTAL REVENUE</span>
          <h3 className="text-5xl font-bold text-white mb-3 relative z-10">${data.kpis.totalSales.toLocaleString()}</h3>
          <span className="text-xs font-mono bg-bar-green/20 text-bar-green px-3 py-1 rounded relative z-10 border border-bar-green/30">
            Real-time tracking
          </span>
        </div>

        {/* ROULETTE SPINS */}
        <div className="bg-void border border-obsidian/40 rounded-xl p-6 shadow-glass relative flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">ROULETTE SPINS</span>
            <span className="text-[#00FFFF]">🔄</span>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-white mb-2">{data.rouletteSpins?.total || 0}</h3>
            <p className="text-xs text-gray-500 mb-4">Customers letting destiny decide</p>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FF007F] shadow-[0_0_5px_#FF007F]"/> <span className="text-gray-400">Accepted ({acceptedPct}%)</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-obsidian border border-gray-600"/> <span className="text-gray-500">Rejected ({rejectedPct}%)</span></div>
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE ROW: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HOURLY PERFORMANCE */}
        <div className="lg:col-span-2 bg-void border border-obsidian/40 rounded-xl p-6 shadow-glass flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#FF007F]" />
              <h3 className="font-bold text-white text-sm">Hourly Performance</h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FF007F]"/> <span className="text-gray-400">Sales</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00FFFF]"/> <span className="text-gray-400">Discounts</span></div>
            </div>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSalesPink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF007F" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF007F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip contentStyle={{ backgroundColor: '#08090C', borderColor: '#1F2937' }} />
                <Area type="monotone" dataKey="sales" stroke="#FF007F" strokeWidth={2} fillOpacity={1} fill="url(#colorSalesPink)" />
                <Area type="monotone" dataKey="discounts" stroke="#00FFFF" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DISCOUNT USAGE */}
        <div className="bg-void border border-obsidian/40 rounded-xl p-6 shadow-glass flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-4 bg-[#00FFFF]" />
            <h3 className="font-bold text-white text-sm">Discount Usage</h3>
          </div>
          <div className="flex-1 space-y-5">
            {[
              { label: "Roulette Spin", val: 45 },
              { label: "Happy Hour", val: 30 },
              { label: "VIP Member", val: 15 },
              { label: "Promo Codes", val: 10 }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{item.label}</span>
                  <span className="text-[#00FFFF] font-mono">{item.val}%</span>
                </div>
                <div className="w-full h-1 bg-obsidian rounded-full overflow-hidden">
                  <div className="h-full bg-[#00FFFF] shadow-[0_0_5px_#00FFFF]" style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-obsidian/40">
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">MOST POPULAR</span>
            <p className="text-lg font-bold text-white mt-1">Roulette Spin</p>
            <p className="text-xs text-[#00FFFF] font-mono mt-0.5">Avg. discount: $4.50</p>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: TOP PERFORMING COCKTAILS */}
      <div className="bg-void border border-obsidian/40 rounded-xl shadow-glass overflow-hidden">
        <div className="p-4 border-b border-obsidian/40 flex justify-between items-center bg-obsidian/30">
          <div className="flex items-center gap-3">
            <span className="text-[#FF007F] text-lg">🔥</span>
            <h3 className="text-white font-bold tracking-wide text-sm">Top Performing Cocktails</h3>
          </div>
          <div className="bg-obsidian border border-obsidian/60 px-3 py-1.5 rounded flex items-center gap-2 text-xs text-gray-400">
            <span>🔍</span>
            <input type="text" placeholder="Search cocktails..." className="bg-transparent border-none outline-none text-white w-32" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-obsidian text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-obsidian/10">
                <th className="p-4 pl-6">Cocktail Name</th>
                <th className="p-4 text-center">Units Sold</th>
                <th className="p-4 text-right">Gross Revenue</th>
                <th className="p-4 text-right">Discount Cost</th>
                <th className="p-4 text-center">Trend</th>
                <th className="p-4 text-center pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {cocktails.map((item, idx) => (
                <tr key={idx} className="border-b border-obsidian/50 hover:bg-obsidian/20 transition group">
                  <td className="p-4 pl-6 flex items-center gap-4">
                    <div className={`w-8 h-8 rounded bg-obsidian flex items-center justify-center border border-obsidian/60 ${item.color} shadow-[0_0_8px_currentColor]`}>
                      🍸
                    </div>
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono text-gray-300">{item.sold}</td>
                  <td className="p-4 text-right font-mono text-white">{item.rev}</td>
                  <td className="p-4 text-right font-mono text-[#00FFFF] font-bold">{item.disc}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-mono px-2 py-1 rounded border ${item.up === true ? 'border-bar-green/30 text-bar-green bg-bar-green/10' : item.up === false ? 'border-bar-red/30 text-bar-red bg-bar-red/10' : 'border-gray-500/30 text-gray-400 bg-gray-500/10'}`}>
                      {item.trend}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-center text-gray-500 cursor-pointer hover:text-white">
                    •••
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

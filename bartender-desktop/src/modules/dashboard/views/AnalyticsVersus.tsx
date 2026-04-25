import type { DashboardStats } from "../services/dashboardService";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface Props {
  data: DashboardStats;
}

export default function AnalyticsVersus({ data }: Props) {
  // Use real data from the backend or fallback to empty/defaults
  const radarData = data.versusStats?.radarData || [];
  const headToHead = data.versusStats?.headToHead || [];
  
  const classicVelocity = data.versusStats?.classicVelocity || 0;
  const authorVelocity = data.versusStats?.authorVelocity || 0;
  
  const classicRevShare = data.versusStats?.classicRevShare || 0;
  const authorRevShare = data.versusStats?.authorRevShare || 0;

  return (
    <div className="flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end border-b border-obsidian/40 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">
            ANALYTICS // <span className="text-[#FF007F]">MODE: VERSUS</span>
          </h2>
          <p className="text-xs text-[#00FFFF] tracking-[0.2em] font-mono">
            COMPARISON PROTOCOL: AUTHOR [V2.0] VS CLASSIC [LEGACY]
          </p>
        </div>
        <div className="flex gap-2 text-xs font-mono">
          <button className="px-4 py-1.5 border border-obsidian rounded text-gray-400 hover:text-white transition">24H</button>
          <button className="px-4 py-1.5 border border-obsidian bg-obsidian/50 rounded text-white">7 DAYS</button>
          <button className="px-4 py-1.5 border border-obsidian rounded text-gray-400 hover:text-white transition">30 DAYS</button>
        </div>
      </div>

      {/* TOP ROW: VELOCITY & MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CLASSIC VELOCITY */}
        <div className="bg-void border border-[#00FFFF]/20 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.05)] relative overflow-hidden flex flex-col">
          <h3 className="text-[#00FFFF] text-sm font-bold tracking-widest uppercase mb-6">CLASSIC VELOCITY</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Fake Gauge */}
            <div className="w-40 h-20 overflow-hidden relative">
              <div className="w-40 h-40 rounded-full border-[10px] border-obsidian border-t-[#00FFFF] border-r-[#00FFFF] rotate-45 opacity-80 shadow-[0_0_20px_#00FFFF]" />
            </div>
            <div className="absolute top-10 flex flex-col items-center">
              <span className="text-4xl font-bold text-white">{classicVelocity}</span>
              <span className="text-[10px] text-gray-400 font-mono tracking-widest">ORDERS / HR</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-obsidian/50 rounded p-3 border border-obsidian">
              <p className="text-[10px] text-gray-500 font-mono mb-1">REV SHARE</p>
              <p className="text-lg font-bold text-white">{classicRevShare}%</p>
            </div>
            <div className="bg-obsidian/50 rounded p-3 border border-obsidian">
              <p className="text-[10px] text-gray-500 font-mono mb-1">TREND</p>
              <p className="text-lg font-bold text-[#00FFFF]">~ +12%</p>
            </div>
          </div>
        </div>

        {/* ATTRIBUTE MATRIX */}
        <div className="bg-void border border-obsidian/40 rounded-xl p-6 shadow-glass relative">
          <h3 className="text-white text-center text-sm font-bold tracking-widest uppercase mb-2">ATTRIBUTE MATRIX</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#1F2937" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Classic" dataKey="classic" stroke="#00FFFF" strokeWidth={2} fill="#00FFFF" fillOpacity={0.1} />
                <Radar name="Author" dataKey="author" stroke="#FF007F" strokeWidth={2} fill="#FF007F" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#00FFFF] rounded-sm shadow-[0_0_8px_#00FFFF]" /><span className="text-xs text-gray-400 font-mono">CLASSIC</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#FF007F] rounded-sm shadow-[0_0_8px_#FF007F]" /><span className="text-xs text-gray-400 font-mono">AUTHOR</span></div>
          </div>
        </div>

        {/* AUTHOR VELOCITY */}
        <div className="bg-void border border-[#FF007F]/20 rounded-xl p-6 shadow-[0_0_30px_rgba(255,0,127,0.05)] relative overflow-hidden flex flex-col">
          <h3 className="text-[#FF007F] text-sm font-bold tracking-widest uppercase mb-6 text-right">AUTHOR VELOCITY</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="w-40 h-20 overflow-hidden relative">
              <div className="w-40 h-40 rounded-full border-[10px] border-obsidian border-t-[#FF007F] border-l-[#FF007F] -rotate-45 opacity-80 shadow-[0_0_20px_#FF007F]" />
            </div>
            <div className="absolute top-10 flex flex-col items-center">
              <span className="text-4xl font-bold text-white">{authorVelocity}</span>
              <span className="text-[10px] text-gray-400 font-mono tracking-widest">ORDERS / HR</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-obsidian/50 rounded p-3 border border-obsidian">
              <p className="text-[10px] text-gray-500 font-mono mb-1">REV SHARE</p>
              <p className="text-lg font-bold text-white">{authorRevShare}%</p>
            </div>
            <div className="bg-obsidian/50 rounded p-3 border border-obsidian">
              <p className="text-[10px] text-gray-500 font-mono mb-1">TREND</p>
              <p className="text-lg font-bold text-[#FF007F]">~ +8%</p>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: BATTLE OF THE BAR */}
      <div className="bg-void border border-obsidian/40 rounded-xl shadow-glass overflow-hidden">
        <div className="p-4 border-b border-obsidian/40 flex justify-between items-center bg-obsidian/30">
          <div className="flex items-center gap-3">
            <span className="text-bar-gold text-lg">🏆</span>
            <h3 className="text-white font-bold tracking-widest uppercase text-sm">BATTLE OF THE BAR // HEAD-TO-HEAD</h3>
          </div>
          <button className="text-xs text-gray-400 font-mono hover:text-white transition">VIEW FULL REPORT -{'>'}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-obsidian text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                <th className="p-4 pl-6">Rank</th>
                <th className="p-4">Cocktail Name</th>
                <th className="p-4 text-center">Category</th>
                <th className="p-4 text-right">Sold</th>
                <th className="p-4 text-right">Net Profit</th>
                <th className="p-4 text-center w-32 pr-6">Performance</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {headToHead.map((item, idx) => (
                <tr key={idx} className="border-b border-obsidian/50 hover:bg-obsidian/20 transition group">
                  <td className="p-4 pl-6">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${item.rank === 1 ? 'bg-bar-gold text-black shadow-[0_0_10px_#D4A340]' : 'bg-obsidian text-gray-400'}`}>
                      {item.rank}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                    <div className={`w-8 h-8 rounded bg-obsidian flex items-center justify-center border ${item.category === 'AUTHOR' ? 'border-[#FF007F]/40 text-[#FF007F]' : 'border-[#00FFFF]/40 text-[#00FFFF]'}`}>
                      🍸
                    </div>
                    {item.name}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-mono px-2 py-1 rounded border ${item.category === 'AUTHOR' ? 'border-[#FF007F]/40 text-[#FF007F] bg-[#FF007F]/10' : 'border-[#00FFFF]/40 text-[#00FFFF] bg-[#00FFFF]/10'}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono text-gray-300">{item.sold.toLocaleString()}</td>
                  <td className="p-4 text-right font-bold text-bar-green">{item.profit}</td>
                  <td className="p-4 pr-6">
                    <div className="w-full h-1.5 bg-obsidian rounded-full overflow-hidden">
                      <div className={`h-full ${item.category === 'AUTHOR' ? 'bg-[#FF007F] shadow-[0_0_8px_#FF007F]' : 'bg-[#00FFFF] shadow-[0_0_8px_#00FFFF]'}`} style={{ width: `${item.perf}%` }} />
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

import type { DashboardStats } from "../../services/dashboardService";

interface Props {
  data: DashboardStats;
}

export default function ServiceHealth({ data }: Props) {
  // Simularemos datos de carga por ahora basados en cantidad de mesas ocupadas o ventas
  const isPeak = data.kpis.todayOrders > 100;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-bold text-white mb-6">Real-time Service Health</h3>

      <div className="space-y-6 flex-1">

        {/* Kitchen Load */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">Kitchen Load</span>
            <span className={`px-2 py-0.5 rounded font-bold ${isPeak ? 'bg-bar-red/20 text-bar-red' : 'bg-bar-green/20 text-bar-green'}`}>
              {isPeak ? 'CRITICAL' : 'OPTIMAL'}
            </span>
          </div>
          <div className="flex gap-1 h-2 mb-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${i <= (isPeak ? 5 : 2) ? (isPeak ? 'bg-bar-red shadow-[0_0_8px_#C83228]' : 'bg-bar-green shadow-[0_0_8px_#34B964]') : 'bg-obsidian'}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-500">Avg. Ticket Time: {isPeak ? '28 min' : '14 min'}</p>
        </div>

        {/* Bar Queue */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">Bar Queue</span>
            <span className="bg-bar-green/20 text-bar-green px-2 py-0.5 rounded font-bold">
              OPTIMAL
            </span>
          </div>
          <div className="flex gap-1 h-2 mb-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${i <= 3 ? 'bg-bar-green shadow-[0_0_8px_#34B964]' : 'bg-obsidian'}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-500">Avg. Drink Time: 4 min</p>
        </div>

      </div>
    </div>
  );
}

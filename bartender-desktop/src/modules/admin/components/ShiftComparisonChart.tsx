import { Flame, Sparkles, Clock, Award, TrendingUp } from "lucide-react";

interface ShiftComparisonChartProps {
  comparativeMetrics: {
    morning: any;
    afternoon: any;
    night: any;
    comparison: {
      bestPerformingShift: string;
      totalOrders: { morning: number; afternoon: number; night: number };
      totalSales: { morning: number; afternoon: number; night: number };
      averageProductivity: { morning: number; afternoon: number; night: number };
    };
  };
  formatCurrency: (value: number) => string;
}

export default function ShiftComparisonChart({ comparativeMetrics, formatCurrency }: ShiftComparisonChartProps) {
  const shiftConfig = {
    morning: {
      label: "Mañana",
      icon: <Flame size={24} />,
      color: "text-fused-neon-green",
      bgGradient: "from-fused-neon-green/20 to-fused-neon-green/5",
      borderGradient: "border-fused-neon-green/30",
      glow: "shadow-[0_0_30px_rgba(0,255,136,0.3)]"
    },
    afternoon: {
      label: "Tarde",
      icon: <Sparkles size={24} />,
      color: "text-fused-gold",
      bgGradient: "from-fused-gold/20 to-fused-gold/5",
      borderGradient: "border-fused-gold/30",
      glow: "shadow-[0_0_30px_rgba(212,175,55,0.3)]"
    },
    night: {
      label: "Noche",
      icon: <Clock size={24} />,
      color: "text-fused-neon-purple",
      bgGradient: "from-fused-neon-purple/20 to-fused-neon-purple/5",
      borderGradient: "border-fused-neon-purple/30",
      glow: "shadow-[0_0_30px_rgba(177,71,255,0.3)]"
    }
  };

  const maxOrders = Math.max(
    comparativeMetrics.comparison.totalOrders.morning,
    comparativeMetrics.comparison.totalOrders.afternoon,
    comparativeMetrics.comparison.totalOrders.night
  );

  const maxSales = Math.max(
    comparativeMetrics.comparison.totalSales.morning,
    comparativeMetrics.comparison.totalSales.afternoon,
    comparativeMetrics.comparison.totalSales.night
  );

  const getBarWidth = (value: number, max: number) => {
    return max > 0 ? `${(value / max) * 100}%` : "0%";
  };

  return (
    <div className="space-y-6">
      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparativeMetrics.morning && (
          <div
            className={`fused-nebula-panel p-6 relative overflow-hidden group hover:${shiftConfig.morning.glow} transition-all duration-500`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${shiftConfig.morning.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            <div className="fused-aurora absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${shiftConfig.morning.bgGradient} border ${shiftConfig.morning.borderGradient}`}>
                  {shiftConfig.morning.icon}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${shiftConfig.morning.color}`} style={{ fontFamily: 'var(--fused-font-display)' }}>
                    {shiftConfig.morning.label}
                  </h3>
                  <p className="text-xs text-fused-text-secondary">6:00 - 12:00</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Pedidos</span>
                    <span className="text-lg font-bold text-fused-text-primary">
                      {comparativeMetrics.comparison.totalOrders.morning}
                    </span>
                  </div>
                  <div className="h-2 bg-fused-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-fused-neon-green to-fused-neon-blue transition-all duration-1000 ease-out`}
                      style={{ width: getBarWidth(comparativeMetrics.comparison.totalOrders.morning, maxOrders) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Ventas</span>
                    <span className={`text-lg font-bold text-fused-gold`}>
                      {formatCurrency(comparativeMetrics.comparison.totalSales.morning)}
                    </span>
                  </div>
                  <div className="h-2 bg-fused-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-fused-gold to-fused-neon-orange transition-all duration-1000 ease-out`}
                      style={{ width: getBarWidth(comparativeMetrics.comparison.totalSales.morning, maxSales) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Productividad</span>
                    <span className="text-lg font-bold text-fused-text-primary">
                      {comparativeMetrics.comparison.averageProductivity.morning.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-fused-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-fused-neon-green to-fused-neon-purple transition-all duration-1000 ease-out`}
                      style={{ width: `${comparativeMetrics.comparison.averageProductivity.morning}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {comparativeMetrics.afternoon && (
          <div
            className={`fused-nebula-panel p-6 relative overflow-hidden group hover:${shiftConfig.afternoon.glow} transition-all duration-500`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${shiftConfig.afternoon.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            <div className="fused-aurora absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${shiftConfig.afternoon.bgGradient} border ${shiftConfig.afternoon.borderGradient}`}>
                  {shiftConfig.afternoon.icon}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${shiftConfig.afternoon.color}`} style={{ fontFamily: 'var(--fused-font-display)' }}>
                    {shiftConfig.afternoon.label}
                  </h3>
                  <p className="text-xs text-fused-text-secondary">12:00 - 18:00</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Pedidos</span>
                    <span className="text-lg font-bold text-fused-text-primary">
                      {comparativeMetrics.comparison.totalOrders.afternoon}
                    </span>
                  </div>
                  <div className="h-2 bg-fused-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-fused-gold to-fused-neon-orange transition-all duration-1000 ease-out`}
                      style={{ width: getBarWidth(comparativeMetrics.comparison.totalOrders.afternoon, maxOrders) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Ventas</span>
                    <span className={`text-lg font-bold text-fused-gold`}>
                      {formatCurrency(comparativeMetrics.comparison.totalSales.afternoon)}
                    </span>
                  </div>
                  <div className="h-2 bg-fused-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-fused-gold to-fused-neon-pink transition-all duration-1000 ease-out`}
                      style={{ width: getBarWidth(comparativeMetrics.comparison.totalSales.afternoon, maxSales) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Productividad</span>
                    <span className="text-lg font-bold text-fused-text-primary">
                      {comparativeMetrics.comparison.averageProductivity.afternoon.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-fused-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-fused-gold to-fused-neon-purple transition-all duration-1000 ease-out`}
                      style={{ width: `${comparativeMetrics.comparison.averageProductivity.afternoon}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {comparativeMetrics.night && (
          <div
            className={`fused-nebula-panel p-6 relative overflow-hidden group hover:${shiftConfig.night.glow} transition-all duration-500`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${shiftConfig.night.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            <div className="fused-aurora absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${shiftConfig.night.bgGradient} border ${shiftConfig.night.borderGradient}`}>
                  {shiftConfig.night.icon}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${shiftConfig.night.color}`} style={{ fontFamily: 'var(--fused-font-display)' }}>
                    {shiftConfig.night.label}
                  </h3>
                  <p className="text-xs text-fused-text-secondary">18:00 - 24:00</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Pedidos</span>
                    <span className="text-lg font-bold text-fused-text-primary">
                      {comparativeMetrics.comparison.totalOrders.night}
                    </span>
                  </div>
                  <div className="h-2 bg-fused-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-fused-neon-purple to-fused-neon-pink transition-all duration-1000 ease-out`}
                      style={{ width: getBarWidth(comparativeMetrics.comparison.totalOrders.night, maxOrders) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Ventas</span>
                    <span className={`text-lg font-bold text-fused-gold`}>
                      {formatCurrency(comparativeMetrics.comparison.totalSales.night)}
                    </span>
                  </div>
                  <div className="h-2 bg-fused-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-fused-neon-purple to-fused-neon-blue transition-all duration-1000 ease-out`}
                      style={{ width: getBarWidth(comparativeMetrics.comparison.totalSales.night, maxSales) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Productividad</span>
                    <span className="text-lg font-bold text-fused-text-primary">
                      {comparativeMetrics.comparison.averageProductivity.night.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-fused-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-fused-neon-purple to-fused-neon-green transition-all duration-1000 ease-out`}
                      style={{ width: `${comparativeMetrics.comparison.averageProductivity.night}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Best Performing Shift Badge */}
      <div className="fused-nebula-panel p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-fused-gold/10 to-fused-neon-purple/10" />
        <div className="fused-aurora absolute inset-0 opacity-20" />
        
        <div className="relative z-10 flex items-center justify-center gap-4">
          <div className="p-3 rounded-xl bg-fused-gold/20 border border-fused-gold/30">
            <Award size={28} className="text-fused-gold animate-pulse" />
          </div>
          <div className="text-center">
            <div className="text-sm text-fused-text-secondary font-semibold uppercase tracking-wider mb-1">
              Mejor Turno
            </div>
            <div className="text-2xl font-black text-fused-gold" style={{ fontFamily: 'var(--fused-font-display)' }}>
              {comparativeMetrics.comparison.bestPerformingShift === "morning" ? "Mañana" : comparativeMetrics.comparison.bestPerformingShift === "afternoon" ? "Tarde" : "Noche"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-fused-gold" />
            <span className="text-sm text-fused-text-secondary">
              Basado en productividad y ventas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

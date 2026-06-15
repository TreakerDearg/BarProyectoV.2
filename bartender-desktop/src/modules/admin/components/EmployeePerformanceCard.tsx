import { Award, TrendingUp, ShoppingCart, DollarSign, Clock, Target } from "lucide-react";

interface EmployeePerformanceCardProps {
  employee: {
    userId: string;
    userName: string;
    totalShifts: number;
    totalOrders: number;
    totalSales: number;
    averageProductivity: number;
    shifts: Array<{
      date: string;
      shiftType: string;
      orders: number;
      sales: number;
      productivity: number;
    }>;
  };
  formatCurrency: (value: number) => string;
}

export default function EmployeePerformanceCard({ employee, formatCurrency }: EmployeePerformanceCardProps) {
  const productivityColor = employee.averageProductivity >= 75 ? "text-fused-neon-green" : employee.averageProductivity >= 50 ? "text-fused-gold" : "text-fused-neon-red";
  const productivityGradient = employee.averageProductivity >= 75 ? "from-fused-neon-green/20 to-fused-neon-green/5" : employee.averageProductivity >= 50 ? "from-fused-gold/20 to-fused-gold/5" : "from-fused-neon-red/20 to-fused-neon-red/5";

  return (
    <div className="fused-nebula-panel p-6 relative overflow-hidden group">
      {/* Aurora Effect Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${productivityGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      <div className="fused-aurora absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-fused-gold/20 blur-xl rounded-full animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-fused-gold/30 to-fused-neon-purple/30 border-2 border-fused-gold/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-fused-text-primary">
                  {employee.userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-fused-text-primary" style={{ fontFamily: 'var(--fused-font-display)' }}>
                {employee.userName}
              </h3>
              <p className="text-sm text-fused-text-secondary">{employee.totalShifts} turnos trabajados</p>
            </div>
          </div>
          <div className={`text-3xl font-black ${productivityColor} flex items-center gap-2`}>
            {employee.averageProductivity.toFixed(1)}%
            <Award size={24} className="animate-pulse" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="fused-metric-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart size={18} className="text-fused-neon-blue" />
              <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Pedidos</span>
            </div>
            <div className="text-2xl font-bold text-fused-text-primary">{employee.totalOrders}</div>
          </div>
          <div className="fused-metric-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-fused-gold" />
              <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Ventas</span>
            </div>
            <div className="text-2xl font-bold text-fused-text-primary">{formatCurrency(employee.totalSales)}</div>
          </div>
          <div className="fused-metric-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className={productivityColor} />
              <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Productividad</span>
            </div>
            <div className="text-2xl font-bold text-fused-text-primary">{employee.averageProductivity.toFixed(1)}%</div>
          </div>
        </div>

        {/* Shift History */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-fused-gold" />
            <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">Historial de Turnos Recientes</span>
          </div>
          <div className="space-y-2">
            {employee.shifts.slice(0, 5).map((shift, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-fused-bg-tertiary/50 border border-fused-glass-border hover:border-fused-gold/30 transition-all duration-300 group/shift"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-fused-gold/10 border border-fused-gold/20 flex items-center justify-center">
                    <Target size={14} className="text-fused-gold" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-fused-text-primary">{shift.date}</div>
                    <div className="text-xs text-fused-text-secondary capitalize">{shift.shiftType}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <ShoppingCart size={14} className="text-fused-neon-blue" />
                    <span className="text-fused-text-primary font-semibold">{shift.orders}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} className="text-fused-gold" />
                    <span className="text-fused-gold font-semibold">{formatCurrency(shift.sales)}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${shift.productivity >= 75 ? 'bg-fused-neon-green/20 text-fused-neon-green' : shift.productivity >= 50 ? 'bg-fused-gold/20 text-fused-gold' : 'bg-fused-neon-red/20 text-fused-neon-red'}`}>
                    {shift.productivity.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

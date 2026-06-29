import { Award, TrendingUp, ShoppingCart, DollarSign, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";

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
  const productivityColor = employee.averageProductivity >= 75 ? "text-emerald-400" : employee.averageProductivity >= 50 ? "text-gold" : "text-red-400";
  const productivityGradient = employee.averageProductivity >= 75 ? "from-emerald/20 to-green/10" : employee.averageProductivity >= 50 ? "from-gold/20 to-amber/10" : "from-red/20 to-orange/10";

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-surface-2 to-surface-3 relative overflow-hidden group"
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${productivityGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-gold/30 to-violet/30 border-2 border-gold/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {employee.userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {employee.userName}
              </h3>
              <p className="text-sm text-white/50">{employee.totalShifts} turnos trabajados</p>
            </div>
          </div>
          <div className={`text-3xl font-bold ${productivityColor} flex items-center gap-2`}>
            {employee.averageProductivity.toFixed(1)}%
            <Award size={24} className="animate-pulse" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart size={18} className="text-cyan-400" />
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Pedidos</span>
            </div>
            <div className="text-2xl font-bold text-white">{employee.totalOrders}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-gold" />
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Ventas</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(employee.totalSales)}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className={productivityColor} />
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Productividad</span>
            </div>
            <div className="text-2xl font-bold text-white">{employee.averageProductivity.toFixed(1)}%</div>
          </div>
        </div>

        {/* Shift History */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-gold" />
            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Historial de Turnos Recientes</span>
          </div>
          <div className="space-y-2">
            {employee.shifts.slice(0, 5).map((shift, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-gold/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <Target size={14} className="text-gold" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{shift.date}</div>
                    <div className="text-xs text-white/50 capitalize">{shift.shiftType}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <ShoppingCart size={14} className="text-cyan-400" />
                    <span className="text-white font-semibold">{shift.orders}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} className="text-gold" />
                    <span className="text-gold font-semibold">{formatCurrency(shift.sales)}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${shift.productivity >= 75 ? 'bg-emerald/10 text-emerald-400' : shift.productivity >= 50 ? 'bg-gold/10 text-gold' : 'bg-red/10 text-red-400'}`}>
                    {shift.productivity.toFixed(1)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

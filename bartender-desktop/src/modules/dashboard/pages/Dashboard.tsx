// pages/DashboardPage.tsx
import { useDashboard } from "../hooks/useDashboard";
import { KpiCard } from "../components/KpiCard";
import { SalesChart } from "../components/SalesChart";


export default function DashboardPage() {
  const { data, loading } = useDashboard();

  if (loading || !data) {
    return <div className="text-gray-400">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Ventas Totales" value={`$${data.totalSales}`} />
        <KpiCard title="Pedidos" value={data.totalOrders} />
        <KpiCard title="Hoy" value={data.todayOrders} />
        <KpiCard title="Reservas Hoy" value={data.reservationsToday} />
      </div>

      {/* Charts */}
      <SalesChart data={data.salesData} />
    </div>
  );
}
// pages/DashboardPage.tsx
import { useDashboard } from "../hooks/useDashboard";
import { KpiCard } from "../components/KpiCard";
import { SalesChart } from "../components/SalesChart";
import { OrdersChart } from "../components/OrdersChart";

export default function DashboardPage() {
  const { data, loading } = useDashboard();

  if (loading || !data) {
    return <div className="text-gray-400">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Ventas del Día" value={`$${data.sales}`} />
        <KpiCard title="Pedidos" value={data.orders} />
        <KpiCard title="Reservas" value={data.reservations} />
        <KpiCard title="Mesas" value={data.tables} />
      </div>

      {/* Charts */}
      <SalesChart data={data.salesHistory} />
      <OrdersChart data={data.ordersHistory} />
    </div>
  );
}
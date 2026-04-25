import type { DashboardStats } from "../services/dashboardService";
import KpiCard from "../components/kpi/KpiCard";
import RevenueStreamChart from "../components/charts/RevenueStreamChart";
import TopPerformanceBars from "../components/performance/TopPerformanceBars";
import ServiceHealth from "../components/health/ServiceHealth";
import InventoryAlerts from "../components/alerts/InventoryAlerts";
import LiveActivity from "../components/alerts/LiveActivity";
import { Activity, Receipt, DollarSign, Users } from "lucide-react";

interface Props {
  data: DashboardStats;
}

export default function ServiceDashboard({ data }: Props) {
  // Safe math for table occupancy (mocked as tables occupied / total, since we only have aggregate counts right now)
  const totalTables = data.tables.reduce((acc, t) => acc + t.count, 0) || 1;
  const occupiedTables = data.tables.find(t => t._id === "occupied")?.count || 0;
  const occupancy = Math.round((occupiedTables / totalTables) * 100);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* ================= TOP KPIS ================= */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="TOTAL SALES"
          value={`$${data.kpis.totalSales.toLocaleString()}`}
          trend="+12.4%"
          trendUp={true}
          icon={<DollarSign size={20} className="text-bar-gold" />}
        />
        <KpiCard
          title="TOTAL ORDERS"
          value={data.kpis.totalOrders}
          trend="+8.2%"
          trendUp={true}
          icon={<Receipt size={20} className="text-bar-gold" />}
        />
        <KpiCard
          title="AVG TICKET"
          value={`$${data.kpis.avgTicket.toFixed(2)}`}
          trend="-0.0%"
          trendUp={false}
          icon={<Activity size={20} className="text-bar-gold" />}
        />
        <KpiCard
          title="TABLE OCCUPANCY"
          value={`${occupancy}%`}
          trend={occupancy > 80 ? "Peak" : "Normal"}
          trendUp={occupancy > 80}
          icon={<Users size={20} className={occupancy > 80 ? "text-bar-red" : "text-bar-gold"} />}
          alert={occupancy > 80}
        />
      </div>

      {/* ================= MIDDLE ROW ================= */}
      <div className="col-span-12 lg:col-span-8 bg-void border border-obsidian/40 rounded-xl p-6 shadow-glass relative overflow-hidden">
        <RevenueStreamChart data={data.salesData} />
      </div>

      <div className="col-span-12 lg:col-span-4 bg-void border border-obsidian/40 rounded-xl p-6 shadow-glass">
        <ServiceHealth data={data} />
      </div>

      {/* ================= BOTTOM ROW ================= */}
      <div className="col-span-12 lg:col-span-8 bg-void border border-obsidian/40 rounded-xl p-6 shadow-glass">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TopPerformanceBars title="Top Drinks" items={data.topDrinks} color="text-bar-gold" bgBar="bg-bar-gold" />
          <TopPerformanceBars title="Top Dishes" items={data.topFoods} color="text-bar-green" bgBar="bg-bar-green" />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <InventoryAlerts lowStock={data.inventory.lowStock} outOfStock={data.inventory.outOfStock} />
        <LiveActivity />
      </div>
    </div>
  );
}

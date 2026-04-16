"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import SalesChart from "@/components/charts/SalesChart";
import TopDrinksChart from "@/components/charts/TopDrinksChart";
import KpiCard from "@/components/charts/KpiCard";
import { getDashboardStats, DashboardStats } from "@/services/dashboardService";
import {
  DollarSign,
  ShoppingCart,
  Wine,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-zinc-400">Cargando dashboard...</p>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <p className="text-red-400">Error al cargar el dashboard.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl neon-text mb-6">DASHBOARD</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Ventas Totales"
          value={`$${stats.totalSales}`}
          icon={<DollarSign />}
        />
        <KpiCard
          title="Pedidos Totales"
          value={stats.totalOrders}
          icon={<ShoppingCart />}
        />
        <KpiCard
          title="Pedidos Hoy"
          value={stats.todayOrders}
          icon={<ShoppingCart />}
        />
        <KpiCard
          title="Bebida Más Vendida"
          value={stats.topDrink}
          icon={<Wine />}
        />
      </div>

      {/* ALERTAS */}
      <div className="card mb-6 flex items-center gap-3">
        <AlertTriangle className="text-yellow-400" />
        <p className="text-zinc-300">
          {stats.lowStockProducts} productos con bajo stock.
        </p>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesChart data={stats.salesData} />
        <TopDrinksChart data={stats.topDrinks} />
      </div>
    </AdminLayout>
  );
}
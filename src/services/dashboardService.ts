const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  todayOrders: number;
  topDrink: string;
  lowStockProducts: number;
  salesData: { name: string; total: number }[];
  topDrinks: { name: string; value: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await fetch(`${API_URL}/dashboard`, {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener estadísticas");
  }

  return data;
};
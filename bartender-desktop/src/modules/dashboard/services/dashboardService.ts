import api from "../../../services/api";

/* =========================================================
   TYPES
========================================================= */
export interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
  type: "drink" | "food";
}

export interface SalesData {
  date: string;
  orders: number;
  total: number;
}

export interface TableStats {
  _id: string;
  count: number;
}

export interface HourlyData {
  time: string;
  sales: number;
  discounts: number;
}

export interface DashboardStats {
  kpis: {
    totalSales: number;
    totalOrders: number;
    todayOrders: number;
    avgTicket: number;
    reservationsToday: number;
  };
  topProducts: TopProduct[];
  topDrinks: TopProduct[];
  topFoods: TopProduct[];
  versusStats: {
    radarData: { subject: string; classic: number; author: number; fullMark: number }[];
    headToHead: { rank: number; name: string; category: string; sold: number; profit: string; perf: number }[];
    classicVelocity: number;
    authorVelocity: number;
    classicRevShare: number;
    authorRevShare: number;
  };
  salesData: SalesData[];
  hourlyData: HourlyData[];
  discountsGiven: number;
  rouletteSpins: {
    total: number;
    accepted: number;
    rejected: number;
  };
  inventory: {
    lowStock: number;
    outOfStock: number;
  };
  tables: TableStats[];
}

/* =========================================================
   FETCH DASHBOARD
   - robusto
   - abortable
   - logging útil para debug
========================================================= */
export async function fetchDashboard(
  signal?: AbortSignal
): Promise<DashboardStats> {
  try {
    const response: any = await api.get("/dashboard", {
      signal,
    });

    return response.data; // El interceptor devuelve { success, data, message }, y aquí sacamos 'data'
  } catch (error: any) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Error al obtener dashboard";

    console.error("📊 Dashboard error:", {
      status,
      message,
      data: error?.response?.data,
    });

    throw new Error(message);
  }
}
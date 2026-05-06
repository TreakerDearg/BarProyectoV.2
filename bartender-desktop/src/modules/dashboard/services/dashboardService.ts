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
  // Common KPIs
  totalSales: number;
  totalOrders: number;
  todayOrders: number;
  avgTicket: number;
  reservationsToday: number;
  
  // Specific views might flatten these or group them
  topProducts: TopProduct[];
  topDrinks: TopProduct[];
  topFoods: TopProduct[];
  versusStats: {
    radarData: { subject: string; A: number; B: number; fullMark: number }[];
    headToHead: { rank: number; name: string; category: string; sold: number; profit: string; perf: number }[];
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
    stockValue?: number;
    criticalItems?: any[];
  };
  tables: TableStats[];
  activeOrdersCount?: number;
  kitchenLoad?: number;
  barLoad?: number;
}

/* =========================================================
   FETCH DASHBOARD
========================================================= */
export async function fetchDashboard(
  signal?: AbortSignal,
  view: string = "all",
  range: string = "7"
): Promise<DashboardStats> {
  try {
    const response: any = await api.get("/dashboard", {
      signal,
      params: { view, range }
    });

    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Error al obtener dashboard";
    throw new Error(message);
  }
}
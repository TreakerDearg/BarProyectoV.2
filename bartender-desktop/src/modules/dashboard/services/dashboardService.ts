import api from "../../../services/api";

/* =========================================================
   TYPES
========================================================= */
export interface TopProduct {
  name: string;
  value: number;
  type: "drink" | "food";
}

export interface SalesData {
  date: string;
  total: number;
}

export interface TableStats {
  _id: string;
  count: number;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  todayOrders: number;

  topProduct: string;
  topProducts: TopProduct[];
  topDrinks: TopProduct[];
  topFoods: TopProduct[];

  salesData: SalesData[];

  lowStock: number;
  outOfStock: number;

  tablesStats: TableStats[];

  reservationsToday: number;
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
    const { data } = await api.get<DashboardStats>("/dashboard", {
      signal,
    });

    return data;
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
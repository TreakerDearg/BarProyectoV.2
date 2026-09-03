import api from "../../../services/api";

/* =========================================================
   TYPES
========================================================= */

// Cache configuration
const CACHE_TTL = 30_000; // 30 seconds cache
const cache = new Map<string, { data: DashboardStats; timestamp: number }>();

/* =========================================================
   CACHE HELPERS
========================================================= */

function getCacheKey(view: string, range: string): string {
  return `dashboard_${view}_${range}`;
}

function getCachedData(view: string, range: string): DashboardStats | null {
  const key = getCacheKey(view, range);
  const cached = cache.get(key);
  
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCachedData(view: string, range: string, data: DashboardStats): void {
  const key = getCacheKey(view, range);
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache(): void {
  cache.clear();
}

// Export cache functions for manual cache management
export { clearCache as clearDashboardCache };

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

export interface DashboardTrends {
  salesPct: number;
  ordersPct: number;
  ticketPct: number;
}

export interface DashboardStats {
  /* KPIs */
  totalSales: number;
  totalOrders: number;
  todayOrders: number;
  avgTicket: number;
  reservationsToday: number;
  avgOrderTimeMin?: number | null;
  trends?: DashboardTrends;
  timestamp?: string;

  /* Products */
  topProducts: TopProduct[];
  topDrinks: TopProduct[];
  topFoods: TopProduct[];

  /* Compare */
  versusStats: {
    radarData: {
      subject: string;
      A: number;
      B: number;
      fullMark: number;
    }[];

    headToHead: {
      rank: number;
      name: string;
      type: string;
      category: string;
      sold: number;
      profit: string;
      perf: number;
    }[];
  };

  /* Charts */
  salesData: SalesData[];
  hourlyData: HourlyData[];

  /* Discounts */
  discountsGiven: number;

  /* Roulette */
  rouletteSpins: {
    total: number;
    accepted: number;
    rejected: number;
  };

  /* Inventory */
  inventory: {
    lowStock: number;
    outOfStock: number;
    stockValue?: number;
    criticalItems?: any[];
  };

  /* Tables */
  tables: TableStats[];

  /* Optional */
  activeOrdersCount?: number;
  kitchenLoad?: number;
  barLoad?: number;
  recentReservations?: any[];
  revenueByCategory?: {
    name: string;
    value: number;
  }[];
}

/* =========================================================
   DEFAULT FALLBACK
========================================================= */

export const EMPTY_DASHBOARD: DashboardStats = {
  totalSales: 0,
  totalOrders: 0,
  todayOrders: 0,
  avgTicket: 0,
  reservationsToday: 0,
  avgOrderTimeMin: null,
  trends: { salesPct: 0, ordersPct: 0, ticketPct: 0 },
  timestamp: undefined,

  topProducts: [],
  topDrinks: [],
  topFoods: [],

  versusStats: {
    radarData: [],
    headToHead: [],
  },

  salesData: [],
  hourlyData: [],

  discountsGiven: 0,

  rouletteSpins: {
    total: 0,
    accepted: 0,
    rejected: 0,
  },

  inventory: {
    lowStock: 0,
    outOfStock: 0,
    stockValue: 0,
    criticalItems: [],
  },

  tables: [],

  activeOrdersCount: 0,
  kitchenLoad: 0,
  barLoad: 0,

  recentReservations: [],
  revenueByCategory: [],
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeDashboard(data: any): DashboardStats {
  return {
    ...EMPTY_DASHBOARD,

    ...data,

    topProducts: Array.isArray(data?.topProducts)
      ? data.topProducts
      : [],

    topDrinks: Array.isArray(data?.topDrinks)
      ? data.topDrinks
      : [],

    topFoods: Array.isArray(data?.topFoods)
      ? data.topFoods
      : [],

    salesData: Array.isArray(data?.salesData)
      ? data.salesData
      : [],

    hourlyData: Array.isArray(data?.hourlyData)
      ? data.hourlyData
      : [],

    tables: Array.isArray(data?.tables)
      ? data.tables
      : [],

    recentReservations: Array.isArray(data?.recentReservations)
      ? data.recentReservations
      : [],

    revenueByCategory: Array.isArray(data?.revenueByCategory)
      ? data.revenueByCategory
      : [],

    inventory: {
      ...EMPTY_DASHBOARD.inventory,
      ...(data?.inventory || {}),
    },

    rouletteSpins: {
      ...EMPTY_DASHBOARD.rouletteSpins,
      ...(data?.rouletteSpins || {}),
    },

    versusStats: {
      radarData: Array.isArray(data?.versusStats?.radarData)
        ? data.versusStats.radarData
        : [],

      headToHead: Array.isArray(data?.versusStats?.headToHead)
        ? data.versusStats.headToHead
        : [],
    },

    avgOrderTimeMin:
      data?.avgOrderTimeMin ?? data?.kpis?.avgOrderTimeMin ?? null,

    trends: {
      ...EMPTY_DASHBOARD.trends,
      ...(data?.trends || data?.kpis?.trends || {}),
    },

    timestamp: data?.timestamp,
  };
}

function parseAxiosError(error: any): Error {
  const status = error?.response?.status;
  const statusText = error?.response?.statusText;
  const data = error?.response?.data;

  console.error("━━━━━━━━ DASHBOARD ERROR ━━━━━━━━");
  console.error("STATUS:", status);
  console.error("STATUS TEXT:", statusText);
  console.error("DATA:", data);
  console.error("FULL ERROR:", error);
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  /* Network */
  if (!error?.response) {
    return new Error(
      "No se pudo conectar con el servidor dashboard"
    );
  }

  /* Auth */
  if (status === 401) {
    return new Error("Sesión expirada");
  }

  if (status === 403) {
    return new Error("No autorizado");
  }

  /* Not found */
  if (status === 404) {
    return new Error(
      "Endpoint dashboard no encontrado"
    );
  }

  /* Backend */
  if (status >= 500) {
    return new Error(
      data?.message ||
        "Error interno del servidor"
    );
  }

  /* Backend custom */
  if (typeof data === "string") {
    return new Error(data);
  }

  if (data?.message) {
    return new Error(data.message);
  }

  return new Error(
    error?.message ||
      "Ocurrió un error inesperado"
  );
}

/* =========================================================
   FETCH DASHBOARD
========================================================= */

export async function fetchDashboard(
  signal?: AbortSignal,
  view: string = "all",
  range: string = "7",
  forceRefresh: boolean = false
): Promise<DashboardStats> {
  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCachedData(view, range);
      if (cached) {
        console.log("Dashboard: Using cached data", { view, range });
        return cached;
      }
    }

    console.log("Fetching dashboard...", {
      view,
      range,
      forceRefresh,
    });

    const response = await api.get("/dashboard", {
      signal,
      params: {
        view,
        range,
      },
    });

    console.log(
      "Dashboard response:",
      response
    );

    if (!response?.data) {
      console.warn(
        "Dashboard returned empty data"
      );

      return EMPTY_DASHBOARD;
    }

    const normalizedData = normalizeDashboard(response.data);
    
    // Cache the response
    setCachedData(view, range, normalizedData);
    
    return normalizedData;
  } catch (error: any) {
    // If request fails, try to return cached data as fallback
    if (!forceRefresh) {
      const cached = getCachedData(view, range);
      if (cached) {
        console.warn("Dashboard: Using stale cached data due to error");
        return cached;
      }
    }
    
    throw parseAxiosError(error);
  }
}

/* =========================================================
   LEGACY FUNCTIONS (For compatibility with old code)
========================================================= */

export async function getTodayStats(): Promise<DashboardStats> {
  try {
    return await fetchDashboard(undefined, "all", "1");
  } catch (error: any) {
    console.error("[getTodayStats] Error:", error);
    throw new Error("Ocurrió un error inesperado");
  }
}

export async function getDailyLimitRemaining(): Promise<{ limit: number; remaining: number }> {
  try {
    // This function appears to be obsolete - returning default values
    // In the future, this could be connected to actual daily limits
    return {
      limit: 100000, // Default daily limit
      remaining: 100000, // Full remaining
    };
  } catch (error: any) {
    console.error("[getDailyLimitRemaining] Error:", error);
    throw new Error("Ocurrió un error inesperado");
  }
}
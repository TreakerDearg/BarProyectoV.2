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
  range: string = "7"
): Promise<DashboardStats> {
  try {
    console.log("Fetching dashboard...", {
      view,
      range,
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

    return normalizeDashboard(response.data);
  } catch (error: any) {
    throw parseAxiosError(error);
  }
}
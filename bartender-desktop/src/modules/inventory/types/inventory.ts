export interface InventoryItem {
  _id?: string;

  /* =========================
     BASIC INFO
  ========================= */
  name: string;
  description?: string;

  /* =========================
     STOCK
  ========================= */
  stock: number;
  minStock: number;
  maxStock: number;

  /* =========================
     UNIT SYSTEM
  ========================= */
  unit: "ml" | "l" | "g" | "kg" | "unit" | "oz" | "portion";

  /* =========================
     CLASSIFICATION
  ========================= */
  sector: "bar" | "kitchen" | "general";
  category: string;

  /* =========================
     COST
  ========================= */
  cost: number;

  /* =========================
     SUPPLIER
  ========================= */
  supplier: string;

  /* =========================
     LOCATION
  ========================= */
  location: "bar" | "kitchen" | "storage";

  /* =========================
     STATUS
  ========================= */
  isActive: boolean;

  /* =========================
     TIMESTAMPS
  ========================= */
  createdAt?: string;
  updatedAt?: string;

  /* =========================
     VIRTUALS (backend computed)
  ========================= */
  stockStatus?: "critical" | "low" | "optimal";
  isLowStock?: boolean;
  usagePercent?: number;

  /* =========================
     FORECASTING (prediction data)
  ========================= */
  predictedStockDate?: string;
  daysUntilEmpty?: number;
  suggestedRestockQuantity?: number;
  consumptionRate?: number;
  forecastConfidence?: number;

  /* =========================
     PRODUCT REFERENCES
  ========================= */
  usedInProducts?: string[];
  usedInRecipes?: Array<{
    recipeId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    unit: string;
  }>;
}

/* =========================
   FORECAST TYPES
========================= */
export interface StockForecast {
  itemId: string;
  itemName: string;
  currentStock: number;
  predictedEmptyDate: string;
  daysUntilEmpty: number;
  consumptionRate: number;
  suggestedRestock: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ConsumptionPattern {
  itemId: string;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  peakDays: number[];
  seasonality: 'high' | 'low' | 'none';
}

/* =========================
   LOT MANAGEMENT TYPES
========================= */
export interface InventoryLot {
  _id?: string;
  itemId: string;
  lotNumber: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  manufacturingDate?: string;
  supplier: string;
  cost: number;
  receivedDate: string;
  location: string;
  status: 'active' | 'expiring' | 'expired' | 'depleted';
  remainingQuantity: number;
}

export interface LotMovement {
  _id?: string;
  lotId: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  timestamp: string;
  userId?: string;
}

/* =========================
   MOVEMENT AUDIT TYPES
========================= */
export interface InventoryMovement {
  _id?: string;
  itemId: string;
  itemName: string;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'transfer' | 'sale' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  location?: string;
  targetLocation?: string; // For transfers
}

export interface MovementFilter {
  type?: InventoryMovement['type'];
  startDate?: string;
  endDate?: string;
  userId?: string;
  itemId?: string;
}

/* =========================
   SUPPLIER MANAGEMENT TYPES
========================= */
export interface Supplier {
  _id?: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  paymentTerms?: string;
  leadTime?: number; // Days
  rating?: number; // 1-5
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrder {
  _id?: string;
  supplierId: string;
  supplierName: string;
  orderNumber: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unit: string;
    cost: number;
  }>;
  totalCost: number;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* =========================
   TRANSFER MANAGEMENT TYPES
========================= */
export interface StockTransfer {
  _id?: string;
  transferNumber: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unit: string;
  }>;
  fromLocation: string;
  toLocation: string;
  status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
  requestedBy?: string;
  approvedBy?: string;
  requestedDate: string;
  approvedDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
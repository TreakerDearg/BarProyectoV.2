export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
}

export interface ProductPublicDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  dynamicPrice: number;
  image: string;
  type: "drink" | "food";
  drinkStyle?: "author" | "classic";
  available: boolean;
  featured: boolean;
  category: string;
  tags: string[];
  dietaryRestrictions: string[];
}

export interface MenuCategoryPublicDTO {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
  products: {
    product: ProductPublicDTO;
    price?: number;
    available: boolean;
    featured: boolean;
    order: number;
  }[];
}

export interface MenuPublicDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  type: "drink" | "food" | "mixed";
  featured: boolean;
  minPrice: number;
  maxPrice: number;
  categories: MenuCategoryPublicDTO[];
}

export interface PromotionPublicDTO {
  id: string;
  name: string;
  description: string;
  audience: "web" | "app" | "both";
  type: "PERCENT" | "FLAT" | "2X1" | "CUSTOM";
  value: number;
  applicableProducts: {
    id: string;
    name: string;
    price: number;
    image: string;
    available: boolean;
  }[];
  applicableCategories: string[];
  schedule?: {
    daysOfWeek: string[];
    startTime?: string;
    endTime?: string;
    startDate?: string;
    endDate?: string;
  } | null;
  active: boolean;
}

export interface TablePublicDTO {
  id: string;
  number: number;
  capacity: number;
  location: "indoor" | "outdoor" | "bar";
  status: "available" | "reserved" | "occupied" | "maintenance";
  currentSessionId?: string | null;
  tableCode?: string | null;
  totalAmount?: number;
  balanceDue?: number;
}

export interface OrderItemDTO {
  id?: string;
  product?: string | ProductPublicDTO;
  name: string;
  quantity: number;
  price: number;
  type?: "drink" | "food" | "menu";
  status?: "pending" | "preparing" | "ready" | "served" | "cancelled";
  notes?: string;
}

export interface OrderPublicDTO {
  id: string;
  table: string;
  sessionId: string;
  userId?: string | null;
  items: OrderItemDTO[];
  subtotal?: number;
  discountTotal?: number;
  total: number;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  sessionStatus?: "open" | "closed";
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RouletteDrinkDTO {
  _id: string;
  name: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  color?: string;
  probability?: number;
  recipe?: {
    _id: string;
    method?: string;
    drinkStyle?: string;
    ingredients?: { name: string; quantity: number; unit: string }[];
    steps?: string[];
  };
}

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  notes: string;
}

// ── Reservations ──────────────────────────────────────────────────────────────

export interface TimeSlotDTO {
  startTime: string;   // ISO string
  endTime:   string;   // ISO string
  available: boolean;
  tableCount?: number; // número de mesas disponibles
}

export interface CreateReservationPayload {
  date:          string;   // "YYYY-MM-DD"
  startTime:     string;   // ISO string del slot seleccionado
  endTime:       string;
  guests:        number;
  customerName:  string;
  customerPhone: string;
  customerEmail?: string;
  notes?:        string;
  dietaryRestrictions?: string[];
}

export interface ReservationDTO {
  _id:          string;
  status:       'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  startTime:    string;
  endTime?:     string;
  guests:       number;
  customerName: string;
  customerPhone?: string;
  tableNumber?: number;
  notes?:       string;
  createdAt:    string;
}

export interface AvailabilityCheckResponse {
  available:  boolean;
  slots:      TimeSlotDTO[];
  date:       string;
  guests:     number;
}

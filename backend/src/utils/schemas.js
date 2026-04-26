import { z } from "zod";

/* =========================================================
   SCHEMAS ZOD — Bartender System
   Fuente única de validación para todos los endpoints
========================================================= */

/* ─────────────────── AUTH ─────────────────── */
export const loginSchema = z.object({
  email:    z.string().email("Email inválido").toLowerCase(),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  name:     z.string().min(2).max(50).trim(),
  email:    z.string().email().toLowerCase(),
  password: z.string().min(6),
});

/* ─────────────────── USERS ─────────────────── */
const ROLES   = ["admin", "bartender", "waiter", "cashier", "kitchen", "client"];
const SHIFTS  = ["morning", "afternoon", "night", "event"];

export const createEmployeeSchema = z.object({
  name:        z.string().min(2).max(50).trim(),
  email:       z.string().email().toLowerCase(),
  password:    z.string().min(6),
  role:        z.enum(ROLES),
  shift:       z.enum(SHIFTS).nullable().optional(),
  permissions: z.record(z.boolean()).optional().default({}),
});

export const assignShiftSchema  = z.object({ shift: z.enum(SHIFTS) });
export const changePasswordSchema = z.object({ password: z.string().min(6) });
export const updateUserSchema = z.object({
  name:        z.string().min(2).max(50).trim().optional(),
  role:        z.enum(ROLES).optional(),
  shift:       z.enum(SHIFTS).nullable().optional(),
  permissions: z.record(z.boolean()).optional(),
  isActive:    z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Debes enviar al menos un campo para actualizar" }
);

export const updatePermissionsSchema = z.object({
  permissions: z.record(z.boolean()),
});

/* ─────────────────── PRODUCTS ─────────────────── */
export const createProductSchema = z.object({
  name:            z.string().min(2).max(100).trim(),
  description:     z.string().max(300).optional().default(""),
  price:           z.number().min(0),
  cost:            z.number().min(0).optional().default(0),
  category:        z.string().min(1).trim(),
  subcategory:     z.string().optional().default(""),
  type:            z.enum(["drink", "food"]),
  available:       z.boolean().optional().default(true),
  isActiveForPOS:  z.boolean().optional().default(true),
  image:           z.string().url().optional().or(z.literal("")).default(""),
  featured:        z.boolean().optional().default(false),
  tags:            z.array(z.string()).optional().default([]),
  preparationTime: z.number().min(0).optional().default(0),
  isAlcohol:       z.boolean().optional().default(false),
  stockImpact:     z.boolean().optional().default(true),
  hasRecipe:       z.boolean().optional().default(false),
});

export const updateProductSchema = createProductSchema.partial();

/* ─────────────────── INVENTORY ─────────────────── */
const UNITS    = ["ml", "l", "g", "kg", "unit", "oz", "portion"];
const SECTORS  = ["bar", "kitchen", "general"];
const LOCATIONS = ["bar", "kitchen", "storage"];

export const createInventorySchema = z.object({
  name:     z.string().min(2).max(80).trim(),
  category: z.string().min(1).trim(),
  unit:     z.enum(UNITS).optional().default("unit"),
  stock:    z.number().min(0).optional().default(0),
  minStock: z.number().min(0).optional().default(5),
  maxStock: z.number().min(0).optional().default(100),
  cost:     z.number().min(0).optional().default(0),
  supplier: z.string().optional().default(""),
  sector:   z.enum(SECTORS).optional().default("general"),
  location: z.enum(LOCATIONS).optional().default("storage"),
  description: z.string().max(200).optional().default(""),
});

export const adjustStockSchema = z.object({
  amount: z.number().positive("amount debe ser positivo"),
  type:   z.enum(["add", "subtract"]),
  reason: z.string().optional().default(""),
});

/* ─────────────────── TABLES ─────────────────── */
export const createTableSchema = z.object({
  number:   z.number().int().positive(),
  capacity: z.number().int().min(1),
  location: z.enum(["indoor", "outdoor", "bar"]).optional().default("indoor"),
  notes:    z.string().optional().default(""),
});

/* ─────────────────── ORDERS ─────────────────── */
export const createOrderSchema = z.object({
  table:     z.string().min(1, "table es obligatorio"),
  sessionId: z.string().min(1, "sessionId es obligatorio"),
  items:     z.array(z.object({
    product:  z.string().min(1),
    quantity: z.number().int().positive().optional().default(1),
    notes:    z.string().optional().default(""),
  })).min(1, "Debes agregar al menos un producto"),
  notes:    z.string().optional().default(""),
  priority: z.enum(["low", "normal", "high"]).optional().default("normal"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "in-progress", "completed", "cancelled"]),
});

export const updateItemStatusSchema = z.object({
  status: z.enum(["pending", "preparing", "ready", "served", "cancelled"]),
});

/* ─────────────────── RESERVATIONS ─────────────────── */
export const createReservationSchema = z.object({
  customerName:  z.string().min(2).trim(),
  customerPhone: z.string().min(6).trim(),
  customerEmail: z.string().email().optional().or(z.literal("")).default(""),
  startTime:     z.string().datetime({ offset: true }).or(z.string().min(1)),
  endTime:       z.string().datetime({ offset: true }).or(z.string().min(1)),
  guests:        z.number().int().min(1),
  tableId:       z.string().optional(),
  notes:         z.string().optional().default(""),
  source:        z.enum(["web", "app", "admin"]).optional().default("admin"),
});

/* ─────────────────── MENUS ─────────────────── */
export const createMenuSchema = z.object({
  name:        z.string().min(2).trim(),
  description: z.string().optional().default(""),
  type:        z.string().optional().default("general"),
  active:      z.boolean().optional().default(true),
  isPublic:    z.boolean().optional().default(false),
  categories:  z.array(z.any()).optional().default([]),
});

/* ─────────────────── DISCOUNTS ─────────────────── */
export const applyDiscountSchema = z.object({
  orderId: z.string().min(1).optional(),
  items:   z.array(z.string().min(1)).optional().default([]),
  type:   z.enum(["PERCENT", "FLAT"]),
  value:  z.number().positive(),
  reason: z.enum(["WAIT_TIME", "QUALITY_ISSUE", "COMP", "EMPLOYEE", "OTHER"]),
  note:   z.string().max(500).optional().default(""),
});

export const applyManualDiscountSchema = z.object({
  orderId: z.string().min(1),
  items: z.array(z.object({
    product: z.string().min(1),
    quantity: z.number().int().positive().optional(),
  })).min(1, "Debes indicar al menos un item"),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.number().positive(),
  reason: z.enum(["WAIT_TIME", "QUALITY_ISSUE", "COMP", "EMPLOYEE", "OTHER"]),
  note: z.string().max(500).optional().default(""),
});

/* ─────────────────── ROULETTE ─────────────────── */
export const createRouletteDrinkSchema = z.object({
  product:  z.string().optional().nullable(),
  name:     z.string().min(2).trim(),
  weight:   z.number().positive(),
  color:    z.string().optional().default("#D4A340"),
  category: z.string().optional().default("general"),
  price:    z.number().min(0).optional().default(0),
});

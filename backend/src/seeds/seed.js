/**
 * SEED — Bartender System (v2)
 * Ejecutar: npm run seed
 *
 * Pobla la base de datos con:
 *  - Usuarios con schedules y horarios reales
 *  - Productos con imágenes y precios
 *  - Inventario de ingredientes
 *  - Menú principal
 *  - Órdenes históricas (30 días) para el dashboard
 *  - Reservas históricas
 *  - Promociones activas
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User          from "../models/User.js";
import Product       from "../models/Product.js";
import InventoryItem from "../models/InventoryItem.js";
import Menu          from "../models/Menu.js";
import Order         from "../models/Order.js";
import Table         from "../models/Table.js";
import Reservation   from "../models/Reservation.js";
import Promotion     from "../models/Promotion.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("✓ MongoDB conectado");

const hash = (pwd) => bcrypt.hashSync(pwd, 10);

/* ── helpers de tiempo ─────────────────────────────────────── */
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const hoursAgo = (h) => { const d = new Date(); d.setHours(d.getHours() - h); return d; };
const setHour = (date, h, m = 0) => { const d = new Date(date); d.setHours(h, m, 0, 0); return d; };
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

/* ================================================================
   USUARIOS CON SCHEDULES Y TURNOS REALES
================================================================ */
const daySchedule = (start, end, available = true) => ({
  isAvailable: available,
  startTime:   start,
  endTime:     end,
});

const users = [
  {
    name: "Admin Principal",
    email: "admin@nebula.bar",
    password: hash("Admin123!"),
    role: "admin",
    shift: "night",
    isEmployee: true,
    isActive: true,
    provider: "local",
    providerVerified: true,
    schedule: {
      monday:    daySchedule("18:00", "02:00"),
      tuesday:   daySchedule("18:00", "02:00"),
      wednesday: daySchedule("18:00", "02:00"),
      thursday:  daySchedule("18:00", "02:00"),
      friday:    daySchedule("18:00", "03:00"),
      saturday:  daySchedule("18:00", "03:00"),
      sunday:    daySchedule("00:00", "00:00", false),
    },
  },
  {
    name: "Carlos Bartender",
    email: "bartender@nebula.bar",
    password: hash("Bar123!"),
    role: "bartender",
    shift: "night",
    isEmployee: true,
    isActive: true,
    provider: "local",
    providerVerified: true,
    schedule: {
      monday:    daySchedule("20:00", "02:00"),
      tuesday:   daySchedule("20:00", "02:00"),
      wednesday: daySchedule("00:00", "00:00", false),
      thursday:  daySchedule("20:00", "02:00"),
      friday:    daySchedule("19:00", "03:00"),
      saturday:  daySchedule("19:00", "03:00"),
      sunday:    daySchedule("19:00", "01:00"),
    },
  },
  {
    name: "Sofía Bartender",
    email: "sofia@nebula.bar",
    password: hash("Bar123!"),
    role: "bartender",
    shift: "afternoon",
    isEmployee: true,
    isActive: true,
    provider: "local",
    providerVerified: true,
    schedule: {
      monday:    daySchedule("16:00", "00:00"),
      tuesday:   daySchedule("16:00", "00:00"),
      wednesday: daySchedule("16:00", "00:00"),
      thursday:  daySchedule("00:00", "00:00", false),
      friday:    daySchedule("16:00", "01:00"),
      saturday:  daySchedule("16:00", "01:00"),
      sunday:    daySchedule("00:00", "00:00", false),
    },
  },
  {
    name: "Ana Mesera",
    email: "waiter@nebula.bar",
    password: hash("Waiter123!"),
    role: "waiter",
    shift: "night",
    isEmployee: true,
    isActive: true,
    provider: "local",
    providerVerified: true,
    schedule: {
      monday:    daySchedule("19:00", "02:00"),
      tuesday:   daySchedule("19:00", "02:00"),
      wednesday: daySchedule("19:00", "02:00"),
      thursday:  daySchedule("19:00", "02:00"),
      friday:    daySchedule("18:00", "03:00"),
      saturday:  daySchedule("18:00", "03:00"),
      sunday:    daySchedule("00:00", "00:00", false),
    },
  },
  {
    name: "Pedro Cocina",
    email: "kitchen@nebula.bar",
    password: hash("Kitchen123!"),
    role: "kitchen",
    shift: "afternoon",
    isEmployee: true,
    isActive: true,
    provider: "local",
    providerVerified: true,
    schedule: {
      monday:    daySchedule("17:00", "01:00"),
      tuesday:   daySchedule("17:00", "01:00"),
      wednesday: daySchedule("17:00", "01:00"),
      thursday:  daySchedule("17:00", "01:00"),
      friday:    daySchedule("16:00", "02:00"),
      saturday:  daySchedule("16:00", "02:00"),
      sunday:    daySchedule("00:00", "00:00", false),
    },
  },
  {
    name: "Laura Cajera",
    email: "cashier@nebula.bar",
    password: hash("Cash123!"),
    role: "cashier",
    shift: "night",
    isEmployee: true,
    isActive: true,
    provider: "local",
    providerVerified: true,
    schedule: {
      monday:    daySchedule("20:00", "02:00"),
      tuesday:   daySchedule("20:00", "02:00"),
      wednesday: daySchedule("00:00", "00:00", false),
      thursday:  daySchedule("20:00", "02:00"),
      friday:    daySchedule("20:00", "03:00"),
      saturday:  daySchedule("20:00", "03:00"),
      sunday:    daySchedule("20:00", "01:00"),
    },
  },
  {
    name: "Juan Cliente",
    email: "cliente@nebula.bar",
    password: hash("Cliente123!"),
    role: "client",
    shift: null,
    isEmployee: false,
    isActive: true,
    provider: "local",
    providerVerified: true,
  },
];

/* ================================================================
   PRODUCTOS
================================================================ */
const products = [
  // ── CÓCTELES CLÁSICOS ────────────────────────────────────────
  { name: "Old Fashioned",          description: "Whisky bourbon, azúcar, bitter y twist de naranja.",           price: 1800, cost: 600, category: "Cócteles Clásicos", type: "drink", drinkStyle: "classic", available: true, featured: true,  isActiveForPOS: true, preparationTime: 5,  image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80",   tags: ["whisky","clásico"],       dietaryRestrictions: [] },
  { name: "Mojito Premium",         description: "Ron blanco, hierbabuena fresca, lima y soda artesanal.",       price: 1600, cost: 500, category: "Cócteles Clásicos", type: "drink", drinkStyle: "classic", available: true, featured: false, isActiveForPOS: true, preparationTime: 6,  image: "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=600&q=80", tags: ["ron","fresco"],           dietaryRestrictions: ["vegan"] },
  { name: "Negroni",                description: "Gin, Campari y vermut rojo. Sofisticado y amargo.",            price: 1900, cost: 650, category: "Cócteles Clásicos", type: "drink", drinkStyle: "classic", available: true, featured: true,  isActiveForPOS: true, preparationTime: 4,  image: "https://images.unsplash.com/photo-1574070617122-b9a86f86ee0e?w=600&q=80",  tags: ["gin","amargo"],           dietaryRestrictions: [] },
  { name: "Margarita Clásica",      description: "Tequila, triple sec y lima con sal en el borde.",              price: 1700, cost: 550, category: "Cócteles Clásicos", type: "drink", drinkStyle: "classic", available: true, featured: false, isActiveForPOS: true, preparationTime: 5,  image: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=600&q=80", tags: ["tequila","cítrico"],       dietaryRestrictions: ["vegan"] },
  { name: "Espresso Martini",       description: "Vodka, licor de café, espresso doble y almíbar de vainilla.",  price: 2000, cost: 700, category: "Cócteles Clásicos", type: "drink", drinkStyle: "classic", available: true, featured: true,  isActiveForPOS: true, preparationTime: 6,  image: "https://images.unsplash.com/photo-1622499455605-69e4d9af1432?w=600&q=80", tags: ["café","vodka"],            dietaryRestrictions: [] },
  // ── FIRMA DEL BAR ────────────────────────────────────────────
  { name: "Nebula Sour",            description: "Mezcal artesanal, maracuyá, albahaca y espuma de clara.",      price: 2200, cost: 750, category: "Firma del Bar",    type: "drink", drinkStyle: "author",  available: true, featured: true,  isActiveForPOS: true, preparationTime: 8,  image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&q=80", tags: ["mezcal","autor"],          dietaryRestrictions: [] },
  { name: "Gold Rush",              description: "Bourbon artesanal, miel de abejas, jengibre y limón.",         price: 2100, cost: 700, category: "Firma del Bar",    type: "drink", drinkStyle: "author",  available: true, featured: true,  isActiveForPOS: true, preparationTime: 7,  image: "https://images.unsplash.com/photo-1595565670901-4e72a5b4c0b1?w=600&q=80", tags: ["bourbon","miel"],          dietaryRestrictions: ["dairy-free"] },
  // ── GIN ─────────────────────────────────────────────────────
  { name: "Gin Mare en las Rocas",  description: "Gin Mediterráneo sobre hielo gigante con twist de pomelo.",    price: 2400, cost: 900, category: "Gin",              type: "drink", drinkStyle: "classic", available: true, featured: false, isActiveForPOS: true, preparationTime: 3,  image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80", tags: ["gin","premium"],           dietaryRestrictions: ["vegan","gluten-free"] },
  // ── WHISKY ──────────────────────────────────────────────────
  { name: "Johnnie Walker Black",   description: "Whisky blended escocés 12 años. Solo, agua o hielo.",          price: 2600, cost: 950, category: "Whisky",           type: "drink", drinkStyle: "classic", available: true, featured: false, isActiveForPOS: true, preparationTime: 2,  image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", tags: ["whisky","escocés"],        dietaryRestrictions: ["gluten-free"] },
  // ── SIN ALCOHOL ─────────────────────────────────────────────
  { name: "Virgin Mojito",          description: "Agua mineral, hierbabuena, lima, azúcar y hielo granizado.",   price: 1100, cost: 280, category: "Sin Alcohol",      type: "drink", drinkStyle: "classic", available: true, featured: false, isActiveForPOS: true, preparationTime: 5,  image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",    tags: ["sin alcohol"],             dietaryRestrictions: ["vegan","gluten-free","dairy-free"] },
  { name: "Limonada de Jengibre",   description: "Limón exprimido, jengibre, menta, azúcar integral y soda.",    price:  950, cost: 200, category: "Sin Alcohol",      type: "drink", drinkStyle: "classic", available: true, featured: false, isActiveForPOS: true, preparationTime: 4,  image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&q=80", tags: ["sin alcohol","saludable"], dietaryRestrictions: ["vegan","gluten-free","dairy-free","sugar-free"] },
  // ── PARA PICAR ───────────────────────────────────────────────
  { name: "Tabla de Quesos",        description: "Quesos artesanales, jamón serrano, chorizo y picos.",           price: 3200, cost: 1200, category: "Para Picar",      type: "food",  drinkStyle: "classic", available: true, featured: true,  isActiveForPOS: true, preparationTime: 8,  image: "https://images.unsplash.com/photo-1505575967455-40e256f73376?w=600&q=80", tags: ["queso","compartir"],       dietaryRestrictions: ["gluten-free"] },
  { name: "Bruschetta de Tomate",   description: "Pan rústico tostado con tomates, albahaca y aceite oliva.",     price: 1400, cost: 450, category: "Para Picar",       type: "food",  drinkStyle: "classic", available: true, featured: false, isActiveForPOS: true, preparationTime: 6,  image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80", tags: ["vegetariano"],             dietaryRestrictions: ["vegetarian","dairy-free"] },
  { name: "Nachos con Guacamole",   description: "Chips de maíz, guacamole casero, jalapeños y crema agria.",    price: 1900, cost: 600, category: "Para Picar",       type: "food",  drinkStyle: "classic", available: true, featured: false, isActiveForPOS: true, preparationTime: 10, image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&q=80", tags: ["mexicano"],                dietaryRestrictions: ["vegetarian","gluten-free"] },
  // ── PLATOS ──────────────────────────────────────────────────
  { name: "Mini Hamburguesa",       description: "Carne 200g, cheddar curado, cebolla caramelizada y brioche.",  price: 2800, cost: 1000, category: "Platos",           type: "food",  drinkStyle: "classic", available: true, featured: true,  isActiveForPOS: true, preparationTime: 15, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",  tags: ["hamburguesa"],             dietaryRestrictions: [] },
  { name: "Pizza Margherita",       description: "Masa madre 24h, san marzano, mozzarella y albahaca.",          price: 2600, cost: 900, category: "Platos",            type: "food",  drinkStyle: "classic", available: true, featured: false, isActiveForPOS: true, preparationTime: 20, image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80",  tags: ["pizza","vegetariano"],     dietaryRestrictions: ["vegetarian"] },
  // ── POSTRES ──────────────────────────────────────────────────
  { name: "Brownie con Helado",     description: "Brownie 70% cacao, helado artesanal y salsa caramelo.",        price: 1600, cost: 500, category: "Postres",           type: "food",  drinkStyle: "classic", available: true, featured: false, isActiveForPOS: true, preparationTime: 5,  image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80",  tags: ["postre","chocolate"],      dietaryRestrictions: ["vegetarian"] },
];

/* ================================================================
   INVENTARIO
================================================================ */
const inventory = [
  { name: "Bourbon Artesanal",    category: "Destilados",   stock: 12,  minStock: 3,  maxStock: 24,  unit: "unit", cost: 4500, sector: "bar",     location: "storage" },
  { name: "Gin Mare",             category: "Gin",          stock: 8,   minStock: 2,  maxStock: 16,  unit: "unit", cost: 5800, sector: "bar",     location: "storage" },
  { name: "Ron Blanco Superior",  category: "Destilados",   stock: 15,  minStock: 4,  maxStock: 30,  unit: "unit", cost: 2800, sector: "bar",     location: "storage" },
  { name: "Tequila Silver",       category: "Destilados",   stock: 10,  minStock: 3,  maxStock: 20,  unit: "unit", cost: 3200, sector: "bar",     location: "storage" },
  { name: "Vodka Premium",        category: "Destilados",   stock: 14,  minStock: 4,  maxStock: 28,  unit: "unit", cost: 2600, sector: "bar",     location: "storage" },
  { name: "Mezcal Artesanal",     category: "Destilados",   stock: 6,   minStock: 2,  maxStock: 12,  unit: "unit", cost: 6200, sector: "bar",     location: "storage" },
  { name: "Campari",              category: "Licores",      stock: 5,   minStock: 2,  maxStock: 10,  unit: "unit", cost: 3400, sector: "bar",     location: "storage" },
  { name: "Vermut Rojo",          category: "Licores",      stock: 7,   minStock: 2,  maxStock: 14,  unit: "unit", cost: 2200, sector: "bar",     location: "storage" },
  { name: "Licor de Café",        category: "Licores",      stock: 8,   minStock: 2,  maxStock: 16,  unit: "unit", cost: 2800, sector: "bar",     location: "storage" },
  { name: "Triple Sec",           category: "Licores",      stock: 9,   minStock: 2,  maxStock: 18,  unit: "unit", cost: 1800, sector: "bar",     location: "storage" },
  { name: "Jugo de Lima",         category: "Jugos",        stock: 25,  minStock: 10, maxStock: 50,  unit: "l",    cost: 180,  sector: "bar",     location: "bar"     },
  { name: "Jugo de Limón",        category: "Jugos",        stock: 22,  minStock: 8,  maxStock: 40,  unit: "l",    cost: 160,  sector: "bar",     location: "bar"     },
  { name: "Jugo de Maracuyá",     category: "Jugos",        stock: 3,   minStock: 4,  maxStock: 24,  unit: "l",    cost: 220,  sector: "bar",     location: "bar"     },   // ← stock crítico
  { name: "Agua con Gas",         category: "Bebidas",      stock: 48,  minStock: 12, maxStock: 96,  unit: "unit", cost: 120,  sector: "bar",     location: "storage" },
  { name: "Hierbabuena",          category: "Garnish",      stock: 1,   minStock: 5,  maxStock: 30,  unit: "g",    cost: 15,   sector: "kitchen", location: "kitchen" },   // ← stock crítico
  { name: "Limones",              category: "Garnish",      stock: 5,   minStock: 5,  maxStock: 20,  unit: "kg",   cost: 280,  sector: "kitchen", location: "kitchen" },
  { name: "Azúcar de Caña",       category: "Ingredientes", stock: 10,  minStock: 3,  maxStock: 20,  unit: "kg",   cost: 180,  sector: "bar",     location: "bar"     },
  { name: "Miel Natural",         category: "Ingredientes", stock: 8,   minStock: 2,  maxStock: 16,  unit: "kg",   cost: 650,  sector: "bar",     location: "bar"     },
  { name: "Bitter Angostura",     category: "Ingredientes", stock: 0,   minStock: 1,  maxStock: 8,   unit: "unit", cost: 980,  sector: "bar",     location: "storage" },   // ← sin stock
  { name: "Hielo en Cubos",       category: "Hielo",        stock: 50,  minStock: 20, maxStock: 100, unit: "kg",   cost: 80,   sector: "bar",     location: "bar"     },
  { name: "Queso Mozzarella",     category: "Lácteos",      stock: 8,   minStock: 3,  maxStock: 15,  unit: "kg",   cost: 980,  sector: "kitchen", location: "kitchen" },
  { name: "Tomates Cherry",       category: "Vegetales",    stock: 6,   minStock: 2,  maxStock: 12,  unit: "kg",   cost: 380,  sector: "kitchen", location: "kitchen" },
  { name: "Chocolate 70%",        category: "Repostería",   stock: 5,   minStock: 2,  maxStock: 10,  unit: "kg",   cost: 1200, sector: "kitchen", location: "kitchen" },
];

/* ================================================================
   PROMOCIONES ACTIVAS
================================================================ */
const buildPromotions = (adminId) => [
  {
    name: "Happy Hour",
    description: "30% de descuento en cócteles clásicos de 18 a 20 hs",
    type: "PERCENT",
    value: 30,
    isActive: true,
    createdBy: adminId,
    schedule: {
      daysOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      startTime: "18:00",
      endTime:   "20:00",
    },
    applicableCategories: ["Cócteles Clásicos"],
  },
  {
    name: "Noche de Firma",
    description: "2×1 en toda la Firma del Bar los viernes y sábados",
    type: "2X1",
    value: 0,
    isActive: true,
    createdBy: adminId,
    schedule: {
      daysOfWeek: ["Friday","Saturday"],
      startTime: "21:00",
      endTime:   "23:00",
    },
    applicableCategories: ["Firma del Bar"],
  },
  {
    name: "Madrugada Gin",
    description: "$500 de descuento en cualquier Gin después de medianoche",
    type: "FLAT",
    value: 500,
    isActive: false, // programada pero inactiva
    createdBy: adminId,
    schedule: {
      daysOfWeek: ["Friday","Saturday","Sunday"],
      startTime: "00:00",
      endTime:   "02:00",
    },
    applicableCategories: ["Gin"],
  },
];

/* ================================================================
   TABLAS (3 para órdenes históricas)
================================================================ */
const tableData = [
  { number: 1,  capacity: 4,  status: "available", location: "indoor"  },
  { number: 2,  capacity: 6,  status: "available", location: "indoor"  },
  { number: 3,  capacity: 2,  status: "available", location: "bar"     },
  { number: 4,  capacity: 4,  status: "available", location: "outdoor" },
  { number: 5,  capacity: 8,  status: "available", location: "indoor"  },
  { number: 6,  capacity: 4,  status: "available", location: "indoor"  },
  { number: 7,  capacity: 2,  status: "available", location: "bar"     },
  { number: 8,  capacity: 6,  status: "available", location: "outdoor" },
];

/* ================================================================
   GENERADOR DE ÓRDENES HISTÓRICAS (30 días)
   Simula el patrón real de un bar:
   - Jueves-Sábado: pico alto (20-35 órdenes/noche)
   - Lun-Mié: bajo (5-12 órdenes/noche)
   - Horario: 19-02 hs con distribución realista
================================================================ */
function buildOrders(prodList, tableList, adminUser) {
  const orders = [];

  for (let day = 29; day >= 0; day--) {
    const date     = daysAgo(day);
    const dayOfWeek = date.getDay(); // 0=dom,1=lun,...,5=vie,6=sáb
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const isMidWeek = dayOfWeek === 3 || dayOfWeek === 4;

    const ordersCount = isWeekend  ? rand(20, 35) :
                        isMidWeek  ? rand(10, 18) :
                                     rand(4,  10);

    for (let i = 0; i < ordersCount; i++) {
      // Distribución horaria: más órdenes en el pico (21-23hs)
      const hourWeight = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,8,10,10,9,8,7,4,3,2,2,1];
      const hour = (() => {
        const max = hourWeight.reduce((s,x) => s + x, 0);
        let rnd = rand(0, max);
        for (let h = 0; h < hourWeight.length; h++) {
          rnd -= hourWeight[h];
          if (rnd <= 0) return (19 + h) % 24;
        }
        return 22;
      })();

      const createdAt  = setHour(date, hour, rand(0, 59));
      const itemCount  = rand(1, 4);
      const items      = [];

      // Elegir ítems con peso: bebidas más frecuentes que comidas
      for (let j = 0; j < itemCount; j++) {
        const pool  = Math.random() < 0.7
          ? prodList.filter((p) => p.type === "drink")
          : prodList.filter((p) => p.type === "food");
        const prod  = pick(pool.length ? pool : prodList);
        const qty   = rand(1, 3);
        const existing = items.find((x) => x.product?.toString() === prod._id.toString());
        if (existing) {
          existing.quantity += qty;
        } else {
          items.push({
            product:  prod._id,
            name:     prod.name,
            quantity: qty,
            price:    prod.price,
            type:     prod.type,
            status:   "served",
          });
        }
      }

      const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
      const table    = pick(tableList);
      const completedAt = new Date(createdAt.getTime() + rand(15, 45) * 60000);

      orders.push({
        table:        table._id,
        sessionId:    new mongoose.Types.ObjectId().toString(),
        items,
        subtotal,
        discountTotal: 0,
        total:        subtotal,
        status:       "completed",
        paymentStatus:"paid",
        sessionStatus:"closed",
        createdBy:    adminUser._id,
        notes:        "",
        priority:     "normal",
        createdAt,
        updatedAt:    completedAt,
        closedAt:     completedAt,
      });
    }
  }

  return orders;
}

/* ================================================================
   RESERVAS HISTÓRICAS (próximas 7 días + pasadas)
================================================================ */
function buildReservations(tableList) {
  const reservations = [];
  const names   = ["María García","Carlos López","Ana Martínez","Pedro Sánchez","Laura Torres","Miguel Rodríguez","Sofía Fernández","Javier González"];
  const statuses= ["confirmed","seated","completed"];

  // Pasadas (15 días)
  for (let d = 14; d >= 1; d--) {
    const date = daysAgo(d);
    const count = rand(2, 6);
    for (let i = 0; i < count; i++) {
      const hour     = rand(20, 22);
      const start    = setHour(date, hour);
      const end      = setHour(date, hour + 2);
      const table    = pick(tableList);
      const guests   = rand(2, table.capacity);
      reservations.push({
        customerName:  pick(names),
        customerPhone: `+54 9 11 ${rand(1000,9999)}-${rand(1000,9999)}`,
        guests,
        startTime:     start,
        endTime:       end,
        tableId:       table._id,
        status:        d < 3 ? pick(statuses) : "completed",
        source:        "web",
      });
    }
  }

  // Próximas (7 días)
  for (let d = 0; d <= 6; d++) {
    const date  = new Date(); date.setDate(date.getDate() + d);
    const count = d === 0 ? rand(2, 4) : rand(1, 5);
    for (let i = 0; i < count; i++) {
      const hour   = rand(19, 22);
      const start  = setHour(date, hour);
      const end    = setHour(date, hour + 2);
      const table  = pick(tableList);
      const guests = rand(2, table.capacity);
      reservations.push({
        customerName:  pick(names),
        customerPhone: `+54 9 11 ${rand(1000,9999)}-${rand(1000,9999)}`,
        guests,
        startTime:     start,
        endTime:       end,
        tableId:       table._id,
        status:        d === 0 ? pick(["confirmed","pending"]) : "pending",
        source:        pick(["web","admin"]),
      });
    }
  }

  return reservations;
}

/* ================================================================
   EJECUCIÓN
================================================================ */
async function clearCollections() {
  console.log("\n🗑️  Limpiando colecciones…");
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    InventoryItem.deleteMany({}),
    Menu.deleteMany({}),
    Order.deleteMany({}),
    Table.deleteMany({}),
    Reservation.deleteMany({}),
    Promotion.deleteMany({}),
  ]);
  console.log("   ✓ Limpio");
}

async function seedUsers() {
  console.log("\n👥 Usuarios…");
  const inserted = await User.insertMany(users);
  inserted.forEach((u) => console.log(`   ✓ [${u.role.padEnd(10)}] [turno: ${(u.shift ?? "N/A").padEnd(9)}] ${u.email}`));
  return inserted;
}

async function seedProducts() {
  console.log("\n🍹 Productos…");
  const inserted = await Product.insertMany(products.map((p) => ({ ...p, isActive: true })));
  inserted.forEach((p) => console.log(`   ✓ [${p.type}] ${p.name}`));
  return inserted;
}

async function seedInventory() {
  console.log("\n📦 Inventario…");
  const inserted = await InventoryItem.insertMany(inventory.map((i) => ({
    ...i, isActive: true, description: `${i.name} — stock inicial`,
    supplier: "Distribuidora General",
  })));
  const critical = inserted.filter((i) => i.stock <= i.minStock);
  console.log(`   ✓ ${inserted.length} ítems  (${critical.length} en alerta)`);
  return inserted;
}

async function seedTables() {
  console.log("\n🪑 Mesas…");
  const inserted = await Table.insertMany(tableData.map((t) => ({
    ...t, isLocked: false, orders: [], tags: [], tableCode: null,
  })));
  console.log(`   ✓ ${inserted.length} mesas`);
  return inserted;
}

async function seedMenu(insertedProducts) {
  console.log("\n📋 Menú…");
  const byCategory = {};
  for (const p of insertedProducts) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p._id);
  }
  const categories = Object.entries(byCategory).map(([name, ids], idx) => ({
    name,
    description: `Selección de ${name}`,
    order: idx,
    products: ids.map((id, i) => ({
      product: id, price: null, available: true, featured: i === 0, order: i,
    })),
  }));
  const menu = await Menu.create({
    name: "Carta Nebula",
    slug: "carta-nebula",
    description: "Cócteles, bebidas y gastronomía de autor",
    type: "mixed",
    drinkStyle: "mixed",
    featured: true,
    isActive: true,
    isActiveForPOS: true,
    categories,
  });
  console.log(`   ✓ "${menu.name}" · ${categories.length} categorías`);
  return menu;
}

async function seedPromotions(adminUser) {
  console.log("\n🎯 Promociones…");
  const promos = buildPromotions(adminUser._id);
  const inserted = await Promotion.insertMany(promos);
  inserted.forEach((p) => console.log(`   ✓ [${p.isActive ? "activa  " : "inactiva"}] ${p.name}`));
  return inserted;
}

async function seedOrders(prodList, tableList, adminUser) {
  console.log("\n🧾 Órdenes históricas (30 días)…");
  const orders = buildOrders(prodList, tableList, adminUser);
  const BATCH  = 200;
  let total = 0;
  for (let i = 0; i < orders.length; i += BATCH) {
    await Order.insertMany(orders.slice(i, i + BATCH), { ordered: false });
    total += Math.min(BATCH, orders.length - i);
    process.stdout.write(`\r   ✓ ${total}/${orders.length}`);
  }
  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  console.log(`\n   ✓ ${orders.length} órdenes · $${totalSales.toLocaleString("es-AR")} total`);
  return orders;
}

async function seedReservations(tableList) {
  console.log("\n📅 Reservas…");
  const reservations = buildReservations(tableList);
  await Reservation.insertMany(reservations);
  console.log(`   ✓ ${reservations.length} reservas`);
}

try {
  await clearCollections();
  const insertedUsers    = await seedUsers();
  const adminUser        = insertedUsers.find((u) => u.role === "admin");
  const insertedProducts = await seedProducts();
  await seedInventory();
  const insertedTables   = await seedTables();
  await seedMenu(insertedProducts);
  await seedPromotions(adminUser);
  await seedOrders(insertedProducts, insertedTables, adminUser);
  await seedReservations(insertedTables);

  console.log("\n✅ SEED COMPLETADO\n");
  console.log("Credenciales:");
  console.log("  admin@nebula.bar     / Admin123!");
  console.log("  bartender@nebula.bar / Bar123!");
  console.log("  sofia@nebula.bar     / Bar123!");
  console.log("  waiter@nebula.bar    / Waiter123!");
  console.log("  kitchen@nebula.bar   / Kitchen123!");
  console.log("  cashier@nebula.bar   / Cash123!");
  console.log("  cliente@nebula.bar   / Cliente123!\n");
} catch (err) {
  console.error("\n❌ Error en seed:", err.message);
  process.exit(1);
} finally {
  await mongoose.disconnect();
  console.log("✓ Desconectado\n");
}

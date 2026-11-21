/**
 * SEED MASTER — Bartender System
 * Ejecutar: node backend/src/seeds/seed-master.js
 *
 * Pobla de manera integral y cohesiva toda la base de datos:
 *  1. SystemConfig (Nebula Bar & Lounge, moneda ARS, impuestos, horarios)
 *  2. Usuarios (Admin, Bartenders, Mozos, Cocina, Caja, Clientes) con schedules completos
 *  3. Inventario (Spirits, mixers, jarabes, alimentos, insumos con stock y costos)
 *  4. Productos (Bebidas, comidas, cócteles de autor)
 *  5. Recetario & Escandallos (Fichas técnicas con ingredientes, pasos, técnicas y variantes)
 *  6. Mesas (Salón, Barra, Terraza, VIP)
 *  7. Menú Principal ("Carta Nebula")
 *  8. Recompensas & Fidelidad (Rewards con stock, productos vinculados, cupones REW-8429, historial)
 *  9. UserPoints (Saldos y movimientos de puntos de clientes)
 * 10. Asistencia y Turnos (Histórico de 28 días + colaboradores activos en turno hoy)
 * 11. Órdenes Históricas (30 días de ventas para Dashboard) + 4 Órdenes en vivo con ítem de Canje
 * 12. Registro de Auditoría (ActivityLogs para la pestaña de Auditoría y Control)
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Modelos
import SystemConfig   from "../models/SystemConfig.js";
import User           from "../models/User.js";
import Product        from "../models/Product.js";
import InventoryItem  from "../models/InventoryItem.js";
import Recipe         from "../models/Recipe.js";
import Table          from "../models/Table.js";
import Menu           from "../models/Menu.js";
import Order          from "../models/Order.js";
import Reward         from "../models/Reward.js";
import UserPoints     from "../models/UserPoints.js";
import Attendance     from "../models/Attendance.js";
import ActivityLog    from "../models/ActivityLog.js";
import Promotion      from "../models/Promotion.js";
import Reservation    from "../models/Reservation.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/bartender-db";

console.log("⚡ Conectando a MongoDB...");
await mongoose.connect(MONGO_URI);
console.log("✓ MongoDB conectado");

const hash = (pwd) => bcrypt.hashSync(pwd, 10);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

/* ================================================================
   1. SYSTEM CONFIG
================================================================ */
async function seedSystemConfig() {
  console.log("\n⚙️  Configuración del Sistema...");
  await SystemConfig.deleteMany({});
  const config = await SystemConfig.create({
    business: {
      name: "Nebula Bar & Lounge",
      legalName: "Nebula Gastronomía S.A.",
      taxId: "30-71829384-9",
      phone: "+54 9 11 4567-8900",
      address: "Av. Corrientes 1450, CABA",
      currency: "ARS",
      currencySymbol: "$",
      currencyPosition: "before",
      openingHours: "18:00 - 04:00",
    },
    pos: {
      suggestedTipPercent: 10,
      taxPercent: 21,
      taxIncluded: true,
      delayedOrderMinutesBar: 8,
      delayedOrderMinutesKitchen: 15,
      soundAlerts: true,
      allowZeroStockSale: false,
      autoPrintOrders: false,
    },
    loyalty: {
      pointsPerCurrencyUnit: 0.01,
      welcomeBonusPoints: 100,
      pointsExpiryDays: 365,
      isActive: true,
      minRedemptionPoints: 50,
    },
  });
  console.log(`   ✓ Configuración inicial guardada: "${config.business.name}"`);
  return config;
}

/* ================================================================
   2. USUARIOS CON SCHEDULES REALES
================================================================ */
const daySchedule = (start, end, available = true) => ({
  isAvailable: available,
  startTime: start,
  endTime: end,
});

async function seedUsers() {
  console.log("\n👥 Colaboradores y Usuarios...");
  await User.deleteMany({});

  const standardSchedule = {
    monday:    daySchedule("18:00", "02:00", true),
    tuesday:   daySchedule("18:00", "02:00", true),
    wednesday: daySchedule("18:00", "02:00", true),
    thursday:  daySchedule("18:00", "02:00", true),
    friday:    daySchedule("18:00", "03:00", true),
    saturday:  daySchedule("19:00", "03:00", true),
    sunday:    daySchedule("00:00", "00:00", false),
  };

  const usersData = [
    {
      name: "Admin Principal",
      email: "admin@nebula.bar",
      password: hash("Admin123!"),
      role: "admin",
      shift: "night",
      station: "Administración & Control",
      isEmployee: true,
      isActive: true,
      phone: "+54 9 11 9876-5432",
      schedule: standardSchedule,
      performance: {
        totalHours: 168,
        shiftsCompleted: 21,
        averageRating: 5.0,
        totalSales: 1250000,
      },
    },
    {
      name: "Carlos Bartender",
      email: "bartender@nebula.bar",
      password: hash("Bar123!"),
      role: "bartender",
      shift: "night",
      station: "Barra Principal",
      isEmployee: true,
      isActive: true,
      phone: "+54 9 11 5555-1234",
      schedule: standardSchedule,
      performance: {
        totalHours: 152,
        shiftsCompleted: 19,
        averageRating: 4.9,
        totalSales: 890000,
      },
      attendance: {
        currentStatus: "checked-in",
        lastCheckIn: new Date(Date.now() - 3.5 * 3600 * 1000),
        currentShiftStart: new Date(Date.now() - 3.5 * 3600 * 1000),
        thisMonth: {
          totalHours: 152,
          present: 19,
          late: 1,
          absent: 0,
        },
      },
    },
    {
      name: "Sofía Bartender",
      email: "sofia@nebula.bar",
      password: hash("Bar123!"),
      role: "bartender",
      shift: "afternoon",
      station: "Barra Cócteles & VIP",
      isEmployee: true,
      isActive: true,
      phone: "+54 9 11 4444-5678",
      schedule: standardSchedule,
      performance: {
        totalHours: 140,
        shiftsCompleted: 17,
        averageRating: 4.8,
        totalSales: 740000,
      },
      attendance: {
        currentStatus: "checked-out",
        thisMonth: {
          totalHours: 140,
          present: 17,
          late: 0,
          absent: 1,
        },
      },
    },
    {
      name: "Ana Mesera",
      email: "waiter@nebula.bar",
      password: hash("Waiter123!"),
      role: "waiter",
      shift: "night",
      station: "Salón Principal & Terraza",
      isEmployee: true,
      isActive: true,
      phone: "+54 9 11 3333-7890",
      schedule: standardSchedule,
      performance: {
        totalHours: 144,
        shiftsCompleted: 18,
        averageRating: 4.9,
        totalSales: 620000,
      },
      attendance: {
        currentStatus: "checked-in",
        lastCheckIn: new Date(Date.now() - 2.2 * 3600 * 1000),
        currentShiftStart: new Date(Date.now() - 2.2 * 3600 * 1000),
        thisMonth: {
          totalHours: 144,
          present: 18,
          late: 0,
          absent: 0,
        },
      },
    },
    {
      name: "Pedro Cocina",
      email: "kitchen@nebula.bar",
      password: hash("Kitchen123!"),
      role: "kitchen",
      shift: "afternoon",
      station: "Cocina Fuegos & Platos",
      isEmployee: true,
      isActive: true,
      phone: "+54 9 11 2222-3456",
      schedule: standardSchedule,
      performance: {
        totalHours: 160,
        shiftsCompleted: 20,
        averageRating: 4.7,
        totalSales: 510000,
      },
      attendance: {
        currentStatus: "checked-out",
        thisMonth: {
          totalHours: 160,
          present: 20,
          late: 2,
          absent: 0,
        },
      },
    },
    {
      name: "Laura Cajera",
      email: "cashier@nebula.bar",
      password: hash("Cash123!"),
      role: "cashier",
      shift: "night",
      station: "Caja Central & TPV",
      isEmployee: true,
      isActive: true,
      phone: "+54 9 11 1111-9876",
      schedule: standardSchedule,
      performance: {
        totalHours: 148,
        shiftsCompleted: 18,
        averageRating: 4.9,
        totalSales: 1450000,
      },
      attendance: {
        currentStatus: "checked-out",
        thisMonth: {
          totalHours: 148,
          present: 18,
          late: 0,
          absent: 0,
        },
      },
    },
    {
      name: "Martín Cliente VIP",
      email: "cliente@nebula.bar",
      password: hash("Cliente123!"),
      role: "client",
      isEmployee: false,
      isActive: true,
      phone: "+54 9 11 7777-8888",
    },
  ];

  const inserted = await User.insertMany(usersData);
  inserted.forEach((u) => console.log(`   ✓ [${u.role}] ${u.name} (${u.email})`));
  return inserted;
}

/* ================================================================
   3. INVENTARIO DE INSUMOS
================================================================ */
async function seedInventory() {
  console.log("\n📦 Insumos de Bóveda / Inventario...");
  await InventoryItem.deleteMany({});

  const items = [
    // Spirits & Destilados
    { name: "Gin Bombay Sapphire", category: "destilados", unit: "ml", currentStock: 4500, minStock: 1000, cost: 18.5, idealStock: 6000, isAlcoholic: true },
    { name: "Gin Malfy Rosa", category: "destilados", unit: "ml", currentStock: 2800, minStock: 800, cost: 24.0, idealStock: 4000, isAlcoholic: true },
    { name: "Campari Bitter", category: "licores", unit: "ml", currentStock: 3200, minStock: 800, cost: 12.0, idealStock: 5000, isAlcoholic: true },
    { name: "Vermouth Rosso Cinzano", category: "licores", unit: "ml", currentStock: 3500, minStock: 1000, cost: 8.5, idealStock: 5000, isAlcoholic: true },
    { name: "Bourbon Maker's Mark", category: "destilados", unit: "ml", currentStock: 2100, minStock: 750, cost: 29.0, idealStock: 3500, isAlcoholic: true },
    { name: "Aperol Aperitivo", category: "licores", unit: "ml", currentStock: 4000, minStock: 1000, cost: 11.0, idealStock: 6000, isAlcoholic: true },
    { name: "Prosecco Extra Dry", category: "vinos", unit: "ml", currentStock: 4500, minStock: 1500, cost: 9.0, idealStock: 6000, isAlcoholic: true },
    { name: "Vodka Absolut", category: "destilados", unit: "ml", currentStock: 3000, minStock: 1000, cost: 14.0, idealStock: 5000, isAlcoholic: true },
    { name: "Ron Havana Club 7 Años", category: "destilados", unit: "ml", currentStock: 2500, minStock: 800, cost: 16.0, idealStock: 4000, isAlcoholic: true },

    // Mixers & Syrups
    { name: "Agua Tónica Schweppes", category: "gaseosas", unit: "ml", currentStock: 12000, minStock: 3000, cost: 2.2, idealStock: 20000, isAlcoholic: false },
    { name: "Agua con Gas / Soda", category: "gaseosas", unit: "ml", currentStock: 15000, minStock: 4000, cost: 1.0, idealStock: 25000, isAlcoholic: false },
    { name: "Simple Syrup (Almíbar 1:1)", category: "jarabes", unit: "ml", currentStock: 3000, minStock: 1000, cost: 1.5, idealStock: 5000, isAlcoholic: false },
    { name: "Cordial de Lima & Jengibre", category: "jarabes", unit: "ml", currentStock: 1500, minStock: 500, cost: 4.0, idealStock: 3000, isAlcoholic: false },
    { name: "Bitter Angostura", category: "bitters", unit: "ml", currentStock: 400, minStock: 100, cost: 35.0, idealStock: 600, isAlcoholic: true },
    { name: "Jugo de Limón Fresco", category: "frescos", unit: "ml", currentStock: 2500, minStock: 800, cost: 3.0, idealStock: 4000, isAlcoholic: false },
    { name: "Frutos Rojos Frescos", category: "frescos", unit: "g", currentStock: 1200, minStock: 300, cost: 8.0, idealStock: 2000, isAlcoholic: false },
    { name: "Naranjas de Ombligo", category: "frutas", unit: "unit", currentStock: 80, minStock: 20, cost: 120.0, idealStock: 120, isAlcoholic: false },

    // Cocina & Alimentos
    { name: "Queso Brie Francés", category: "lacteos", unit: "g", currentStock: 2500, minStock: 500, cost: 15.0, idealStock: 4000, isAlcoholic: false },
    { name: "Jamón Serrano Reserva", category: "fiambreria", unit: "g", currentStock: 3000, minStock: 800, cost: 18.0, idealStock: 5000, isAlcoholic: false },
    { name: "Carne Angus Madurada", category: "carnes", unit: "g", currentStock: 8000, minStock: 2000, cost: 12.0, idealStock: 12000, isAlcoholic: false },
    { name: "Pan Brioche de Papa", category: "panaderia", unit: "unit", currentStock: 60, minStock: 15, cost: 250.0, idealStock: 100, isAlcoholic: false },
    { name: "Chocolate Belga 70%", category: "dulces", unit: "g", currentStock: 2000, minStock: 500, cost: 16.0, idealStock: 3500, isAlcoholic: false },
  ];

  const inserted = await InventoryItem.insertMany(items);
  console.log(`   ✓ ${inserted.length} insumos de inventario registrados`);
  return inserted;
}

/* ================================================================
   4. PRODUCTOS POS
================================================================ */
async function seedProducts() {
  console.log("\n🍹 Productos POS...");
  await Product.deleteMany({});

  const productsData = [
    {
      name: "negroni clásico nebula",
      description: "Gin Bombay, Campari Bitter y Vermouth Rosso macerado con piel de naranja",
      price: 3600,
      cost: 950,
      category: "cocteleria de autor",
      type: "drink",
      isAvailable: true,
      rating: 4.9,
    },
    {
      name: "gin tonic de autor",
      description: "Gin Bombay Sapphire, infusión botánica, agua tónica premium y rodaja de pepino",
      price: 3400,
      cost: 820,
      category: "cocteleria de autor",
      type: "drink",
      isAvailable: true,
      rating: 4.8,
    },
    {
      name: "old fashioned ahumado",
      description: "Bourbon Maker's Mark, bitter aromático, azúcar mascabado y ahumado en roble",
      price: 4200,
      cost: 1250,
      category: "cocteleria clasica",
      type: "drink",
      isAvailable: true,
      rating: 5.0,
    },
    {
      name: "aperol spritz veneciano",
      description: "Aperol, Prosecco Extra Dry, splash de soda y media luna de naranja fresca",
      price: 3200,
      cost: 780,
      category: "cocteleria clasica",
      type: "drink",
      isAvailable: true,
      rating: 4.7,
    },
    {
      name: "tabla de quesos & jamón serrano",
      description: "Queso Brie, Gouda artesanal, jamón serrano, frutos secos y tostadas brioche",
      price: 5400,
      cost: 1650,
      category: "tapas & picadas",
      type: "food",
      isAvailable: true,
      rating: 4.9,
    },
    {
      name: "hamburguesa nebula trufada",
      description: "Doble medallón Angus 180g, cheddar madurado, mayonesa de trufas y papas rústicas",
      price: 6200,
      cost: 1900,
      category: "platos principales",
      type: "food",
      isAvailable: true,
      rating: 4.8,
    },
    {
      name: "volcán de chocolate belga",
      description: "Coulant caliente de chocolate 70% con corazón fundido y helado de crema americana",
      price: 2800,
      cost: 750,
      category: "postres de autor",
      type: "food",
      isAvailable: true,
      rating: 5.0,
    },
  ];

  const inserted = await Product.insertMany(productsData);
  inserted.forEach((p) => console.log(`   ✓ [${p.type}] ${p.name} · $${p.price}`));
  return inserted;
}

/* ================================================================
   5. RECETARIO & ESCANDALLOS CON VARIANTES
================================================================ */
async function seedRecipes(products, inventory) {
  console.log("\n📖 Recetario & Escandallos (Fichas Maestras & Variantes)...");
  await Recipe.deleteMany({});

  const ginBombay = inventory.find((i) => i.name.includes("Gin Bombay"));
  const ginMalfy  = inventory.find((i) => i.name.includes("Gin Malfy"));
  const campari   = inventory.find((i) => i.name.includes("Campari"));
  const vermouth  = inventory.find((i) => i.name.includes("Vermouth"));
  const tonica    = inventory.find((i) => i.name.includes("Tónica"));
  const bourbon   = inventory.find((i) => i.name.includes("Bourbon"));
  const angostura = inventory.find((i) => i.name.includes("Angostura"));
  const syrup     = inventory.find((i) => i.name.includes("Simple Syrup"));
  const brie      = inventory.find((i) => i.name.includes("Queso Brie"));
  const jamon     = inventory.find((i) => i.name.includes("Jamón"));
  const chocolate = inventory.find((i) => i.name.includes("Chocolate Belga"));

  const negroniProd = products.find((p) => p.name.includes("negroni"));
  const ginProd     = products.find((p) => p.name.includes("gin tonic"));
  const oldProd     = products.find((p) => p.name.includes("old fashioned"));
  const tablaProd   = products.find((p) => p.name.includes("tabla de quesos"));
  const volcanProd  = products.find((p) => p.name.includes("volcán"));

  // 1. Receta Maestra Negroni
  const negroniRecipe = await Recipe.create({
    product: negroniProd._id,
    isPrimary: true,
    type: "drink",
    drinkStyle: "classic",
    category: "cocteleria de autor",
    ingredients: [
      { inventoryItem: ginBombay._id, quantity: 30, unit: "ml", order: 1 },
      { inventoryItem: campari._id,   quantity: 30, unit: "ml", order: 2 },
      { inventoryItem: vermouth._id,  quantity: 30, unit: "ml", order: 3 },
    ],
    method: "Refrescado en vaso mezclador con hielo cristal",
    steps: [
      { stepNumber: 1, instruction: "Enfriar vaso mezclador y copa Old Fashioned con hielo." },
      { stepNumber: 2, instruction: "Verter 30ml de Gin, 30ml de Campari y 30ml de Vermouth Rosso." },
      { stepNumber: 3, instruction: "Refrescar durante 25 segundos y colar sobre un bloque de hielo puro." },
      { stepNumber: 4, instruction: "Decorar con piel de naranja aromatizando los bordes del vaso." },
    ],
  });

  // Variante: Negroni Premium con Gin Malfy Rosa
  await Recipe.create({
    product: negroniProd._id,
    parentId: negroniRecipe._id,
    isPrimary: false,
    variantName: "Negroni Premium Malfy Rosa",
    variantType: "spirit",
    newPrice: 4200,
    type: "drink",
    drinkStyle: "author",
    category: "cocteleria de autor",
    ingredients: [
      { inventoryItem: ginMalfy._id,  quantity: 30, unit: "ml", order: 1 },
      { inventoryItem: campari._id,   quantity: 30, unit: "ml", order: 2 },
      { inventoryItem: vermouth._id,  quantity: 30, unit: "ml", order: 3 },
    ],
    method: "Refrescado elegante con twist floral y cítrico",
    steps: negroniRecipe.steps,
  });

  // 2. Receta Maestra Gin Tonic
  const ginRecipe = await Recipe.create({
    product: ginProd._id,
    isPrimary: true,
    type: "drink",
    drinkStyle: "classic",
    category: "cocteleria de autor",
    ingredients: [
      { inventoryItem: ginBombay._id, quantity: 50, unit: "ml", order: 1 },
      { inventoryItem: tonica._id,    quantity: 150, unit: "ml", order: 2 },
    ],
    method: "Construido directo en copa balón con hielo entero",
    steps: [
      { stepNumber: 1, instruction: "Llenar copa balón con hielo hasta el borde." },
      { stepNumber: 2, instruction: "Añadir 50ml de Gin Bombay Sapphire." },
      { stepNumber: 3, instruction: "Incorporar suavemente el agua tónica con cucharilla espiral." },
      { stepNumber: 4, instruction: "Garnish con rodaja fina de pepino y bayas de enebro." },
    ],
  });

  // Variante: Gin Tonic Doble XL
  await Recipe.create({
    product: ginProd._id,
    parentId: ginRecipe._id,
    isPrimary: false,
    variantName: "Gin Tonic Doble XL (700ml)",
    variantType: "size",
    newPrice: 5200,
    type: "drink",
    drinkStyle: "author",
    category: "cocteleria de autor",
    ingredients: [
      { inventoryItem: ginBombay._id, quantity: 90, unit: "ml", order: 1 },
      { inventoryItem: tonica._id,    quantity: 260, unit: "ml", order: 2 },
    ],
    method: "Servicio extendido en copa balón gigante",
    steps: ginRecipe.steps,
  });

  // 3. Receta Cocina: Tabla de Quesos
  await Recipe.create({
    product: tablaProd._id,
    isPrimary: true,
    type: "food",
    category: "tapas & picadas",
    ingredients: [
      { inventoryItem: brie._id,  quantity: 120, unit: "g", order: 1 },
      { inventoryItem: jamon._id, quantity: 100, unit: "g", order: 2 },
    ],
    method: "Montaje sobre tabla de madera curada con frutos secos",
    steps: [
      { stepNumber: 1, instruction: "Cortar el queso brie a temperatura ambiente en cuñas homogéneas." },
      { stepNumber: 2, instruction: "Disponer las láminas de jamón serrano en ondas." },
      { stepNumber: 3, instruction: "Acompañar con tostadas brioche recién tostadas." },
    ],
  });

  console.log(`   ✓ Fichas maestras y variantes creadas con éxito`);
}

/* ================================================================
   6. MESAS DEL LOCAL
================================================================ */
async function seedTables() {
  console.log("\n🪑 Mesas del Salón y Barra...");
  await Table.deleteMany({});

  const tablesData = [
    { number: 1,  capacity: 2, location: "bar",     status: "occupied" },
    { number: 2,  capacity: 2, location: "bar",     status: "occupied" },
    { number: 3,  capacity: 4, location: "indoor",  status: "available" },
    { number: 4,  capacity: 4, location: "indoor",  status: "available" },
    { number: 5,  capacity: 6, location: "indoor",  status: "occupied" },
    { number: 6,  capacity: 4, location: "outdoor", status: "available" },
    { number: 7,  capacity: 4, location: "outdoor", status: "available" },
    { number: 8,  capacity: 8, location: "indoor",  status: "occupied" },
    { number: 9,  capacity: 4, location: "indoor",  status: "available" },
    { number: 10, capacity: 6, location: "indoor",  status: "available" },
  ];

  const inserted = await Table.insertMany(tablesData);
  console.log(`   ✓ ${inserted.length} mesas configuradas`);
  return inserted;
}

/* ================================================================
   7. MENÚ CARTA NEBULA
================================================================ */
async function seedMenu(products) {
  console.log("\n📜 Carta Menú Principal...");
  await Menu.deleteMany({});

  const categories = [
    {
      name: "Cócteles de Autor",
      description: "Creaciones exclusivas de la casa",
      order: 1,
      products: products.filter((p) => p.category.includes("cocteleria")).map((p, i) => ({
        product: p._id,
        available: true,
        featured: i === 0,
        order: i + 1,
      })),
    },
    {
      name: "Cocina & Tapas",
      description: "Platos y entradas para maridar",
      order: 2,
      products: products.filter((p) => p.type === "food").map((p, i) => ({
        product: p._id,
        available: true,
        featured: i === 0,
        order: i + 1,
      })),
    },
  ];

  const menu = await Menu.create({
    name: "Carta Nebula",
    slug: "carta-nebula",
    description: "Carta oficial de coctelería y gastronomía",
    type: "mixed",
    drinkStyle: "mixed",
    featured: true,
    isActive: true,
    isActiveForPOS: true,
    categories,
  });

  console.log(`   ✓ Menú "${menu.name}" creado`);
  return menu;
}

/* ================================================================
   8. RECOMPENSAS & FIDELIDAD (REWARDS CON VOUCHERS)
================================================================ */
async function seedRewards(products, users) {
  console.log("\n🎁 Sistema de Recompensas & Fidelidad...");
  await Reward.deleteMany({});

  const client = users.find((u) => u.role === "client") || users[0];
  const admin  = users.find((u) => u.role === "admin") || users[0];
  const negroniProd = products.find((p) => p.name.includes("negroni"));
  const ginProd     = products.find((p) => p.name.includes("gin tonic"));
  const tablaProd   = products.find((p) => p.name.includes("tabla de quesos"));

  const rewardsData = [
    {
      name: "Negroni Clásico de Cortesía",
      description: "Canjea 1 Negroni Nebula preparado por nuestro Bartender en Barra",
      pointsCost: 120,
      category: "drink",
      product: negroniProd?._id || null,
      stock: 45,
      active: true,
      redemptions: [
        {
          user: client._id,
          redeemedAt: new Date(Date.now() - 2 * 3600 * 1000),
          code: "REW-8429",
          status: "pending",
        },
        {
          user: client._id,
          redeemedAt: new Date(Date.now() - 24 * 3600 * 1000),
          code: "REW-5521",
          status: "claimed",
          claimedAt: new Date(Date.now() - 22 * 3600 * 1000),
          claimedBy: admin._id,
        },
      ],
    },
    {
      name: "Gin Tonic Nebula de Cortesía",
      description: "Copa balón con Gin Bombay Sapphire y botánicos seleccionados",
      pointsCost: 100,
      category: "drink",
      product: ginProd?._id || null,
      stock: 50,
      active: true,
      redemptions: [
        {
          user: client._id,
          redeemedAt: new Date(Date.now() - 48 * 3600 * 1000),
          code: "REW-1042",
          status: "pending",
        },
      ],
    },
    {
      name: "Tapa de Quesos & Jamón Serrano",
      description: "Porción degustación de quesos curados y jamón reserva",
      pointsCost: 180,
      category: "food",
      product: tablaProd?._id || null,
      stock: 30,
      active: true,
      redemptions: [
        {
          user: client._id,
          redeemedAt: new Date(Date.now() - 72 * 3600 * 1000),
          code: "REW-9014",
          status: "claimed",
          claimedAt: new Date(Date.now() - 70 * 3600 * 1000),
          claimedBy: admin._id,
        },
      ],
    },
    {
      name: "Descuento 15% en Cuenta Final",
      description: "Aplica 15% off al total de tu comanda en salón o barra",
      pointsCost: 200,
      category: "discount",
      discountPercent: 15,
      stock: -1,
      active: true,
      redemptions: [],
    },
    {
      name: "Volcán de Chocolate Belga",
      description: "Postre de autor tibio con helado de crema americana",
      pointsCost: 150,
      category: "food",
      stock: 20,
      active: true,
      redemptions: [],
    },
  ];

  const inserted = await Reward.insertMany(rewardsData);
  inserted.forEach((r) =>
    console.log(`   ✓ [${r.category}] ${r.name} (${r.pointsCost} pts) · ${r.redemptions.length} canjes`)
  );
  return inserted;
}

/* ================================================================
   9. PUNTOS DE USUARIO (USER POINTS)
================================================================ */
async function seedUserPoints(users) {
  console.log("\n⭐ Puntos de Fidelidad de Clientes...");
  await UserPoints.deleteMany({});

  const client = users.find((u) => u.role === "client") || users[0];

  const userPoints = await UserPoints.create({
    user: client._id,
    balance: 450,
    totalEarned: 870,
    totalRedeemed: 420,
    movements: [
      {
        type: "earn",
        amount: 200,
        description: "Bono de Bienvenida Nebula Club",
        createdAt: new Date(Date.now() - 15 * 86400 * 1000),
      },
      {
        type: "earn",
        amount: 350,
        description: "Puntos por consumo en Salón (Orden #1084)",
        createdAt: new Date(Date.now() - 7 * 86400 * 1000),
      },
      {
        type: "redeem",
        amount: 120,
        description: "Canje de Negroni Clásico (Voucher REW-5521)",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000),
      },
      {
        type: "earn",
        amount: 320,
        description: "Puntos por consumo en Barra VIP",
        createdAt: new Date(Date.now() - 4 * 3600 * 1000),
      },
      {
        type: "redeem",
        amount: 180,
        description: "Canje de Tapa de Quesos (Voucher REW-9014)",
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      },
    ],
  });

  console.log(`   ✓ Cliente ${client.name} con saldo: ${userPoints.balance} puntos`);
  return userPoints;
}

/* ================================================================
   10. ASISTENCIA & HISTORIAL DE TURNOS (28 DÍAS + HOY)
================================================================ */
async function seedAttendance(employees) {
  console.log("\n⏱️  Turnos & Asistencia (28 días + Tiempo Real)...");
  await Attendance.deleteMany({});

  const records = [];
  const DAYS_BACK = 28;

  for (const emp of employees) {
    if (emp.role === "client") continue;

    for (let d = DAYS_BACK; d >= 1; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      date.setHours(0, 0, 0, 0);

      // Descanso aleatorio
      if (d % 7 === 0) continue;

      const checkInHour = emp.shift === "morning" ? 8 : emp.shift === "afternoon" ? 16 : 20;
      const checkIn = new Date(date);
      checkIn.setHours(checkInHour, rand(0, 10), 0);

      const checkOut = new Date(date);
      checkOut.setHours((checkInHour + 8) % 24, rand(0, 15), 0);
      if (checkInHour + 8 >= 24) {
        checkOut.setDate(checkOut.getDate() + 1);
      }

      records.push({
        user: emp._id,
        shift: emp.shift || "night",
        station: emp.station || "Barra Principal",
        date,
        status: "present",
        checkIn: { time: checkIn, device: "POS Nebula Central", ip: "192.168.1.100" },
        checkOut: { time: checkOut, device: "POS Nebula Central", ip: "192.168.1.100" },
        scheduledHours: 8,
        workedHours: 8.0,
        breakHours: 1,
        isApproved: true,
        notes: { system: "seeded" },
      });
    }
  }

  // Registros en vivo para HOY
  const carlos = employees.find((e) => e.email === "bartender@nebula.bar");
  if (carlos) {
    const todayCheckIn = new Date(Date.now() - 3.5 * 3600 * 1000);
    records.push({
      user: carlos._id,
      shift: carlos.shift || "night",
      station: "Barra Principal",
      date: new Date(),
      status: "present",
      checkIn: { time: todayCheckIn, device: "POS Barra #1", ip: "192.168.1.101" },
      scheduledHours: 8,
      isApproved: true,
      notes: { system: "seeded-live" },
    });
  }

  const ana = employees.find((e) => e.email === "waiter@nebula.bar");
  if (ana) {
    const todayCheckIn = new Date(Date.now() - 2.2 * 3600 * 1000);
    records.push({
      user: ana._id,
      shift: ana.shift || "night",
      station: "Salón Principal & Terraza",
      date: new Date(),
      status: "present",
      checkIn: { time: todayCheckIn, device: "Handheld Mozo #3", ip: "192.168.1.120" },
      scheduledHours: 8,
      isApproved: true,
      notes: { system: "seeded-live" },
    });
  }

  await Attendance.insertMany(records);
  console.log(`   ✓ ${records.length} registros de fichaje guardados (Carlos & Ana en servicio activo)`);
}

/* ================================================================
   11. ÓRDENES HISTÓRICAS (DASHBOARD) + ÓRDENES EN VIVO
================================================================ */
async function seedOrders(products, tables, users) {
  console.log("\n📊 Órdenes (Historial 30 días + Comandas en Vivo)...");
  await Order.deleteMany({});

  const admin = users.find((u) => u.role === "admin") || users[0];
  const client = users.find((u) => u.role === "client") || users[0];

  const historicalOrders = [];
  const DAYS_BACK = 30;

  // Generar 120 órdenes en los últimos 30 días para alimentar los gráficos del Dashboard
  for (let d = DAYS_BACK; d >= 1; d--) {
    const ordersPerDay = rand(3, 7);
    for (let o = 0; o < ordersPerDay; o++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      date.setHours(rand(18, 23), rand(0, 59), 0);

      const p1 = pick(products);
      const p2 = pick(products);
      const items = [
        {
          product: p1._id,
          name: p1.name,
          price: p1.price,
          quantity: rand(1, 2),
          type: p1.type,
          status: "served",
        },
        {
          product: p2._id,
          name: p2.name,
          price: p2.price,
          quantity: 1,
          type: p2.type,
          status: "served",
        },
      ];

      const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
      const tax = Math.round(subtotal * 0.21);
      const total = subtotal + tax;

      const assignedTable = pick(tables);
      historicalOrders.push({
        table: assignedTable._id,
        items,
        subtotal,
        total,
        status: "completed",
        paymentStatus: "paid",
        sessionStatus: "closed",
        createdAt: date,
        updatedAt: date,
      });
    }
  }

  await Order.insertMany(historicalOrders);
  console.log(`   ✓ ${historicalOrders.length} órdenes históricas creadas`);

  // ÓRDENES ACTIVAS EN VIVO HOY (Una de ellas contiene el canje de recompensa separado)
  const negroni = products.find((p) => p.name.includes("negroni"));
  const gin     = products.find((p) => p.name.includes("gin tonic"));
  const tabla   = products.find((p) => p.name.includes("tabla"));
  const burger  = products.find((p) => p.name.includes("hamburguesa"));

  const table2 = tables.find((t) => t.number === 2) || tables[1];
  const table5 = tables.find((t) => t.number === 5) || tables[4];
  const table8 = tables.find((t) => t.number === 8) || tables[7];

  const liveOrders = [
    // Mesa 2 (Barra): Negroni + Tabla
    {
      table: table2._id,
      status: "in-progress",
      paymentStatus: "unpaid",
      sessionStatus: "open",
      items: [
        { product: negroni._id, name: negroni.name, price: negroni.price, quantity: 2, type: "drink", status: "preparing" },
        { product: tabla._id,   name: tabla.name,   price: tabla.price,   quantity: 1, type: "food",  status: "preparing" },
      ],
      subtotal: negroni.price * 2 + tabla.price,
      total: negroni.price * 2 + tabla.price,
    },

    // Mesa 5 (Salón VIP): 2 Gin Tonic + 1 CANJE RECOMPENSA SEPARADO
    {
      table: table5._id,
      status: "in-progress",
      paymentStatus: "unpaid",
      sessionStatus: "open",
      items: [
        {
          product: gin._id,
          name: gin.name,
          price: gin.price,
          quantity: 2,
          type: "drink",
          status: "ready",
        },
        // ITEM DE CANJE DE RECOMPENSA (Separado, $0, rotulado con categoría y código)
        {
          product: negroni._id,
          name: "CANJE: Negroni Clásico (Bebida)",
          price: 0,
          quantity: 1,
          type: "drink",
          status: "ready",
          isReward: true,
          rewardCode: "REW-8429",
          rewardCategory: "drink",
          notes: "Canje verificado por App Mobile / Fidelidad",
        },
      ],
      subtotal: gin.price * 2,
      total: gin.price * 2,
    },

    // Mesa 8 (Salón): Hamburguesa + Gin
    {
      table: table8._id,
      status: "pending",
      paymentStatus: "unpaid",
      sessionStatus: "open",
      items: [
        { product: burger._id, name: burger.name, price: burger.price, quantity: 2, type: "food", status: "pending" },
        { product: gin._id,    name: gin.name,    price: gin.price,    quantity: 1, type: "drink", status: "pending" },
      ],
      subtotal: burger.price * 2 + gin.price,
      total: burger.price * 2 + gin.price,
    },
  ];

  await Order.insertMany(liveOrders);
  console.log(`   ✓ 3 comandas activas en vivo (Mesa 5 con CANJE de Recompensa rotulado y $0)`);
}

/* ================================================================
   12. AUDITORÍA (ACTIVITY LOGS)
================================================================ */
async function seedActivityLogs(users) {
  console.log("\n🛡️  Registros de Auditoría del Sistema...");
  await ActivityLog.deleteMany({});

  const admin = users.find((u) => u.role === "admin") || users[0];
  const carlos = users.find((u) => u.email === "bartender@nebula.bar") || users[0];

  const logs = [
    {
      userId: admin._id,
      userName: admin.name,
      userRole: "admin",
      activityType: "login",
      description: "Inicio de sesión exitoso en TPV Control Center",
      metadata: { ip: "192.168.1.100", device: "Desktop Admin" },
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
    },
    {
      userId: carlos._id,
      userName: carlos.name,
      userRole: "bartender",
      activityType: "login",
      description: "Fichaje de entrada registrado en estación Barra Principal",
      metadata: { station: "Barra Principal", shift: "night" },
      createdAt: new Date(Date.now() - 3.5 * 3600 * 1000),
    },
    {
      userId: admin._id,
      userName: admin.name,
      userRole: "admin",
      activityType: "settings_updated",
      description: "Actualización de parámetros del sistema y políticas de respaldo",
      metadata: { backupInterval: 60, lowStockAlerts: true },
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    },
    {
      userId: admin._id,
      userName: admin.name,
      userRole: "admin",
      activityType: "order_created",
      description: "Validación y canje de voucher fidelidad REW-8429 en Mesa 5",
      metadata: { reward: "Negroni Clásico", code: "REW-8429", table: 5 },
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
    },
  ];

  await ActivityLog.insertMany(logs);
  console.log(`   ✓ ${logs.length} eventos de auditoría registrados`);
}

/* ================================================================
   MAIN EXECUTION
================================================================ */
async function run() {
  try {
    await seedSystemConfig();
    const users = await seedUsers();
    const inventory = await seedInventory();
    const products = await seedProducts();
    await seedRecipes(products, inventory);
    const tables = await seedTables();
    await seedMenu(products);
    await seedRewards(products, users);
    await seedUserPoints(users);
    await seedAttendance(users);
    await seedOrders(products, tables, users);
    await seedActivityLogs(users);

    console.log("\n========================================================");
    console.log("🚀 MASTER SEED COMPLETADO CON ÉXITO");
    console.log("========================================================");
    console.log("Credenciales de Acceso:");
    console.log("  👑 Admin:     admin@nebula.bar     / Admin123!");
    console.log("  🍸 Bartender: bartender@nebula.bar / Bar123!");
    console.log("  🍸 Sofía:     sofia@nebula.bar     / Bar123!");
    console.log("  🍽️ Mozo:      waiter@nebula.bar    / Waiter123!");
    console.log("  👨‍🍳 Cocina:    kitchen@nebula.bar   / Kitchen123!");
    console.log("  💳 Caja:      cashier@nebula.bar   / Cash123!");
    console.log("  ⭐ Cliente:   cliente@nebula.bar   / Cliente123!");
    console.log("========================================================\n");
  } catch (err) {
    console.error("\n❌ Error en Master Seed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("✓ Conexión MongoDB cerrada.");
    process.exit(0);
  }
}

run();

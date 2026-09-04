/**
 * SEED — Bartender System
 * Ejecutar: node src/seeds/seed.js
 *
 * Pobla la base de datos con:
 *  - Usuarios (1 admin, 1 bartender, 1 waiter, 1 cliente)
 *  - Productos (bebidas y comidas con imágenes reales de Unsplash)
 *  - Inventario (ingredientes del bar)
 *  - Menú principal
 *  - Recetas básicas
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* ── Modelos ─────────────────────────────────────────────────── */
import User         from "../models/User.js";
import Product      from "../models/Product.js";
import InventoryItem from "../models/InventoryItem.js";
import Menu         from "../models/Menu.js";

/* ── Conexión ────────────────────────────────────────────────── */
await mongoose.connect(process.env.MONGO_URI);
console.log("✓ MongoDB conectado");

/* ── Helpers ─────────────────────────────────────────────────── */
const hash = (pwd) => bcrypt.hashSync(pwd, 10);

/* ================================================================
   USUARIOS
================================================================ */
const users = [
  {
    name: "Admin Principal",
    email: "admin@nebula.bar",
    password: hash("Admin123!"),
    role: "admin",
    isEmployee: true,
    isActive: true,
    provider: "local",
    providerVerified: true,
  },
  {
    name: "Carlos Bartender",
    email: "bartender@nebula.bar",
    password: hash("Bar123!"),
    role: "bartender",
    isEmployee: true,
    isActive: true,
    provider: "local",
    providerVerified: true,
  },
  {
    name: "Ana Mesera",
    email: "waiter@nebula.bar",
    password: hash("Waiter123!"),
    role: "waiter",
    isEmployee: true,
    isActive: true,
    provider: "local",
    providerVerified: true,
  },
  {
    name: "Juan Cliente",
    email: "cliente@nebula.bar",
    password: hash("Cliente123!"),
    role: "client",
    isEmployee: false,
    isActive: true,
    provider: "local",
    providerVerified: true,
  },
];

/* ================================================================
   PRODUCTOS — bebidas y comidas con imágenes de Unsplash
================================================================ */
const products = [
  /* ── CÓCTELES CLÁSICOS ─────────────────────────────────────── */
  {
    name: "Old Fashioned",
    description: "Whisky bourbon, azúcar, bitter y twist de naranja. El clásico de los clásicos.",
    price: 1800,
    cost: 600,
    category: "Cócteles Clásicos",
    type: "drink",
    drinkStyle: "classic",
    available: true,
    featured: true,
    isActiveForPOS: true,
    preparationTime: 5,
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80",
    tags: ["whisky", "clásico", "nocturno"],
    dietaryRestrictions: ["sugar-free"],
  },
  {
    name: "Mojito Premium",
    description: "Ron blanco, hierbabuena fresca, lima, azúcar y agua con gas artesanal.",
    price: 1600,
    cost: 500,
    category: "Cócteles Clásicos",
    type: "drink",
    drinkStyle: "classic",
    available: true,
    featured: false,
    isActiveForPOS: true,
    preparationTime: 6,
    image: "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=600&q=80",
    tags: ["ron", "fresco", "clásico"],
    dietaryRestrictions: ["vegan"],
  },
  {
    name: "Negroni",
    description: "Gin, Campari y vermut rojo en proporciones iguales. Sofisticado y amargo.",
    price: 1900,
    cost: 650,
    category: "Cócteles Clásicos",
    type: "drink",
    drinkStyle: "classic",
    available: true,
    featured: true,
    isActiveForPOS: true,
    preparationTime: 4,
    image: "https://images.unsplash.com/photo-1574070617122-b9a86f86ee0e?w=600&q=80",
    tags: ["gin", "amargo", "aperitivo"],
    dietaryRestrictions: [],
  },
  {
    name: "Margarita Clásica",
    description: "Tequila blanco, triple sec y jugo de lima fresco con sal en el borde.",
    price: 1700,
    cost: 550,
    category: "Cócteles Clásicos",
    type: "drink",
    drinkStyle: "classic",
    available: true,
    featured: false,
    isActiveForPOS: true,
    preparationTime: 5,
    image: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=600&q=80",
    tags: ["tequila", "cítrico"],
    dietaryRestrictions: ["vegan"],
  },
  {
    name: "Espresso Martini",
    description: "Vodka premium, licor de café, espresso doble y almíbar de vainilla.",
    price: 2000,
    cost: 700,
    category: "Cócteles Clásicos",
    type: "drink",
    drinkStyle: "classic",
    available: true,
    featured: true,
    isActiveForPOS: true,
    preparationTime: 6,
    image: "https://images.unsplash.com/photo-1622499455605-69e4d9af1432?w=600&q=80",
    tags: ["café", "vodka", "noche"],
    dietaryRestrictions: [],
  },

  /* ── CÓCTELES DE AUTOR ─────────────────────────────────────── */
  {
    name: "Nebula Sour",
    description: "Mezcal artesanal, maracuyá, albahaca fresca y espuma de clara de huevo.",
    price: 2200,
    cost: 750,
    category: "Firma del Bar",
    type: "drink",
    drinkStyle: "author",
    available: true,
    featured: true,
    isActiveForPOS: true,
    preparationTime: 8,
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&q=80",
    tags: ["mezcal", "autor", "especial"],
    dietaryRestrictions: [],
  },
  {
    name: "Gold Rush",
    description: "Bourbon artesanal, miel de abejas nativas, jengibre y limón amarillo.",
    price: 2100,
    cost: 700,
    category: "Firma del Bar",
    type: "drink",
    drinkStyle: "author",
    available: true,
    featured: true,
    isActiveForPOS: true,
    preparationTime: 7,
    image: "https://images.unsplash.com/photo-1595565670901-4e72a5b4c0b1?w=600&q=80",
    tags: ["bourbon", "miel", "autor"],
    dietaryRestrictions: ["dairy-free"],
  },

  /* ── DESTILADOS ────────────────────────────────────────────── */
  {
    name: "Gin Mare en las Rocas",
    description: "Gin Mediterráneo servido sobre hielo gigante con twist de pomelo.",
    price: 2400,
    cost: 900,
    category: "Gin",
    type: "drink",
    drinkStyle: "classic",
    available: true,
    featured: false,
    isActiveForPOS: true,
    preparationTime: 3,
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80",
    tags: ["gin", "premium", "méditerranée"],
    dietaryRestrictions: ["vegan", "gluten-free"],
  },
  {
    name: "Johnnie Walker Black",
    description: "Whisky blended escocés 12 años. Servido solo, con agua o hielo.",
    price: 2600,
    cost: 950,
    category: "Whisky",
    type: "drink",
    drinkStyle: "classic",
    available: true,
    featured: false,
    isActiveForPOS: true,
    preparationTime: 2,
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80",
    tags: ["whisky", "escocés", "premium"],
    dietaryRestrictions: ["gluten-free"],
  },

  /* ── SIN ALCOHOL ───────────────────────────────────────────── */
  {
    name: "Virgin Mojito",
    description: "Agua mineral, hierbabuena, lima, azúcar de caña y hielo granizado.",
    price: 1100,
    cost: 280,
    category: "Sin Alcohol",
    type: "drink",
    drinkStyle: "classic",
    available: true,
    featured: false,
    isActiveForPOS: true,
    preparationTime: 5,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
    tags: ["sin alcohol", "fresco"],
    dietaryRestrictions: ["vegan", "gluten-free", "dairy-free"],
  },
  {
    name: "Limonada de Jengibre",
    description: "Limón exprimido, jengibre fresco, menta, azúcar integral y soda.",
    price: 950,
    cost: 200,
    category: "Sin Alcohol",
    type: "drink",
    drinkStyle: "classic",
    available: true,
    featured: false,
    isActiveForPOS: true,
    preparationTime: 4,
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&q=80",
    tags: ["sin alcohol", "limón", "saludable"],
    dietaryRestrictions: ["vegan", "gluten-free", "dairy-free", "sugar-free"],
  },

  /* ── COMIDAS / TAPAS ───────────────────────────────────────── */
  {
    name: "Tabla de Quesos y Embutidos",
    description: "Selección de quesos artesanales, jamón serrano, chorizo y picos de pan.",
    price: 3200,
    cost: 1200,
    category: "Para Picar",
    type: "food",
    available: true,
    featured: true,
    isActiveForPOS: true,
    preparationTime: 8,
    image: "https://images.unsplash.com/photo-1505575967455-40e256f73376?w=600&q=80",
    tags: ["queso", "embutidos", "para compartir"],
    dietaryRestrictions: ["gluten-free"],
  },
  {
    name: "Bruschetta de Tomate",
    description: "Pan rústico tostado con tomates cherry, albahaca, ajo y aceite de oliva virgen.",
    price: 1400,
    cost: 450,
    category: "Para Picar",
    type: "food",
    available: true,
    featured: false,
    isActiveForPOS: true,
    preparationTime: 6,
    image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80",
    tags: ["vegetariano", "entrante"],
    dietaryRestrictions: ["vegetarian", "dairy-free"],
  },
  {
    name: "Nachos con Guacamole",
    description: "Chips de maíz horneados, guacamole casero, jalapeños y crema agria.",
    price: 1900,
    cost: 600,
    category: "Para Picar",
    type: "food",
    available: true,
    featured: false,
    isActiveForPOS: true,
    preparationTime: 10,
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&q=80",
    tags: ["mexicano", "para compartir"],
    dietaryRestrictions: ["vegetarian", "gluten-free"],
  },
  {
    name: "Mini Hamburguesa Premium",
    description: "Carne de res 200g, queso cheddar curado, cebolla caramelizada y brioche artesanal.",
    price: 2800,
    cost: 1000,
    category: "Platos",
    type: "food",
    available: true,
    featured: true,
    isActiveForPOS: true,
    preparationTime: 15,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    tags: ["hamburguesa", "principal"],
    dietaryRestrictions: [],
  },
  {
    name: "Pizza Margherita Artesanal",
    description: "Masa madre de 24 horas, salsa de tomate san marzano, mozzarella fior di latte y albahaca.",
    price: 2600,
    cost: 900,
    category: "Platos",
    type: "food",
    available: true,
    featured: false,
    isActiveForPOS: true,
    preparationTime: 20,
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80",
    tags: ["pizza", "italiana", "vegetariano"],
    dietaryRestrictions: ["vegetarian"],
  },
  {
    name: "Brownie con Helado",
    description: "Brownie de chocolate negro 70%, helado de vainilla artesanal y salsa de caramelo.",
    price: 1600,
    cost: 500,
    category: "Postres",
    type: "food",
    available: true,
    featured: false,
    isActiveForPOS: true,
    preparationTime: 5,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80",
    tags: ["postre", "chocolate"],
    dietaryRestrictions: ["vegetarian"],
  },
];

/* ================================================================
   INVENTARIO — ingredientes del bar
================================================================ */
const inventory = [
  { name: "Bourbon Artesanal",    category: "Destilados",  stock: 12,  minStock: 3,  maxStock: 24,  unit: "unit",  cost: 4500, supplier: "Distribuidora Premium",  sector: "bar",     location: "storage" },
  { name: "Gin Mare",             category: "Gin",         stock: 8,   minStock: 2,  maxStock: 16,  unit: "unit",  cost: 5800, supplier: "Importadora Ibérica",    sector: "bar",     location: "storage" },
  { name: "Ron Blanco Superior",  category: "Destilados",  stock: 15,  minStock: 4,  maxStock: 30,  unit: "unit",  cost: 2800, supplier: "Distribuidora Premium",  sector: "bar",     location: "storage" },
  { name: "Tequila Silver",       category: "Destilados",  stock: 10,  minStock: 3,  maxStock: 20,  unit: "unit",  cost: 3200, supplier: "Importadora México",     sector: "bar",     location: "storage" },
  { name: "Vodka Premium",        category: "Destilados",  stock: 14,  minStock: 4,  maxStock: 28,  unit: "unit",  cost: 2600, supplier: "Distribuidora Premium",  sector: "bar",     location: "storage" },
  { name: "Mezcal Artesanal",     category: "Destilados",  stock: 6,   minStock: 2,  maxStock: 12,  unit: "unit",  cost: 6200, supplier: "Importadora México",     sector: "bar",     location: "storage" },
  { name: "Campari",              category: "Licores",     stock: 5,   minStock: 2,  maxStock: 10,  unit: "unit",  cost: 3400, supplier: "Distribuidora Premium",  sector: "bar",     location: "storage" },
  { name: "Vermut Rojo",          category: "Licores",     stock: 7,   minStock: 2,  maxStock: 14,  unit: "unit",  cost: 2200, supplier: "Distribuidora Premium",  sector: "bar",     location: "storage" },
  { name: "Licor de Café",        category: "Licores",     stock: 8,   minStock: 2,  maxStock: 16,  unit: "unit",  cost: 2800, supplier: "Distribuidora Premium",  sector: "bar",     location: "storage" },
  { name: "Triple Sec",           category: "Licores",     stock: 9,   minStock: 2,  maxStock: 18,  unit: "unit",  cost: 1800, supplier: "Distribuidora Premium",  sector: "bar",     location: "storage" },
  { name: "Jugo de Lima",         category: "Jugos",       stock: 25,  minStock: 10, maxStock: 50,  unit: "l",     cost: 180,  supplier: "Mercado Central",        sector: "bar",     location: "bar"     },
  { name: "Jugo de Limón",        category: "Jugos",       stock: 22,  minStock: 8,  maxStock: 40,  unit: "l",     cost: 160,  supplier: "Mercado Central",        sector: "bar",     location: "bar"     },
  { name: "Jugo de Naranja",      category: "Jugos",       stock: 18,  minStock: 6,  maxStock: 36,  unit: "l",     cost: 140,  supplier: "Mercado Central",        sector: "bar",     location: "bar"     },
  { name: "Jugo de Maracuyá",     category: "Jugos",       stock: 12,  minStock: 4,  maxStock: 24,  unit: "l",     cost: 220,  supplier: "Mercado Central",        sector: "bar",     location: "bar"     },
  { name: "Agua con Gas",         category: "Bebidas",     stock: 48,  minStock: 12, maxStock: 96,  unit: "unit",  cost: 120,  supplier: "Distribuidora Bebidas",  sector: "bar",     location: "storage" },
  { name: "Agua Mineral",         category: "Bebidas",     stock: 60,  minStock: 15, maxStock: 120, unit: "unit",  cost: 90,   supplier: "Distribuidora Bebidas",  sector: "bar",     location: "storage" },
  { name: "Hierbabuena",          category: "Garnish",     stock: 30,  minStock: 10, maxStock: 60,  unit: "g",     cost: 15,   supplier: "Mercado Central",        sector: "kitchen", location: "kitchen" },
  { name: "Limones",              category: "Garnish",     stock: 5,   minStock: 5,  maxStock: 20,  unit: "kg",    cost: 280,  supplier: "Mercado Central",        sector: "kitchen", location: "kitchen" },
  { name: "Naranjas",             category: "Garnish",     stock: 8,   minStock: 3,  maxStock: 15,  unit: "kg",    cost: 240,  supplier: "Mercado Central",        sector: "kitchen", location: "kitchen" },
  { name: "Azúcar de Caña",       category: "Ingredientes",stock: 10,  minStock: 3,  maxStock: 20,  unit: "kg",    cost: 180,  supplier: "Mercado Central",        sector: "bar",     location: "bar"     },
  { name: "Miel Natural",         category: "Ingredientes",stock: 8,   minStock: 2,  maxStock: 16,  unit: "kg",    cost: 650,  supplier: "Apicultura Local",       sector: "bar",     location: "bar"     },
  { name: "Bitter Angostura",     category: "Ingredientes",stock: 4,   minStock: 1,  maxStock: 8,   unit: "unit",  cost: 980,  supplier: "Importadora Ibérica",    sector: "bar",     location: "storage" },
  { name: "Hielo en Cubos",       category: "Hielo",       stock: 50,  minStock: 20, maxStock: 100, unit: "kg",    cost: 80,   supplier: "Hielos Premium",         sector: "bar",     location: "bar"     },
  { name: "Jengibre Fresco",      category: "Ingredientes",stock: 3,   minStock: 2,  maxStock: 8,   unit: "kg",    cost: 420,  supplier: "Mercado Central",        sector: "kitchen", location: "kitchen" },
  { name: "Harina 000",           category: "Panadería",   stock: 25,  minStock: 5,  maxStock: 50,  unit: "kg",    cost: 120,  supplier: "Distribuidora Gastro",   sector: "kitchen", location: "kitchen" },
  { name: "Queso Mozzarella",     category: "Lácteos",     stock: 8,   minStock: 3,  maxStock: 15,  unit: "kg",    cost: 980,  supplier: "Lácteos Artesanales",    sector: "kitchen", location: "kitchen" },
  { name: "Tomates Cherry",       category: "Vegetales",   stock: 6,   minStock: 2,  maxStock: 12,  unit: "kg",    cost: 380,  supplier: "Mercado Central",        sector: "kitchen", location: "kitchen" },
  { name: "Chocolate 70%",        category: "Repostería",  stock: 5,   minStock: 2,  maxStock: 10,  unit: "kg",    cost: 1200, supplier: "Distribuidora Gastro",   sector: "kitchen", location: "kitchen" },
];

/* ================================================================
   MENÚ PRINCIPAL
================================================================ */
// El menú se crea después de insertar los productos para tener sus IDs

/* ================================================================
   SEED EXECUTION
================================================================ */

async function clearCollections() {
  console.log("\n🗑️  Limpiando colecciones...");
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    InventoryItem.deleteMany({}),
    Menu.deleteMany({}),
  ]);
  console.log("   ✓ Colecciones limpiadas");
}

async function seedUsers() {
  console.log("\n👥 Insertando usuarios...");
  const inserted = await User.insertMany(users);
  inserted.forEach((u) => console.log(`   ✓ ${u.role.padEnd(12)} ${u.email}`));
  return inserted;
}

async function seedProducts() {
  console.log("\n🍹 Insertando productos...");
  const inserted = await Product.insertMany(products.map((p) => ({
    ...p,
    isActive: true,
    isActiveForPOS: p.isActiveForPOS ?? true,
  })));
  inserted.forEach((p) =>
    console.log(`   ✓ [${p.type.padEnd(5)}] ${p.name}  $${p.price}`)
  );
  return inserted;
}

async function seedInventory() {
  console.log("\n📦 Insertando inventario...");
  const inserted = await InventoryItem.insertMany(inventory.map((i) => ({
    ...i,
    isActive: true,
    description: `${i.name} — stock inicial`,
  })));
  inserted.forEach((i) =>
    console.log(`   ✓ ${i.name.padEnd(22)} ${i.stock} ${i.unit}`)
  );
  return inserted;
}

async function seedMenu(insertedProducts) {
  console.log("\n📋 Creando menú principal...");

  const byCategory = {};
  for (const p of insertedProducts) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p._id);
  }

  const categories = Object.entries(byCategory).map(([name, productIds], idx) => ({
    name,
    description: `Selección de ${name}`,
    order: idx,
    products: productIds.map((id, i) => ({
      product: id,
      price: null, // usar precio del producto
      available: true,
      featured: i === 0,
      order: i,
    })),
  }));

  const menu = await Menu.create({
    name: "Carta Nebula",
    slug: "carta-nebula",
    description: "Nuestra selección completa de cócteles, bebidas y gastronomía de autor",
    type: "mixed",
    drinkStyle: "mixed",
    featured: true,
    isActive: true,
    isActiveForPOS: true,
    categories,
  });

  console.log(`   ✓ Menú "${menu.name}" con ${categories.length} categorías`);
  return menu;
}

/* ── Main ─────────────────────────────────────────────────────── */

try {
  await clearCollections();
  const _users        = await seedUsers();
  const prods         = await seedProducts();
  const _inventory    = await seedInventory();
  const _menu         = await seedMenu(prods);

  console.log("\n✅ SEED COMPLETADO\n");
  console.log("Credenciales de acceso:");
  console.log("  Admin:       admin@nebula.bar        / Admin123!");
  console.log("  Bartender:   bartender@nebula.bar    / Bar123!");
  console.log("  Mesera:      waiter@nebula.bar        / Waiter123!");
  console.log("  Cliente:     cliente@nebula.bar      / Cliente123!");
  console.log("");
} catch (err) {
  console.error("❌ Error en seed:", err);
  process.exit(1);
} finally {
  await mongoose.disconnect();
  console.log("✓ Desconectado de MongoDB\n");
}

/**
 * SEED RULETA — Bartender System
 *
 * Pobla la base de datos con:
 *  - Productos tipo "drink" (tragos completos, incluyendo 5 nuevos)
 *  - Ítems de inventario necesarios para las recetas
 *  - Recetas vinculadas a cada trago con ingredientes e instrucciones
 *  - RouletteDrinks conectados a los productos, con pesos y rarezas
 *
 * Ejecutar: npm run seed:roulette
 * O bien:   node src/seeds/seedRoulette.js
 */

import "dotenv/config";
import mongoose from "mongoose";

import Product       from "../models/Product.js";
import InventoryItem from "../models/InventoryItem.js";
import Recipe        from "../models/Recipe.js";
import RouletteDrink from "../models/RouletteDrink.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("✓ MongoDB conectado\n");

/* ================================================================
   HELPERS
================================================================ */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ================================================================
   PASO 1 — INVENTARIO EXTENDIDO
   Agrega o actualiza ítems necesarios para las recetas.
   Se usa upsert para no duplicar si ya existen.
================================================================ */
const inventoryDefs = [
  // ─── Destilados ──────────────────────────────────────────────
  { name: "Bourbon Artesanal",        category: "Destilados",     unit: "ml",  cost: 0.15, sector: "bar",     location: "storage" },
  { name: "Gin Mare",                  category: "Gin",            unit: "ml",  cost: 0.19, sector: "bar",     location: "storage" },
  { name: "Ron Blanco Superior",       category: "Destilados",     unit: "ml",  cost: 0.09, sector: "bar",     location: "storage" },
  { name: "Tequila Silver",            category: "Destilados",     unit: "ml",  cost: 0.11, sector: "bar",     location: "storage" },
  { name: "Vodka Premium",             category: "Destilados",     unit: "ml",  cost: 0.09, sector: "bar",     location: "storage" },
  { name: "Mezcal Artesanal",          category: "Destilados",     unit: "ml",  cost: 0.21, sector: "bar",     location: "storage" },
  { name: "Whisky Escocés 12 años",    category: "Destilados",     unit: "ml",  cost: 0.32, sector: "bar",     location: "storage" },
  { name: "Cognac VSOP",               category: "Destilados",     unit: "ml",  cost: 0.28, sector: "bar",     location: "storage" },
  { name: "Ron Oscuro Añejo",          category: "Destilados",     unit: "ml",  cost: 0.14, sector: "bar",     location: "storage" },
  { name: "Pisco Peruano",             category: "Destilados",     unit: "ml",  cost: 0.13, sector: "bar",     location: "storage" },
  { name: "Aperol",                    category: "Licores",        unit: "ml",  cost: 0.08, sector: "bar",     location: "storage" },
  // ─── Licores y amargos ───────────────────────────────────────
  { name: "Campari",                   category: "Licores",        unit: "ml",  cost: 0.11, sector: "bar",     location: "storage" },
  { name: "Vermut Rojo",               category: "Licores",        unit: "ml",  cost: 0.07, sector: "bar",     location: "storage" },
  { name: "Vermut Seco Blanco",        category: "Licores",        unit: "ml",  cost: 0.07, sector: "bar",     location: "storage" },
  { name: "Licor de Café",             category: "Licores",        unit: "ml",  cost: 0.09, sector: "bar",     location: "storage" },
  { name: "Triple Sec",                category: "Licores",        unit: "ml",  cost: 0.06, sector: "bar",     location: "storage" },
  { name: "Amaretto",                  category: "Licores",        unit: "ml",  cost: 0.10, sector: "bar",     location: "storage" },
  { name: "Baileys",                   category: "Licores",        unit: "ml",  cost: 0.12, sector: "bar",     location: "storage" },
  { name: "Bitter Angostura",          category: "Amargos",        unit: "ml",  cost: 0.95, sector: "bar",     location: "storage" },
  { name: "Bitter de Naranja",         category: "Amargos",        unit: "ml",  cost: 0.90, sector: "bar",     location: "storage" },
  { name: "Jarabe de Goma",            category: "Jarabes",        unit: "ml",  cost: 0.02, sector: "bar",     location: "bar"     },
  // ─── Jugos y purés ───────────────────────────────────────────
  { name: "Jugo de Lima",              category: "Jugos",          unit: "ml",  cost: 0.03, sector: "bar",     location: "bar"     },
  { name: "Jugo de Limón",             category: "Jugos",          unit: "ml",  cost: 0.03, sector: "bar",     location: "bar"     },
  { name: "Jugo de Maracuyá",          category: "Jugos",          unit: "ml",  cost: 0.05, sector: "bar",     location: "bar"     },
  { name: "Jugo de Naranja",           category: "Jugos",          unit: "ml",  cost: 0.03, sector: "bar",     location: "bar"     },
  { name: "Jugo de Pomelo Rosa",       category: "Jugos",          unit: "ml",  cost: 0.04, sector: "bar",     location: "bar"     },
  { name: "Jugo de Piña",              category: "Jugos",          unit: "ml",  cost: 0.04, sector: "bar",     location: "bar"     },
  { name: "Pulpa de Frutilla",         category: "Purés",          unit: "ml",  cost: 0.06, sector: "bar",     location: "bar"     },
  { name: "Pulpa de Mango",            category: "Purés",          unit: "ml",  cost: 0.06, sector: "bar",     location: "bar"     },
  // ─── Bebidas carbonatadas ─────────────────────────────────────
  { name: "Agua con Gas",              category: "Bebidas",        unit: "ml",  cost: 0.01, sector: "bar",     location: "storage" },
  { name: "Ginger Beer",               category: "Bebidas",        unit: "ml",  cost: 0.02, sector: "bar",     location: "storage" },
  { name: "Agua Tónica Premium",       category: "Bebidas",        unit: "ml",  cost: 0.02, sector: "bar",     location: "storage" },
  { name: "Prosecco / Cava Seco",      category: "Vinos",          unit: "ml",  cost: 0.05, sector: "bar",     location: "storage" },
  { name: "Cerveza Rubia Artesanal",   category: "Cervezas",       unit: "ml",  cost: 0.03, sector: "bar",     location: "storage" },
  // ─── Azúcares y edulcorantes ─────────────────────────────────
  { name: "Azúcar de Caña",            category: "Ingredientes",   unit: "g",   cost: 0.18, sector: "bar",     location: "bar"     },
  { name: "Jarabe de Agave",           category: "Jarabes",        unit: "ml",  cost: 0.04, sector: "bar",     location: "bar"     },
  { name: "Miel Natural",              category: "Ingredientes",   unit: "ml",  cost: 0.65, sector: "bar",     location: "bar"     },
  { name: "Jarabe de Jengibre",        category: "Jarabes",        unit: "ml",  cost: 0.06, sector: "bar",     location: "bar"     },
  { name: "Jarabe de Vainilla",        category: "Jarabes",        unit: "ml",  cost: 0.05, sector: "bar",     location: "bar"     },
  // ─── Lácteos ─────────────────────────────────────────────────
  { name: "Clara de Huevo",            category: "Lácteos",        unit: "ml",  cost: 0.08, sector: "kitchen", location: "kitchen" },
  { name: "Crema de Leche",            category: "Lácteos",        unit: "ml",  cost: 0.06, sector: "kitchen", location: "kitchen" },
  { name: "Leche de Coco",             category: "Lácteos",        unit: "ml",  cost: 0.07, sector: "kitchen", location: "kitchen" },
  // ─── Garnish y aromáticos ─────────────────────────────────────
  { name: "Hierbabuena / Menta",       category: "Garnish",        unit: "g",   cost: 0.02, sector: "kitchen", location: "kitchen" },
  { name: "Limones",                   category: "Garnish",        unit: "g",   cost: 0.01, sector: "kitchen", location: "kitchen" },
  { name: "Naranjas",                  category: "Garnish",        unit: "g",   cost: 0.01, sector: "kitchen", location: "kitchen" },
  { name: "Albahaca Fresca",           category: "Garnish",        unit: "g",   cost: 0.03, sector: "kitchen", location: "kitchen" },
  { name: "Rodaja de Pepino",          category: "Garnish",        unit: "g",   cost: 0.02, sector: "kitchen", location: "kitchen" },
  { name: "Romero Fresco",             category: "Garnish",        unit: "g",   cost: 0.03, sector: "kitchen", location: "kitchen" },
  { name: "Sal en Escamas",            category: "Garnish",        unit: "g",   cost: 0.05, sector: "bar",     location: "bar"     },
  { name: "Sal de Gusano",             category: "Garnish",        unit: "g",   cost: 0.15, sector: "bar",     location: "bar"     },
  // ─── Hielo ───────────────────────────────────────────────────
  { name: "Hielo en Cubos",            category: "Hielo",          unit: "g",   cost: 0.01, sector: "bar",     location: "bar"     },
  { name: "Hielo Granizado",           category: "Hielo",          unit: "g",   cost: 0.01, sector: "bar",     location: "bar"     },
  { name: "Hielo en Bloque / Esfera",  category: "Hielo",          unit: "g",   cost: 0.04, sector: "bar",     location: "bar"     },
  // ─── Espumantes y café ───────────────────────────────────────
  { name: "Espresso Doble",            category: "Café",           unit: "ml",  cost: 0.10, sector: "kitchen", location: "kitchen" },
  { name: "Café Frío Concentrado",     category: "Café",           unit: "ml",  cost: 0.08, sector: "kitchen", location: "kitchen" },
  // ─── Especiales ──────────────────────────────────────────────
  { name: "Polvo de Cacao Amargo",     category: "Especiales",     unit: "g",   cost: 0.20, sector: "kitchen", location: "kitchen" },
  { name: "Extracto de Vainilla",      category: "Especiales",     unit: "ml",  cost: 0.80, sector: "kitchen", location: "kitchen" },
  { name: "Cúrcuma en Polvo",          category: "Especiales",     unit: "g",   cost: 0.30, sector: "kitchen", location: "kitchen" },
  { name: "Agua de Rosas",             category: "Especiales",     unit: "ml",  cost: 1.20, sector: "kitchen", location: "kitchen" },
  { name: "Pimienta Negra",            category: "Especiales",     unit: "g",   cost: 0.25, sector: "kitchen", location: "kitchen" },
  { name: "Sal Kosher",                category: "Ingredientes",   unit: "g",   cost: 0.04, sector: "bar",     location: "bar"     },
];

async function upsertInventory() {
  console.log("📦 Upsert de inventario extendido…");
  const ops = inventoryDefs.map((item) => ({
    updateOne: {
      filter: { name: { $regex: `^${item.name}$`, $options: "i" } },
      update: {
        $setOnInsert: {
          stock:    200,
          minStock: 20,
          maxStock: 2000,
          isActive: true,
          description: `${item.name} — seed roulette`,
          supplier: "Distribuidora General",
        },
        $set: { cost: item.cost, unit: item.unit, category: item.category, sector: item.sector, location: item.location },
      },
      upsert: true,
    },
  }));
  const result = await InventoryItem.bulkWrite(ops);
  console.log(`   ✓ ${result.upsertedCount} nuevos, ${result.modifiedCount} actualizados`);
}

/* ================================================================
   PASO 2 — PRODUCTOS NUEVOS DE BEBIDAS (los que no existen)
================================================================ */
const newDrinkProducts = [
  {
    name:            "Aperol Spritz",
    description:     "Aperol, prosecco seco y soda. El cóctel del verano por excelencia.",
    price:           1700,
    cost:            480,
    category:        "cócteles clásicos",
    type:            "drink",
    drinkStyle:      "classic",
    available:       true,
    featured:        false,
    isActiveForPOS:  true,
    preparationTime: 3,
    image:           "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&q=80",
    tags:            ["aperitivo", "italiano", "fresco"],
    dietaryRestrictions: ["vegan"],
  },
  {
    name:            "Moscow Mule",
    description:     "Vodka premium, ginger beer artesanal y jugo de lima. Frío y vigorizante.",
    price:           1750,
    cost:            520,
    category:        "cócteles clásicos",
    type:            "drink",
    drinkStyle:      "classic",
    available:       true,
    featured:        false,
    isActiveForPOS:  true,
    preparationTime: 4,
    image:           "https://images.unsplash.com/photo-1609951651556-5334e2706168?w=600&q=80",
    tags:            ["vodka", "jengibre", "refrescante"],
    dietaryRestrictions: ["vegan", "gluten-free"],
  },
  {
    name:            "Pisco Sour",
    description:     "Pisco peruano, limón, jarabe de goma y clara de huevo. Un ícono latinoamericano.",
    price:           1900,
    cost:            620,
    category:        "cócteles clásicos",
    type:            "drink",
    drinkStyle:      "classic",
    available:       true,
    featured:        true,
    isActiveForPOS:  true,
    preparationTime: 6,
    image:           "https://images.unsplash.com/photo-1576867757603-05b134ebc379?w=600&q=80",
    tags:            ["pisco", "latinoamericano"],
    dietaryRestrictions: [],
  },
  {
    name:            "Coco Daiquiri",
    description:     "Ron añejo, leche de coco, lima y un toque de vainilla. Tropical y suave.",
    price:           1850,
    cost:            580,
    category:        "firma del bar",
    type:            "drink",
    drinkStyle:      "author",
    available:       true,
    featured:        true,
    isActiveForPOS:  true,
    preparationTime: 6,
    image:           "https://images.unsplash.com/photo-1593642632599-e4cd8a66fc11?w=600&q=80",
    tags:            ["ron", "tropical", "coco"],
    dietaryRestrictions: ["dairy-free"],
  },
  {
    name:            "Frutilla Basil Smash",
    description:     "Gin, frutillas frescas, albahaca, limón y jarabe de agave. Fresco y aromático.",
    price:           2100,
    cost:            680,
    category:        "firma del bar",
    type:            "drink",
    drinkStyle:      "author",
    available:       true,
    featured:        true,
    isActiveForPOS:  true,
    preparationTime: 7,
    image:           "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80",
    tags:            ["gin", "frutal", "autor"],
    dietaryRestrictions: ["vegan"],
  },
  {
    name:            "Amaretto Sour",
    description:     "Amaretto di Saronno, limón exprimido, clara de huevo y espuma sedosa.",
    price:           1950,
    cost:            640,
    category:        "cócteles clásicos",
    type:            "drink",
    drinkStyle:      "classic",
    available:       true,
    featured:        false,
    isActiveForPOS:  true,
    preparationTime: 6,
    image:           "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=600&q=80",
    tags:            ["amaretto", "sour", "espuma"],
    dietaryRestrictions: [],
  },
  {
    name:            "Tequila Sunrise",
    description:     "Tequila silver, jugo de naranja y granadina. Un degradé de colores espectacular.",
    price:           1650,
    cost:            460,
    category:        "cócteles clásicos",
    type:            "drink",
    drinkStyle:      "classic",
    available:       true,
    featured:        false,
    isActiveForPOS:  true,
    preparationTime: 4,
    image:           "https://images.unsplash.com/photo-1519671282429-b44660ead0a7?w=600&q=80",
    tags:            ["tequila", "cítrico", "colorido"],
    dietaryRestrictions: ["vegan"],
  },
  {
    name:            "Mango Chili Margarita",
    description:     "Tequila, puré de mango, lima, triple sec y borde de sal de gusano con chili.",
    price:           2200,
    cost:            720,
    category:        "firma del bar",
    type:            "drink",
    drinkStyle:      "author",
    available:       true,
    featured:        true,
    isActiveForPOS:  true,
    preparationTime: 7,
    image:           "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&q=80",
    tags:            ["tequila", "picante", "tropical"],
    dietaryRestrictions: ["vegan"],
  },
  {
    name:            "Piña Colada",
    description:     "Ron blanco, leche de coco y jugo de piña. Clásico tropical en copa helada.",
    price:           1800,
    cost:            560,
    category:        "cócteles clásicos",
    type:            "drink",
    drinkStyle:      "classic",
    available:       true,
    featured:        false,
    isActiveForPOS:  true,
    preparationTime: 5,
    image:           "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
    tags:            ["ron", "tropical"],
    dietaryRestrictions: ["vegan", "dairy-free"],
  },
  {
    name:            "Cognac Sidecar",
    description:     "Cognac VSOP, triple sec y jugo de limón. Elegancia clásica de los años 20.",
    price:           2800,
    cost:            950,
    category:        "premium",
    type:            "drink",
    drinkStyle:      "classic",
    available:       true,
    featured:        false,
    isActiveForPOS:  true,
    preparationTime: 5,
    image:           "https://images.unsplash.com/photo-1471312432014-9c5f9d71bfbb?w=600&q=80",
    tags:            ["cognac", "premium", "clásico"],
    dietaryRestrictions: ["vegan"],
  },
];

async function upsertProducts() {
  console.log("\n🍹 Upsert de nuevos productos de bebida…");
  const ops = newDrinkProducts.map((p) => ({
    updateOne: {
      filter: { name: p.name.toLowerCase() },
      update: { $setOnInsert: { ...p, name: p.name.toLowerCase(), isActive: true } },
      upsert: true,
    },
  }));
  const result = await Product.bulkWrite(ops);
  console.log(`   ✓ ${result.upsertedCount} nuevos productos, ${result.modifiedCount} actualizados`);
}

/* ================================================================
   PASO 3 — RECETAS vinculadas a cada bebida + inventario
================================================================ */

async function seedRecipes(inventoryMap, productMap) {
  console.log("\n📖 Creando recetas vinculadas…");

  const inv = (name) => {
    const id = inventoryMap.get(name.toLowerCase().trim());
    if (!id) console.warn(`   ⚠️  Inventario no encontrado: "${name}"`);
    return id;
  };

  const recipesDefs = [
    /* ── CLÁSICOS ─────────────────────────────────────────── */
    {
      productName: "old fashioned",
      drinkStyle:  "classic",
      category:    "Cócteles Clásicos",
      method:      "stir",
      ingredients: [
        { name: "Bourbon Artesanal",    qty: 60,  unit: "ml" },
        { name: "Azúcar de Caña",       qty: 5,   unit: "g"  },
        { name: "Bitter Angostura",     qty: 4,   unit: "ml" },
        { name: "Bitter de Naranja",    qty: 2,   unit: "ml" },
        { name: "Hielo en Bloque / Esfera", qty: 150, unit: "g" },
        { name: "Naranjas",             qty: 5,   unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "En un vaso old fashioned, disolver el azúcar con los bitters y un chorrito de agua.", time: 30 },
        { n: 2, ins: "Agregar el bourbon y el hielo en bloque. Mezclar suavemente con cucharilla de bar por 30 segundos.", time: 30 },
        { n: 3, ins: "Expresar el aceite del twist de naranja sobre el vaso, pasar por el borde y usar como garnish.", time: 15 },
      ],
    },
    {
      productName: "mojito premium",
      drinkStyle:  "classic",
      category:    "Cócteles Clásicos",
      method:      "muddle",
      ingredients: [
        { name: "Ron Blanco Superior",  qty: 60,  unit: "ml" },
        { name: "Jugo de Lima",         qty: 30,  unit: "ml" },
        { name: "Azúcar de Caña",       qty: 12,  unit: "g"  },
        { name: "Hierbabuena / Menta",  qty: 10,  unit: "g"  },
        { name: "Agua con Gas",         qty: 90,  unit: "ml" },
        { name: "Hielo Granizado",      qty: 200, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "En el vaso highball, machacar suavemente la hierbabuena con el azúcar y el jugo de lima.", time: 20 },
        { n: 2, ins: "Llenar el vaso con hielo granizado y agregar el ron.", time: 15 },
        { n: 3, ins: "Completar con agua mineral con gas, mezclar con bombilla y decorar con ramita de menta.", time: 15 },
      ],
    },
    {
      productName: "negroni",
      drinkStyle:  "classic",
      category:    "Cócteles Clásicos",
      method:      "stir",
      ingredients: [
        { name: "Gin Mare",             qty: 30,  unit: "ml" },
        { name: "Campari",              qty: 30,  unit: "ml" },
        { name: "Vermut Rojo",          qty: 30,  unit: "ml" },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
        { name: "Naranjas",             qty: 10,  unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Verter Gin, Campari y Vermut rojo en un vaso mezclador con hielo.", time: 10 },
        { n: 2, ins: "Mezclar con cucharilla durante 30 segundos hasta enfriar bien.", time: 30 },
        { n: 3, ins: "Colar en copa rocks con hielo en bloque. Expresar y colocar twist de naranja.", time: 15 },
      ],
    },
    {
      productName: "margarita clásica",
      drinkStyle:  "classic",
      category:    "Cócteles Clásicos",
      method:      "shake",
      ingredients: [
        { name: "Tequila Silver",       qty: 60,  unit: "ml" },
        { name: "Triple Sec",           qty: 30,  unit: "ml" },
        { name: "Jugo de Lima",         qty: 30,  unit: "ml" },
        { name: "Jarabe de Agave",      qty: 15,  unit: "ml" },
        { name: "Sal en Escamas",       qty: 5,   unit: "g"  },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Humedecer el borde de la copa y escarchar con sal en escamas.", time: 20 },
        { n: 2, ins: "En coctelera con hielo, batir tequila, triple sec, jugo de lima y jarabe de agave.", time: 15 },
        { n: 3, ins: "Colar doble en copa de margarita con hielo. Decorar con rodaja de lima.", time: 10 },
      ],
    },
    {
      productName: "espresso martini",
      drinkStyle:  "classic",
      category:    "Cócteles Clásicos",
      method:      "shake",
      ingredients: [
        { name: "Vodka Premium",        qty: 50,  unit: "ml" },
        { name: "Licor de Café",        qty: 25,  unit: "ml" },
        { name: "Espresso Doble",       qty: 30,  unit: "ml" },
        { name: "Jarabe de Vainilla",   qty: 10,  unit: "ml" },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Preparar el espresso y dejar enfriar 2 minutos.", time: 120 },
        { n: 2, ins: "En coctelera con hielo, batir enérgicamente todos los ingredientes.", time: 20 },
        { n: 3, ins: "Colar doble en copa martini fría. Decorar con 3 granos de café.", time: 10 },
      ],
    },
    /* ── FIRMA DEL BAR ───────────────────────────────────── */
    {
      productName: "nebula sour",
      drinkStyle:  "author",
      category:    "Firma del Bar",
      method:      "shake",
      ingredients: [
        { name: "Mezcal Artesanal",     qty: 50,  unit: "ml" },
        { name: "Jugo de Maracuyá",     qty: 30,  unit: "ml" },
        { name: "Jugo de Lima",         qty: 20,  unit: "ml" },
        { name: "Jarabe de Agave",      qty: 15,  unit: "ml" },
        { name: "Clara de Huevo",       qty: 30,  unit: "ml" },
        { name: "Albahaca Fresca",      qty: 5,   unit: "g"  },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Dry shake: batir todos los ingredientes sin hielo para montar la clara.", time: 20 },
        { n: 2, ins: "Agregar hielo y batir con fuerza hasta enfriar bien.", time: 15 },
        { n: 3, ins: "Colar doble en copa sour. La espuma de albahaca se deposita sola encima.", time: 10 },
      ],
    },
    {
      productName: "gold rush",
      drinkStyle:  "author",
      category:    "Firma del Bar",
      method:      "shake",
      ingredients: [
        { name: "Bourbon Artesanal",    qty: 60,  unit: "ml" },
        { name: "Miel Natural",         qty: 22,  unit: "ml" },
        { name: "Jarabe de Jengibre",   qty: 10,  unit: "ml" },
        { name: "Jugo de Limón",        qty: 30,  unit: "ml" },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Disolver la miel en el jarabe de jengibre caliente. Enfriar.", time: 60 },
        { n: 2, ins: "Batir bourbon, miel-jengibre y limón en coctelera con hielo.", time: 15 },
        { n: 3, ins: "Colar sobre hielo en vaso rocks. Decorar con rodaja de jengibre.", time: 10 },
      ],
    },
    {
      productName: "coco daiquiri",
      drinkStyle:  "author",
      category:    "Firma del Bar",
      method:      "blend",
      ingredients: [
        { name: "Ron Oscuro Añejo",     qty: 60,  unit: "ml" },
        { name: "Leche de Coco",        qty: 40,  unit: "ml" },
        { name: "Jugo de Lima",         qty: 25,  unit: "ml" },
        { name: "Jarabe de Vainilla",   qty: 10,  unit: "ml" },
        { name: "Hielo Granizado",      qty: 200, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Mezclar todos los ingredientes en la licuadora con hielo granizado.", time: 20 },
        { n: 2, ins: "Procesar hasta obtener textura cremosa sin trozos de hielo.", time: 15 },
        { n: 3, ins: "Servir en copa de daiquiri. Decorar con viruta de coco tostado y rodaja de lima.", time: 10 },
      ],
    },
    {
      productName: "frutilla basil smash",
      drinkStyle:  "author",
      category:    "Firma del Bar",
      method:      "shake",
      ingredients: [
        { name: "Gin Mare",             qty: 50,  unit: "ml" },
        { name: "Pulpa de Frutilla",    qty: 40,  unit: "ml" },
        { name: "Jugo de Limón",        qty: 25,  unit: "ml" },
        { name: "Jarabe de Agave",      qty: 15,  unit: "ml" },
        { name: "Albahaca Fresca",      qty: 8,   unit: "g"  },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Macerar la albahaca con el jarabe de agave en la coctelera.", time: 20 },
        { n: 2, ins: "Agregar gin, pulpa de frutilla, limón e hielo. Batir vigorosamente.", time: 15 },
        { n: 3, ins: "Doble colar en copa rocks con hielo. Decorar con hoja de albahaca y frutilla.", time: 10 },
      ],
    },
    {
      productName: "mango chili margarita",
      drinkStyle:  "author",
      category:    "Firma del Bar",
      method:      "shake",
      ingredients: [
        { name: "Tequila Silver",       qty: 50,  unit: "ml" },
        { name: "Pulpa de Mango",       qty: 40,  unit: "ml" },
        { name: "Triple Sec",           qty: 20,  unit: "ml" },
        { name: "Jugo de Lima",         qty: 20,  unit: "ml" },
        { name: "Jarabe de Agave",      qty: 10,  unit: "ml" },
        { name: "Sal de Gusano",        qty: 5,   unit: "g"  },
        { name: "Pimienta Negra",       qty: 1,   unit: "g"  },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Escarchar el borde de la copa con mezcla de sal de gusano y chili.", time: 20 },
        { n: 2, ins: "Batir tequila, mango, triple sec, lima y agave en coctelera con hielo.", time: 15 },
        { n: 3, ins: "Colar doble en copa. Terminar con un rally de pimienta negra y slice de mango.", time: 10 },
      ],
    },
    /* ── GIN ──────────────────────────────────────────────── */
    {
      productName: "gin mare en las rocas",
      drinkStyle:  "classic",
      category:    "Gin",
      method:      "build",
      ingredients: [
        { name: "Gin Mare",             qty: 60,  unit: "ml" },
        { name: "Agua Tónica Premium",  qty: 120, unit: "ml" },
        { name: "Hielo en Bloque / Esfera", qty: 180, unit: "g" },
        { name: "Jugo de Pomelo Rosa",  qty: 15,  unit: "ml" },
        { name: "Romero Fresco",        qty: 3,   unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Colocar el hielo en bloque en copa balón fría.", time: 10 },
        { n: 2, ins: "Verter el gin y exprimir un poco de pomelo rosa.", time: 10 },
        { n: 3, ins: "Completar con tónica premium, mezclar suavemente. Colocar ramita de romero flambeado.", time: 20 },
      ],
    },
    /* ── WHISKY ───────────────────────────────────────────── */
    {
      productName: "johnnie walker black",
      drinkStyle:  "classic",
      category:    "Whisky",
      method:      "build",
      ingredients: [
        { name: "Whisky Escocés 12 años", qty: 60, unit: "ml" },
        { name: "Hielo en Bloque / Esfera", qty: 180, unit: "g" },
        { name: "Agua con Gas",           qty: 30,  unit: "ml" },
      ],
      steps: [
        { n: 1, ins: "Enfriar el vaso tumbler con hielo.", time: 30 },
        { n: 2, ins: "Verter el whisky. Servir solo, con agua o hielo según preferencia del cliente.", time: 15 },
        { n: 3, ins: "Opcional: agregar un chorrito de agua con gas para abrir los aromas.", time: 10 },
      ],
    },
    /* ── SIN ALCOHOL ──────────────────────────────────────── */
    {
      productName: "virgin mojito",
      drinkStyle:  "classic",
      category:    "Sin Alcohol",
      method:      "muddle",
      ingredients: [
        { name: "Jugo de Lima",         qty: 30,  unit: "ml" },
        { name: "Azúcar de Caña",       qty: 12,  unit: "g"  },
        { name: "Hierbabuena / Menta",  qty: 10,  unit: "g"  },
        { name: "Agua con Gas",         qty: 150, unit: "ml" },
        { name: "Hielo Granizado",      qty: 200, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Machacar la menta con el azúcar y la lima en el vaso.", time: 20 },
        { n: 2, ins: "Llenar con hielo granizado.", time: 10 },
        { n: 3, ins: "Completar con agua mineral con gas y decorar con ramita de menta.", time: 10 },
      ],
    },
    {
      productName: "limonada de jengibre",
      drinkStyle:  "classic",
      category:    "Sin Alcohol",
      method:      "build",
      ingredients: [
        { name: "Jugo de Limón",        qty: 50,  unit: "ml" },
        { name: "Jarabe de Jengibre",   qty: 25,  unit: "ml" },
        { name: "Agua con Gas",         qty: 150, unit: "ml" },
        { name: "Hierbabuena / Menta",  qty: 5,   unit: "g"  },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Exprimir el limón fresco. Mezclar con el jarabe de jengibre.", time: 15 },
        { n: 2, ins: "Verter sobre vaso highball con hielo.", time: 10 },
        { n: 3, ins: "Completar con agua con gas y hojas de menta. Agitar con bombilla.", time: 10 },
      ],
    },
    /* ── NUEVOS ───────────────────────────────────────────── */
    {
      productName: "aperol spritz",
      drinkStyle:  "classic",
      category:    "Cócteles Clásicos",
      method:      "build",
      ingredients: [
        { name: "Aperol",               qty: 90,  unit: "ml" },
        { name: "Prosecco / Cava Seco", qty: 90,  unit: "ml" },
        { name: "Agua con Gas",         qty: 30,  unit: "ml" },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
        { name: "Naranjas",             qty: 15,  unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Llenar copa balón con abundante hielo.", time: 10 },
        { n: 2, ins: "Verter Aperol, luego el prosecco. Mezclar suavemente.", time: 15 },
        { n: 3, ins: "Un chorrito de soda y decorar con media rodaja de naranja.", time: 10 },
      ],
    },
    {
      productName: "moscow mule",
      drinkStyle:  "classic",
      category:    "Cócteles Clásicos",
      method:      "build",
      ingredients: [
        { name: "Vodka Premium",        qty: 60,  unit: "ml" },
        { name: "Jugo de Lima",         qty: 15,  unit: "ml" },
        { name: "Ginger Beer",          qty: 150, unit: "ml" },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
        { name: "Limones",              qty: 5,   unit: "g"  },
        { name: "Hierbabuena / Menta",  qty: 5,   unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Llenar la jarra de cobre (o vaso) con hielo.", time: 10 },
        { n: 2, ins: "Verter el vodka y el jugo de lima.", time: 10 },
        { n: 3, ins: "Completar con ginger beer. Decorar con rodaja de lima y menta.", time: 10 },
      ],
    },
    {
      productName: "pisco sour",
      drinkStyle:  "classic",
      category:    "Cócteles Clásicos",
      method:      "shake",
      ingredients: [
        { name: "Pisco Peruano",        qty: 75,  unit: "ml" },
        { name: "Jugo de Limón",        qty: 30,  unit: "ml" },
        { name: "Jarabe de Goma",       qty: 20,  unit: "ml" },
        { name: "Clara de Huevo",       qty: 30,  unit: "ml" },
        { name: "Bitter Angostura",     qty: 3,   unit: "ml" },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Dry shake: batir pisco, limón, jarabe y clara sin hielo.", time: 20 },
        { n: 2, ins: "Agregar hielo y volver a batir hasta enfriar muy bien.", time: 15 },
        { n: 3, ins: "Colar doble en copa de pisco sour. Aplicar 3 gotas de Angostura en la espuma.", time: 10 },
      ],
    },
    {
      productName: "amaretto sour",
      drinkStyle:  "classic",
      category:    "Cócteles Clásicos",
      method:      "shake",
      ingredients: [
        { name: "Amaretto",             qty: 60,  unit: "ml" },
        { name: "Bourbon Artesanal",    qty: 15,  unit: "ml" },
        { name: "Jugo de Limón",        qty: 30,  unit: "ml" },
        { name: "Jarabe de Goma",       qty: 15,  unit: "ml" },
        { name: "Clara de Huevo",       qty: 30,  unit: "ml" },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Dry shake enérgico durante 15 segundos para emulsionar la clara.", time: 20 },
        { n: 2, ins: "Agregar hielo y batir hasta enfriar completamente.", time: 15 },
        { n: 3, ins: "Doble colar en copa. La espuma densa es la firma del trago.", time: 10 },
      ],
    },
    {
      productName: "tequila sunrise",
      drinkStyle:  "classic",
      category:    "Cócteles Clásicos",
      method:      "build",
      ingredients: [
        { name: "Tequila Silver",       qty: 50,  unit: "ml" },
        { name: "Jugo de Naranja",      qty: 120, unit: "ml" },
        { name: "Jarabe de Agave",      qty: 15,  unit: "ml" },
        { name: "Jugo de Lima",         qty: 5,   unit: "ml" },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
        { name: "Naranjas",             qty: 10,  unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Llenar vaso highball con hielo. Agregar el tequila y el jugo de naranja.", time: 15 },
        { n: 2, ins: "Sin mezclar, verter el jarabe de agave muy suavemente por el borde.", time: 15 },
        { n: 3, ins: "El efecto degradé se forma solo. Decorar con rodaja de naranja y cherry.", time: 10 },
      ],
    },
    {
      productName: "piña colada",
      drinkStyle:  "classic",
      category:    "Cócteles Clásicos",
      method:      "blend",
      ingredients: [
        { name: "Ron Blanco Superior",  qty: 60,  unit: "ml" },
        { name: "Leche de Coco",        qty: 50,  unit: "ml" },
        { name: "Jugo de Piña",         qty: 90,  unit: "ml" },
        { name: "Hielo Granizado",      qty: 200, unit: "g"  },
        { name: "Jugo de Lima",         qty: 10,  unit: "ml" },
      ],
      steps: [
        { n: 1, ins: "Mezclar ron, leche de coco, jugo de piña y lima en la licuadora.", time: 10 },
        { n: 2, ins: "Agregar hielo granizado y procesar hasta obtener textura suave.", time: 20 },
        { n: 3, ins: "Servir en copa huracán con pajilla. Decorar con rodaja de piña y coco rallado.", time: 10 },
      ],
    },
    {
      productName: "cognac sidecar",
      drinkStyle:  "classic",
      category:    "Premium",
      method:      "shake",
      ingredients: [
        { name: "Cognac VSOP",          qty: 50,  unit: "ml" },
        { name: "Triple Sec",           qty: 25,  unit: "ml" },
        { name: "Jugo de Limón",        qty: 25,  unit: "ml" },
        { name: "Jarabe de Goma",       qty: 5,   unit: "ml" },
        { name: "Azúcar de Caña",       qty: 5,   unit: "g"  },
        { name: "Hielo en Cubos",       qty: 150, unit: "g"  },
      ],
      steps: [
        { n: 1, ins: "Escarchar el borde de la copa con azúcar.", time: 15 },
        { n: 2, ins: "Batir cognac, triple sec, limón y jarabe en coctelera con hielo.", time: 15 },
        { n: 3, ins: "Colar doble en copa cocktail fría. Expresar twist de limón y soltar.", time: 10 },
      ],
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const def of recipesDefs) {
    const product = productMap.get(def.productName.toLowerCase().trim());
    if (!product) {
      console.warn(`   ⚠️  Producto no encontrado para receta: "${def.productName}"`);
      skipped++;
      continue;
    }

    // Verificar si ya existe receta para este producto
    const existing = await Recipe.findOne({ product: product._id });
    if (existing) {
      skipped++;
      continue;
    }

    // Construir ingredientes
    const ingredients = [];
    for (let i = 0; i < def.ingredients.length; i++) {
      const ing = def.ingredients[i];
      const itemId = inv(ing.name);
      if (!itemId) continue;
      ingredients.push({
        inventoryItem: itemId,
        quantity:      ing.qty,
        unit:          ing.unit,
        order:         i,
      });
    }

    if (!ingredients.length) {
      console.warn(`   ⚠️  Sin ingredientes válidos para "${def.productName}"`);
      skipped++;
      continue;
    }

    // Construir pasos
    const steps = def.steps.map((s) => ({
      stepNumber:  s.n,
      instruction: s.ins,
      time:        s.time,
      temperature: "",
    }));

    try {
      const recipe = await Recipe.create({
        product:    product._id,
        type:       "drink",
        drinkStyle: def.drinkStyle,
        category:   def.category,
        method:     def.method,
        ingredients,
        steps,
        isPrimary:  true,
        variantName: "",
      });

      // Vincular receta al producto
      await Product.findByIdAndUpdate(product._id, {
        recipeId:  recipe._id,
        hasRecipe: true,
      });

      created++;
    } catch (err) {
      console.warn(`   ⚠️  Error creando receta "${def.productName}": ${err.message}`);
      skipped++;
    }
  }

  console.log(`   ✓ ${created} recetas creadas, ${skipped} omitidas`);
}

/* ================================================================
   PASO 4 — ROULETTE DRINKS vinculados a productos
   Colores y rarezas pensados según la narrativa del bar:
   - LEGENDARY: tragos exclusivos de autor o premium muy raros
   - EPIC: firma del bar y clásicos premium
   - RARE: tragos clásicos de calidad media-alta
   - COMMON: opciones estándar y sin alcohol
================================================================ */

const rouletteDefs = [
  // ─── COMMON ─────────────────────────────────────────────────
  { name: "mojito premium",         rarity: "COMMON",    weight: 80, color: "#34D399", category: "clasico"      },
  { name: "margarita clásica",      rarity: "COMMON",    weight: 75, color: "#F59E0B", category: "clasico"      },
  { name: "tequila sunrise",        rarity: "COMMON",    weight: 70, color: "#F97316", category: "clasico"      },
  { name: "aperol spritz",          rarity: "COMMON",    weight: 70, color: "#EF4444", category: "clasico"      },
  { name: "piña colada",            rarity: "COMMON",    weight: 65, color: "#FDE68A", category: "clasico"      },
  { name: "virgin mojito",          rarity: "COMMON",    weight: 55, color: "#86EFAC", category: "sin alcohol"  },
  { name: "limonada de jengibre",   rarity: "COMMON",    weight: 50, color: "#FEF08A", category: "sin alcohol"  },
  { name: "moscow mule",            rarity: "COMMON",    weight: 65, color: "#6EE7B7", category: "clasico"      },
  // ─── RARE ────────────────────────────────────────────────────
  { name: "espresso martini",       rarity: "RARE",      weight: 45, color: "#78350F", category: "clasico"      },
  { name: "pisco sour",             rarity: "RARE",      weight: 42, color: "#FCD34D", category: "clasico"      },
  { name: "amaretto sour",          rarity: "RARE",      weight: 40, color: "#C084FC", category: "clasico"      },
  { name: "negroni",                rarity: "RARE",      weight: 38, color: "#B91C1C", category: "clasico"      },
  { name: "old fashioned",          rarity: "RARE",      weight: 35, color: "#92400E", category: "clasico"      },
  { name: "gin mare en las rocas",  rarity: "RARE",      weight: 32, color: "#0EA5E9", category: "premium"      },
  // ─── EPIC ────────────────────────────────────────────────────
  { name: "gold rush",              rarity: "EPIC",      weight: 20, color: "#D97706", category: "autor"        },
  { name: "nebula sour",            rarity: "EPIC",      weight: 18, color: "#7C3AED", category: "autor"        },
  { name: "frutilla basil smash",   rarity: "EPIC",      weight: 16, color: "#EC4899", category: "autor"        },
  { name: "mango chili margarita",  rarity: "EPIC",      weight: 14, color: "#DC2626", category: "autor"        },
  { name: "coco daiquiri",          rarity: "EPIC",      weight: 15, color: "#0891B2", category: "autor"        },
  // ─── LEGENDARY ───────────────────────────────────────────────
  { name: "cognac sidecar",         rarity: "LEGENDARY", weight: 4,  color: "#D4AF37", category: "premium"      },
  { name: "johnnie walker black",   rarity: "LEGENDARY", weight: 3,  color: "#F5F5DC", category: "premium"      },
];

async function seedRouletteDrinks(productMap) {
  console.log("\n🎰 Creando/actualizando RouletteDrinks…");

  let created = 0;
  let updated = 0;
  let notFound = 0;

  for (const def of rouletteDefs) {
    const product = productMap.get(def.name.toLowerCase().trim());

    // Buscar si ya existe (por nombre, ignorando deleted)
    const existing = await RouletteDrink.collection.findOne({
      name: def.name.toLowerCase().trim(),
    });

    if (existing) {
      await RouletteDrink.findByIdAndUpdate(existing._id, {
        $set: {
          weight:   def.weight,
          rarity:   def.rarity,
          color:    def.color,
          category: def.category,
          active:   true,
          deleted:  false,
          product:  product?._id ?? existing.product ?? null,
        },
      });
      updated++;
      continue;
    }

    if (!product) {
      console.warn(`   ⚠️  Producto no encontrado para roulette drink: "${def.name}"`);
      notFound++;
    }

    await RouletteDrink.create({
      name:     def.name.toLowerCase().trim(),
      weight:   def.weight,
      rarity:   def.rarity,
      color:    def.color,
      category: def.category,
      active:   true,
      product:  product?._id ?? null,
      price:    product?.price ?? null,
    });
    created++;
  }

  console.log(`   ✓ ${created} creados, ${updated} actualizados, ${notFound} sin producto`);
}

/* ================================================================
   EJECUCIÓN PRINCIPAL
================================================================ */
try {
  // 1. Inventario
  await upsertInventory();

  // 2. Nuevos productos
  await upsertProducts();

  // 3. Mapas de referencia para IDs
  const allInventory = await InventoryItem.find({}).select("name _id").lean();
  const inventoryMap = new Map(allInventory.map((i) => [i.name.toLowerCase().trim(), i._id]));

  const allProducts = await Product.find({ type: "drink" }).select("name _id price").lean();
  const productMap  = new Map(allProducts.map((p) => [p.name.toLowerCase().trim(), p]));

  // 4. Recetas
  await seedRecipes(inventoryMap, productMap);

  // 5. Roulette drinks
  await seedRouletteDrinks(productMap);

  console.log("\n✅ SEED RULETA COMPLETADO");
  console.log("   21 RouletteDrinks: 8 COMMON | 6 RARE | 5 EPIC | 2 LEGENDARY");
  console.log("   21 bebidas con recetas + ingredientes de inventario\n");
} catch (err) {
  console.error("\n❌ Error en seed:", err.message);
  console.error(err.stack);
  process.exit(1);
} finally {
  await mongoose.disconnect();
  console.log("✓ Desconectado\n");
}

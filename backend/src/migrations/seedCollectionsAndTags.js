import Collection from "../models/Collection.js";
import Tag from "../models/Tag.js";

/* =========================
   SEED COLLECTIONS
========================= */
const collectionsData = [
  {
    name: "Clásicos",
    description: "Cócteles clásicos y tradicionales",
    icon: "🍸",
    color: "#6366f1",
    tags: ["classic", "traditional"],
    recipeCount: 0,
    isSystem: true,
  },
  {
    name: "Autor",
    description: "Creaciones originales del bar",
    icon: "✨",
    color: "#8b5cf6",
    tags: ["author", "creative"],
    recipeCount: 0,
    isSystem: true,
  },
  {
    name: "Mocktails",
    description: "Bebidas sin alcohol",
    icon: "🥤",
    color: "#10b981",
    tags: ["non-alcoholic", "refreshing"],
    recipeCount: 0,
    isSystem: true,
  },
  {
    name: "Tropical",
    description: "Cócteles tropicales y refrescantes",
    icon: "🍹",
    color: "#f59e0b",
    tags: ["tropical", "fruity"],
    recipeCount: 0,
    isSystem: true,
  },
  {
    name: "Whisky",
    description: "Cócteles base whisky",
    icon: "🥃",
    color: "#78350f",
    tags: ["whisky", "spirit"],
    recipeCount: 0,
    isSystem: true,
  },
];

/* =========================
   SEED TAGS
========================= */
const tagsData = [
  {
    name: "Clásico",
    category: "style",
    color: "#6366f1",
  },
  {
    name: "Premium",
    category: "premium",
    color: "#f59e0b",
  },
  {
    name: "Verano",
    category: "season",
    color: "#10b981",
  },
  {
    name: "Invierno",
    category: "season",
    color: "#3b82f6",
  },
  {
    name: "Rápido",
    category: "speed",
    color: "#22c55e",
  },
  {
    name: "Elaborado",
    category: "speed",
    color: "#ef4444",
  },
  {
    name: "Popular",
    category: "popularity",
    color: "#f59e0b",
  },
  {
    name: "Alto Margen",
    category: "margin",
    color: "#10b981",
  },
  {
    name: "Bajo Stock",
    category: "stock",
    color: "#ef4444",
  },
  {
    name: "Firma",
    category: "author",
    color: "#8b5cf6",
  },
];

/* =========================
   SEED FUNCTION
========================= */
export const seedCollectionsAndTags = async () => {
  try {
    console.log("[Seed] Starting collections and tags seed...");

    // Check if collections already exist
    const existingCollections = await Collection.countDocuments();
    if (existingCollections === 0) {
      await Collection.insertMany(collectionsData);
      console.log(`[Seed] ✅ Created ${collectionsData.length} collections`);
    } else {
      console.log(`[Seed] ℹ️  Collections already exist (${existingCollections} found)`);
    }

    // Check if tags already exist
    const existingTags = await Tag.countDocuments();
    if (existingTags === 0) {
      await Tag.insertMany(tagsData);
      console.log(`[Seed] ✅ Created ${tagsData.length} tags`);
    } else {
      console.log(`[Seed] ℹ️  Tags already exist (${existingTags} found)`);
    }

    console.log("[Seed] Collections and tags seed completed");
  } catch (error) {
    console.error("[Seed] Error seeding collections and tags:", error);
    throw error;
  }
};

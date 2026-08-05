import Technique from "../models/Technique.js";
import Decoration from "../models/Decoration.js";

/* =========================
   SEED TECHNIQUES
========================= */
const techniquesData = [
  {
    name: "Shake",
    description: "Agitar en shaker con hielo",
    category: "shake",
    icon: "🥤",
    instructions: "Colocar ingredientes en shaker con hielo, agitar vigorosamente por 10-15 segundos, colar.",
    equipment: ["Shaker", "Hielo", "Colador"],
    difficulty: "easy",
    time: 30,
  },
  {
    name: "Stir",
    description: "Revolver en vaso con hielo",
    category: "stir",
    icon: "🥄",
    instructions: "Colocar ingredientes en vaso con hielo, revolver suavemente con cuchara de bar.",
    equipment: ["Vaso", "Hielo", "Cuchara de bar"],
    difficulty: "easy",
    time: 20,
  },
  {
    name: "Build",
    description: "Construir directamente en vaso",
    category: "build",
    icon: "🏗️",
    instructions: "Verter ingredientes directamente en vaso, mezclar suavemente.",
    equipment: ["Vaso"],
    difficulty: "easy",
    time: 15,
  },
  {
    name: "Blend",
    description: "Licuar con hielo",
    category: "blend",
    icon: "🌀",
    instructions: "Colocar ingredientes en licuadora con hielo, licuar hasta obtener consistencia suave.",
    equipment: ["Licuadora", "Hielo"],
    difficulty: "medium",
    time: 45,
  },
  {
    name: "Smoke",
    description: "Ahumar con madera o hierbas",
    category: "smoke",
    icon: "💨",
    instructions: "Ahumar el vaso con madera o hierbas antes de verter el cóctel.",
    equipment: ["Pistola de humo", "Madera", "Hierbas"],
    difficulty: "hard",
    time: 60,
  },
  {
    name: "Layer",
    description: "Capas de diferentes densidades",
    category: "layer",
    icon: "📚",
    instructions: "Verter ingredientes lentamente sobre cuchara para crear capas de diferentes densidades.",
    equipment: ["Vaso", "Cuchara de bar"],
    difficulty: "hard",
    time: 90,
  },
  {
    name: "Roll",
    description: "Roll entre dos vasos",
    category: "roll",
    icon: "🔄",
    instructions: "Verter entre dos vasos para mezclar sin diluir demasiado.",
    equipment: ["Dos vasos"],
    difficulty: "medium",
    time: 25,
  },
  {
    name: "Muddle",
    description: "Macerar ingredientes",
    category: "muddle",
    icon: "🔨",
    instructions: "Aplastar ingredientes (frutas, hierbas) con muddler para extraer sabores.",
    equipment: ["Muddler", "Vaso"],
    difficulty: "easy",
    time: 20,
  },
  {
    name: "Strain",
    description: "Colar para separar hielo",
    category: "strain",
    icon: "🚿",
    instructions: "Colar cóctel para separar hielo y ingredientes sólidos.",
    equipment: ["Colador"],
    difficulty: "easy",
    time: 10,
  },
];

/* =========================
   SEED DECORATIONS
========================= */
const decorationsData = [
  {
    name: "Twist de Limón",
    type: "garnish",
    description: "Cáscara de limón en espiral",
    icon: "🍋",
    category: "cítricos",
    cost: 0.05,
  },
  {
    name: "Rodaja de Naranja",
    type: "garnish",
    description: "Rodaja de naranja fresca",
    icon: "🍊",
    category: "frutas",
    cost: 0.08,
  },
  {
    name: "Cereza",
    type: "garnish",
    description: "Cereza marrasquino",
    icon: "🍒",
    category: "frutas",
    cost: 0.10,
  },
  {
    name: "Rama de Menta",
    type: "garnish",
    description: "Hojas de menta fresca",
    icon: "🌿",
    category: "hierbas",
    cost: 0.03,
  },
  {
    name: "Copa Martini",
    type: "glassware",
    description: "Copa triangular clásica",
    icon: "🍸",
    category: "cristalería",
    cost: 0,
  },
  {
    name: "Vaso Old Fashioned",
    type: "glassware",
    description: "Vaso corto y ancho",
    icon: "🥃",
    category: "cristalería",
    cost: 0,
  },
  {
    name: "Vaso Highball",
    type: "glassware",
    description: "Vaso alto y estrecho",
    icon: "🥤",
    category: "cristalería",
    cost: 0,
  },
  {
    name: "Hielo Picado",
    type: "ice",
    description: "Hielo en trozos pequeños",
    icon: "🧊",
    category: "hielo",
    cost: 0.02,
  },
  {
    name: "Cubo Grande",
    type: "ice",
    description: "Cubo de hielo grande",
    icon: "🧊",
    category: "hielo",
    cost: 0.03,
  },
  {
    name: "Pistola de Humo",
    type: "aroma",
    description: "Aroma ahumado",
    icon: "💨",
    category: "aroma",
    cost: 0,
  },
];

/* =========================
   SEED FUNCTION
========================= */
export const seedTechniquesAndDecorations = async () => {
  try {
    console.log("[Seed] Starting techniques and decorations seed...");

    // Check if techniques already exist
    const existingTechniques = await Technique.countDocuments();
    if (existingTechniques === 0) {
      await Technique.insertMany(techniquesData);
      console.log(`[Seed] ✅ Created ${techniquesData.length} techniques`);
    } else {
      console.log(`[Seed] ℹ️  Techniques already exist (${existingTechniques} found)`);
    }

    // Check if decorations already exist
    const existingDecorations = await Decoration.countDocuments();
    if (existingDecorations === 0) {
      await Decoration.insertMany(decorationsData);
      console.log(`[Seed] ✅ Created ${decorationsData.length} decorations`);
    } else {
      console.log(`[Seed] ℹ️  Decorations already exist (${existingDecorations} found)`);
    }

    console.log("[Seed] Techniques and decorations seed completed");
  } catch (error) {
    console.error("[Seed] Error seeding techniques and decorations:", error);
    throw error;
  }
};

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import InventoryItem from "../models/InventoryItem.js";

const seedInventory = async () => {
  try {
    console.log("[Seed] Connecting to database...");
    await connectDB();
    
    // Check if inventory items already exist
    const existingItems = await InventoryItem.countDocuments();
    if (existingItems > 0) {
      console.log(`[Seed] ℹ️  Inventory items already exist (${existingItems} found)`);
      process.exit(0);
    }
    
    // Create basic inventory items
    const inventoryData = [
      {
        name: "Hielo",
        description: "Hielo para cócteles",
        category: "hielo",
        unit: "unit",
        stock: 100,
        minStock: 20,
        maxStock: 200,
        cost: 0.02,
        sector: "bar",
        location: "bar",
        isActive: true,
      },
      {
        name: "Ron Blanco",
        description: "Ron blanco para cócteles",
        category: "alcohol",
        unit: "ml",
        stock: 50,
        minStock: 10,
        maxStock: 100,
        cost: 0.15,
        sector: "bar",
        location: "bar",
        isActive: true,
      },
      {
        name: "Vodka",
        description: "Vodka estándar",
        category: "alcohol",
        unit: "ml",
        stock: 50,
        minStock: 10,
        maxStock: 100,
        cost: 0.18,
        sector: "bar",
        location: "bar",
        isActive: true,
      },
      {
        name: "Gin",
        description: "Gin para cócteles",
        category: "alcohol",
        unit: "ml",
        stock: 40,
        minStock: 10,
        maxStock: 80,
        cost: 0.20,
        sector: "bar",
        location: "bar",
        isActive: true,
      },
      {
        name: "Jugo de Limón",
        description: "Jugo de limón fresco",
        category: "mixers",
        unit: "ml",
        stock: 30,
        minStock: 10,
        maxStock: 60,
        cost: 0.05,
        sector: "bar",
        location: "bar",
        isActive: true,
      },
      {
        name: "Jugo de Naranja",
        description: "Jugo de naranja fresco",
        category: "mixers",
        unit: "ml",
        stock: 30,
        minStock: 10,
        maxStock: 60,
        cost: 0.04,
        sector: "bar",
        location: "bar",
        isActive: true,
      },
      {
        name: "Azúcar",
        description: "Azúcar para jarabe",
        category: "mixers",
        unit: "g",
        stock: 100,
        minStock: 20,
        maxStock: 200,
        cost: 0.01,
        sector: "bar",
        location: "storage",
        isActive: true,
      },
      {
        name: "Soda",
        description: "Agua con gas",
        category: "mixers",
        unit: "ml",
        stock: 50,
        minStock: 15,
        maxStock: 100,
        cost: 0.03,
        sector: "bar",
        location: "bar",
        isActive: true,
      },
      {
        name: "Tónica",
        description: "Agua tónica",
        category: "mixers",
        unit: "ml",
        stock: 40,
        minStock: 10,
        maxStock: 80,
        cost: 0.08,
        sector: "bar",
        location: "bar",
        isActive: true,
      },
      {
        name: "Menta",
        description: "Hojas de menta fresca",
        category: "garnish",
        unit: "portion",
        stock: 20,
        minStock: 5,
        maxStock: 40,
        cost: 0.10,
        sector: "bar",
        location: "bar",
        isActive: true,
      },
    ];
    
    await InventoryItem.insertMany(inventoryData);
    console.log(`[Seed] ✅ Created ${inventoryData.length} inventory items`);
    
    process.exit(0);
  } catch (error) {
    console.error("[Seed] ❌ Error creating inventory items:", error);
    process.exit(1);
  }
};

seedInventory();

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Recipe from "../models/Recipe.js";
import Product from "../models/Product.js";
import Decoration from "../models/Decoration.js";
import Technique from "../models/Technique.js";
import Collection from "../models/Collection.js";
import Tag from "../models/Tag.js";
import InventoryItem from "../models/InventoryItem.js";

const debugRecipePopulate = async () => {
  try {
    console.log("[Debug] Connecting to database...");
    await connectDB();
    
    // Get all drink products
    const products = await Product.find({ type: "drink" }).sort({ name: 1 }).lean();
    console.log(`[Debug] Found ${products.length} drink products`);
    
    const productIds = products.map(p => p._id);
    
    // Get all recipes for these products
    const recipes = await Recipe.find({ product: { $in: productIds } }).sort({ isPrimary: -1, createdAt: -1 }).lean();
    console.log(`[Debug] Found ${recipes.length} recipes for drink products`);
    
    // Check each recipe for invalid references
    for (const recipe of recipes) {
      console.log(`\n[Debug] Recipe: ${recipe._id}`);
      console.log(`[Debug]   Product ID: ${recipe.product} (valid: ${mongoose.Types.ObjectId.isValid(recipe.product)})`);
      
      // Check ingredients
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        for (const ingredient of recipe.ingredients) {
          const invItemId = ingredient.inventoryItem;
          if (invItemId) {
            const isValid = mongoose.Types.ObjectId.isValid(invItemId);
            console.log(`[Debug]   Ingredient inventoryItem: ${invItemId} (valid: ${isValid})`);
            if (!isValid) {
              console.log(`[Debug]   ❌ INVALID inventoryItem ID found: ${invItemId}`);
            }
          }
        }
      }
      
      // Check specifications.ice
      if (recipe.specifications?.ice) {
        const iceId = recipe.specifications.ice;
        const isValid = mongoose.Types.ObjectId.isValid(iceId);
        console.log(`[Debug]   Ice ID: ${iceId} (valid: ${isValid})`);
        if (!isValid) {
          console.log(`[Debug]   ❌ INVALID ice ID found: ${iceId}`);
        }
      }
      
      // Check specifications.glassware
      if (recipe.specifications?.glassware) {
        const glasswareId = recipe.specifications.glassware;
        const isValid = mongoose.Types.ObjectId.isValid(glasswareId);
        console.log(`[Debug]   Glassware ID: ${glasswareId} (valid: ${isValid})`);
        if (!isValid) {
          console.log(`[Debug]   ❌ INVALID glassware ID found: ${glasswareId}`);
        }
      }
      
      // Check specifications.decorations
      if (recipe.specifications?.decorations && Array.isArray(recipe.specifications.decorations)) {
        for (const decId of recipe.specifications.decorations) {
          const isValid = mongoose.Types.ObjectId.isValid(decId);
          console.log(`[Debug]   Decoration ID: ${decId} (valid: ${isValid})`);
          if (!isValid) {
            console.log(`[Debug]   ❌ INVALID decoration ID found: ${decId}`);
          }
        }
      }
      
      // Check technique
      if (recipe.technique) {
        const techId = recipe.technique;
        const isValid = mongoose.Types.ObjectId.isValid(techId);
        console.log(`[Debug]   Technique ID: ${techId} (valid: ${isValid})`);
        if (!isValid) {
          console.log(`[Debug]   ❌ INVALID technique ID found: ${techId}`);
        }
      }
      
      // Check steps.technique
      if (recipe.steps && Array.isArray(recipe.steps)) {
        for (const step of recipe.steps) {
          if (step.technique) {
            const techId = step.technique;
            const isValid = mongoose.Types.ObjectId.isValid(techId);
            console.log(`[Debug]   Step technique ID: ${techId} (valid: ${isValid})`);
            if (!isValid) {
              console.log(`[Debug]   ❌ INVALID step technique ID found: ${techId}`);
            }
          }
        }
      }
    }
    
    console.log("\n[Debug] ✅ Debug complete");
    
    process.exit(0);
  } catch (error) {
    console.error("[Debug] ❌ Error:", error);
    process.exit(1);
  }
};

debugRecipePopulate();

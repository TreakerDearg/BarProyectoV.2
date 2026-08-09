import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Recipe from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import Product from "../models/Product.js";
import Technique from "../models/Technique.js";
import Decoration from "../models/Decoration.js";
import Collection from "../models/Collection.js";
import Tag from "../models/Tag.js";

const fixInvalidRecipeIngredients = async () => {
  try {
    console.log("[Fix] Connecting to database...");
    await connectDB();
    
    // Find all recipes
    const recipes = await Recipe.find({});
    console.log(`[Fix] Found ${recipes.length} recipes`);
    
    let fixedCount = 0;
    let invalidIds = new Set();
    
    for (const recipe of recipes) {
      let hasInvalidIngredients = false;
      
      for (const ingredient of recipe.ingredients || []) {
        const inventoryItemId = ingredient.inventoryItem;
        
        // Check if inventoryItem ID is not a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(inventoryItemId)) {
          hasInvalidIngredients = true;
          invalidIds.add(inventoryItemId);
          console.log(`[Fix] Invalid inventoryItem ID found: ${inventoryItemId} in recipe ${recipe._id}`);
          
          // Try to find a matching inventory item by name
          const inventoryItem = await InventoryItem.findOne({ name: inventoryItemId });
          if (inventoryItem) {
            ingredient.inventoryItem = inventoryItem._id;
            console.log(`[Fix] Replaced ${inventoryItemId} with ${inventoryItem._id}`);
          } else {
            // Remove the ingredient if no match found
            recipe.ingredients = recipe.ingredients.filter(i => i.inventoryItem !== inventoryItemId);
            console.log(`[Fix] Removed ingredient with invalid ID: ${inventoryItemId}`);
          }
        }
      }
      
      if (hasInvalidIngredients) {
        await recipe.save();
        fixedCount++;
      }
    }
    
    console.log(`[Fix] ✅ Fixed ${fixedCount} recipes`);
    console.log(`[Fix] Invalid IDs found: ${Array.from(invalidIds).join(', ')}`);
    
    process.exit(0);
  } catch (error) {
    console.error("[Fix] ❌ Error fixing recipe ingredients:", error);
    process.exit(1);
  }
};

fixInvalidRecipeIngredients();

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Recipe from "../models/Recipe.js";
import Decoration from "../models/Decoration.js";
import Product from "../models/Product.js";
import Technique from "../models/Technique.js";
import Collection from "../models/Collection.js";
import Tag from "../models/Tag.js";
import InventoryItem from "../models/InventoryItem.js";

const fixInvalidRecipeSpecs = async () => {
  try {
    console.log("[Fix] Connecting to database...");
    await connectDB();
    
    // Find all recipes
    const recipes = await Recipe.find({});
    console.log(`[Fix] Found ${recipes.length} recipes`);
    
    let fixedCount = 0;
    let invalidIds = new Set();
    
    for (const recipe of recipes) {
      let hasInvalidSpecs = false;
      
      // Check specifications.ice
      if (recipe.specifications?.ice) {
        const iceId = recipe.specifications.ice;
        if (typeof iceId === 'string' && !mongoose.Types.ObjectId.isValid(iceId)) {
          hasInvalidSpecs = true;
          invalidIds.add(iceId);
          console.log(`[Fix] Invalid ice ID found: ${iceId} in recipe ${recipe._id}`);
          
          // Try to find a matching decoration by name
          const decoration = await Decoration.findOne({ name: iceId });
          if (decoration) {
            recipe.specifications.ice = decoration._id;
            console.log(`[Fix] Replaced ${iceId} with ${decoration._id}`);
          } else {
            // Remove the invalid reference
            recipe.specifications.ice = null;
            console.log(`[Fix] Removed invalid ice reference: ${iceId}`);
          }
        }
      }
      
      // Check specifications.glassware
      if (recipe.specifications?.glassware) {
        const glasswareId = recipe.specifications.glassware;
        if (typeof glasswareId === 'string' && !mongoose.Types.ObjectId.isValid(glasswareId)) {
          hasInvalidSpecs = true;
          invalidIds.add(glasswareId);
          console.log(`[Fix] Invalid glassware ID found: ${glasswareId} in recipe ${recipe._id}`);
          
          // Try to find a matching decoration by name
          const decoration = await Decoration.findOne({ name: glasswareId });
          if (decoration) {
            recipe.specifications.glassware = decoration._id;
            console.log(`[Fix] Replaced ${glasswareId} with ${decoration._id}`);
          } else {
            // Remove the invalid reference
            recipe.specifications.glassware = null;
            console.log(`[Fix] Removed invalid glassware reference: ${glasswareId}`);
          }
        }
      }
      
      // Check specifications.decorations array
      if (recipe.specifications?.decorations?.length > 0) {
        for (let i = 0; i < recipe.specifications.decorations.length; i++) {
          const decId = recipe.specifications.decorations[i];
          if (typeof decId === 'string' && !mongoose.Types.ObjectId.isValid(decId)) {
            hasInvalidSpecs = true;
            invalidIds.add(decId);
            console.log(`[Fix] Invalid decoration ID found: ${decId} in recipe ${recipe._id}`);
            
            // Try to find a matching decoration by name
            const decoration = await Decoration.findOne({ name: decId });
            if (decoration) {
              recipe.specifications.decorations[i] = decoration._id;
              console.log(`[Fix] Replaced ${decId} with ${decoration._id}`);
            } else {
              // Remove the invalid reference
              recipe.specifications.decorations.splice(i, 1);
              i--;
              console.log(`[Fix] Removed invalid decoration reference: ${decId}`);
            }
          }
        }
      }
      
      if (hasInvalidSpecs) {
        await recipe.save();
        fixedCount++;
      }
    }
    
    console.log(`[Fix] ✅ Fixed ${fixedCount} recipes`);
    console.log(`[Fix] Invalid IDs found: ${Array.from(invalidIds).join(', ')}`);
    
    process.exit(0);
  } catch (error) {
    console.error("[Fix] ❌ Error fixing recipe specs:", error);
    process.exit(1);
  }
};

fixInvalidRecipeSpecs();

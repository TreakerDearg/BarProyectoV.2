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

const findAndFixStandardIce = async () => {
  try {
    console.log("[Fix] Connecting to database...");
    await connectDB();
    
    // Find all recipes WITHOUT using populate (to avoid the cast error)
    const recipes = await Recipe.find({}).lean();
    console.log(`[Fix] Found ${recipes.length} recipes`);
    
    let fixedCount = 0;
    
    for (const recipe of recipes) {
      let hasInvalidRefs = false;
      const recipeObj = await Recipe.findById(recipe._id);
      
      // Check specifications.ice
      if (recipeObj.specifications?.ice) {
        const iceId = recipeObj.specifications.ice;
        if (typeof iceId === 'string' && !mongoose.Types.ObjectId.isValid(iceId)) {
          hasInvalidRefs = true;
          console.log(`[Fix] ❌ Invalid ice ID found: ${iceId} in recipe ${recipe._id}`);
          
          // Try to find a matching decoration by name
          const decoration = await Decoration.findOne({ name: iceId });
          if (decoration) {
            recipeObj.specifications.ice = decoration._id;
            console.log(`[Fix] ✅ Replaced ${iceId} with ${decoration._id}`);
          } else {
            // Remove the invalid reference
            recipeObj.specifications.ice = null;
            console.log(`[Fix] ✅ Removed invalid ice reference: ${iceId}`);
          }
        }
      }
      
      // Check specifications.glassware
      if (recipeObj.specifications?.glassware) {
        const glasswareId = recipeObj.specifications.glassware;
        if (typeof glasswareId === 'string' && !mongoose.Types.ObjectId.isValid(glasswareId)) {
          hasInvalidRefs = true;
          console.log(`[Fix] ❌ Invalid glassware ID found: ${glasswareId} in recipe ${recipe._id}`);
          
          // Try to find a matching decoration by name
          const decoration = await Decoration.findOne({ name: glasswareId });
          if (decoration) {
            recipeObj.specifications.glassware = decoration._id;
            console.log(`[Fix] ✅ Replaced ${glasswareId} with ${decoration._id}`);
          } else {
            // Remove the invalid reference
            recipeObj.specifications.glassware = null;
            console.log(`[Fix] ✅ Removed invalid glassware reference: ${glasswareId}`);
          }
        }
      }
      
      // Check specifications.decorations array
      if (recipeObj.specifications?.decorations?.length > 0) {
        for (let i = 0; i < recipeObj.specifications.decorations.length; i++) {
          const decId = recipeObj.specifications.decorations[i];
          if (typeof decId === 'string' && !mongoose.Types.ObjectId.isValid(decId)) {
            hasInvalidRefs = true;
            console.log(`[Fix] ❌ Invalid decoration ID found: ${decId} in recipe ${recipe._id}`);
            
            // Try to find a matching decoration by name
            const decoration = await Decoration.findOne({ name: decId });
            if (decoration) {
              recipeObj.specifications.decorations[i] = decoration._id;
              console.log(`[Fix] ✅ Replaced ${decId} with ${decoration._id}`);
            } else {
              // Remove the invalid reference
              recipeObj.specifications.decorations.splice(i, 1);
              i--;
              console.log(`[Fix] ✅ Removed invalid decoration reference: ${decId}`);
            }
          }
        }
      }
      
      if (hasInvalidRefs) {
        await recipeObj.save();
        fixedCount++;
      }
    }
    
    console.log(`[Fix] ✅ Fixed ${fixedCount} recipes`);
    
    process.exit(0);
  } catch (error) {
    console.error("[Fix] ❌ Error:", error);
    process.exit(1);
  }
};

findAndFixStandardIce();

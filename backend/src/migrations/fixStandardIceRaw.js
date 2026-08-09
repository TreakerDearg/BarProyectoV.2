import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Decoration from "../models/Decoration.js";

const fixStandardIceRaw = async () => {
  try {
    console.log("[Fix] Connecting to database...");
    await connectDB();
    
    // Use raw MongoDB collection to bypass Mongoose hooks
    const db = mongoose.connection.db;
    const recipesCollection = db.collection('recipes');
    
    // Find all recipes with raw query
    const recipes = await recipesCollection.find({}).toArray();
    console.log(`[Fix] Found ${recipes.length} recipes`);
    
    let fixedCount = 0;
    let foundStandardIce = false;
    
    for (const recipe of recipes) {
      let hasInvalidRefs = false;
      const updateData = {};
      
      // Check specifications.ice
      if (recipe.specifications?.ice) {
        const iceId = recipe.specifications.ice;
        if (typeof iceId === 'string' && !mongoose.Types.ObjectId.isValid(iceId)) {
          hasInvalidRefs = true;
          if (iceId === 'STANDARD_ICE') {
            foundStandardIce = true;
            console.log(`[Fix] ❌ Found 'STANDARD_ICE' in recipe ${recipe._id}`);
          }
          console.log(`[Fix] ❌ Invalid ice ID found: ${iceId} in recipe ${recipe._id}`);
          
          // Try to find a matching decoration by name
          const decoration = await Decoration.findOne({ name: iceId });
          if (decoration) {
            updateData['specifications.ice'] = decoration._id;
            console.log(`[Fix] ✅ Will replace ${iceId} with ${decoration._id}`);
          } else {
            // Remove the invalid reference
            updateData['specifications.ice'] = null;
            console.log(`[Fix] ✅ Will remove invalid ice reference: ${iceId}`);
          }
        }
      }
      
      // Check specifications.glassware
      if (recipe.specifications?.glassware) {
        const glasswareId = recipe.specifications.glassware;
        if (typeof glasswareId === 'string' && !mongoose.Types.ObjectId.isValid(glasswareId)) {
          hasInvalidRefs = true;
          console.log(`[Fix] ❌ Invalid glassware ID found: ${glasswareId} in recipe ${recipe._id}`);
          
          // Try to find a matching decoration by name
          const decoration = await Decoration.findOne({ name: glasswareId });
          if (decoration) {
            updateData['specifications.glassware'] = decoration._id;
            console.log(`[Fix] ✅ Will replace ${glasswareId} with ${decoration._id}`);
          } else {
            // Remove the invalid reference
            updateData['specifications.glassware'] = null;
            console.log(`[Fix] ✅ Will remove invalid glassware reference: ${glasswareId}`);
          }
        }
      }
      
      // Check specifications.decorations array
      if (recipe.specifications?.decorations && Array.isArray(recipe.specifications.decorations)) {
        const validDecorations = [];
        for (const decId of recipe.specifications.decorations) {
          if (typeof decId === 'string' && !mongoose.Types.ObjectId.isValid(decId)) {
            hasInvalidRefs = true;
            console.log(`[Fix] ❌ Invalid decoration ID found: ${decId} in recipe ${recipe._id}`);
            
            // Try to find a matching decoration by name
            const decoration = await Decoration.findOne({ name: decId });
            if (decoration) {
              validDecorations.push(decoration._id);
              console.log(`[Fix] ✅ Will replace ${decId} with ${decoration._id}`);
            } else {
              console.log(`[Fix] ✅ Will remove invalid decoration reference: ${decId}`);
            }
          } else {
            validDecorations.push(decId);
          }
        }
        if (validDecorations.length !== recipe.specifications.decorations.length) {
          updateData['specifications.decorations'] = validDecorations;
        }
      }
      
      if (hasInvalidRefs) {
        await recipesCollection.updateOne(
          { _id: recipe._id },
          { $set: updateData }
        );
        fixedCount++;
      }
    }
    
    console.log(`[Fix] ✅ Fixed ${fixedCount} recipes`);
    if (foundStandardIce) {
      console.log(`[Fix] ✅ Found and fixed 'STANDARD_ICE' references`);
    } else {
      console.log(`[Fix] ℹ️  No 'STANDARD_ICE' references found in database`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("[Fix] ❌ Error:", error);
    process.exit(1);
  }
};

fixStandardIceRaw();

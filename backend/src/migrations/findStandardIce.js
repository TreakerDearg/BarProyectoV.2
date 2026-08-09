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

const findStandardIce = async () => {
  try {
    console.log("[Search] Connecting to database...");
    await connectDB();
    
    console.log("[Search] Looking for 'STANDARD_ICE' in all collections...\n");
    
    // Search in Recipes
    const recipes = await Recipe.find({});
    console.log(`[Search] Checking ${recipes.length} recipes...`);
    for (const recipe of recipes) {
      const recipeStr = JSON.stringify(recipe);
      if (recipeStr.includes('STANDARD_ICE')) {
        console.log(`[Search] FOUND in Recipe ${recipe._id}:`, recipe);
      }
    }
    
    // Search in Products
    const products = await Product.find({});
    console.log(`[Search] Checking ${products.length} products...`);
    for (const product of products) {
      const productStr = JSON.stringify(product);
      if (productStr.includes('STANDARD_ICE')) {
        console.log(`[Search] FOUND in Product ${product._id}:`, product);
      }
    }
    
    // Search in Decorations
    const decorations = await Decoration.find({});
    console.log(`[Search] Checking ${decorations.length} decorations...`);
    for (const decoration of decorations) {
      const decorationStr = JSON.stringify(decoration);
      if (decorationStr.includes('STANDARD_ICE')) {
        console.log(`[Search] FOUND in Decoration ${decoration._id}:`, decoration);
      }
    }
    
    // Search in Techniques
    const techniques = await Technique.find({});
    console.log(`[Search] Checking ${techniques.length} techniques...`);
    for (const technique of techniques) {
      const techniqueStr = JSON.stringify(technique);
      if (techniqueStr.includes('STANDARD_ICE')) {
        console.log(`[Search] FOUND in Technique ${technique._id}:`, technique);
      }
    }
    
    // Search in Collections
    const collections = await Collection.find({});
    console.log(`[Search] Checking ${collections.length} collections...`);
    for (const collection of collections) {
      const collectionStr = JSON.stringify(collection);
      if (collectionStr.includes('STANDARD_ICE')) {
        console.log(`[Search] FOUND in Collection ${collection._id}:`, collection);
      }
    }
    
    // Search in Tags
    const tags = await Tag.find({});
    console.log(`[Search] Checking ${tags.length} tags...`);
    for (const tag of tags) {
      const tagStr = JSON.stringify(tag);
      if (tagStr.includes('STANDARD_ICE')) {
        console.log(`[Search] FOUND in Tag ${tag._id}:`, tag);
      }
    }
    
    // Search in InventoryItems
    const inventoryItems = await InventoryItem.find({});
    console.log(`[Search] Checking ${inventoryItems.length} inventory items...`);
    for (const item of inventoryItems) {
      const itemStr = JSON.stringify(item);
      if (itemStr.includes('STANDARD_ICE')) {
        console.log(`[Search] FOUND in InventoryItem ${item._id}:`, item);
      }
    }
    
    console.log("\n[Search] ✅ Search complete");
    
    process.exit(0);
  } catch (error) {
    console.error("[Search] ❌ Error:", error);
    process.exit(1);
  }
};

findStandardIce();

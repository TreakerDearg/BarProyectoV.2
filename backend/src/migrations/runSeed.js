import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { seedTechniquesAndDecorations } from "./seedTechniquesAndDecorations.js";
import { seedCollectionsAndTags } from "./seedCollectionsAndTags.js";

/* =========================
   RUN SEED MANUALLY
========================= */
const runSeed = async () => {
  try {
    console.log("[Seed] Connecting to database...");
    await connectDB();
    
    console.log("[Seed] Running seeds...");
    await seedTechniquesAndDecorations();
    await seedCollectionsAndTags();
    
    console.log("[Seed] ✅ All seeds completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("[Seed] ❌ Error running seed:", error);
    process.exit(1);
  }
};

runSeed();

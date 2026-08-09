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
    await connectDB();
    
    await seedTechniquesAndDecorations();
    await seedCollectionsAndTags();
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

runSeed();

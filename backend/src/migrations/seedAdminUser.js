import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

const seedAdminUser = async () => {
  try {
    console.log("[Seed] Connecting to database...");
    await connectDB();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@bartender.com' });
    if (existingAdmin) {
      console.log("[Seed] Admin user already exists:", existingAdmin.email);
      process.exit(0);
    }
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@bartender.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      isEmployee: true,
      shift: 'morning',
      permissions: {
        recipes: { read: true, write: true, delete: true },
        products: { read: true, write: true, delete: true },
        inventory: { read: true, write: true, delete: true },
        orders: { read: true, write: true, delete: true },
        menus: { read: true, write: true, delete: true },
        tables: { read: true, write: true, delete: true },
        reservations: { read: true, write: true, delete: true },
        discounts: { read: true, write: true, delete: true },
        roulette: { read: true, write: true, delete: true },
        admin: { read: true, write: true, delete: true },
      },
    });
    
    console.log("[Seed] ✅ Admin user created successfully:");
    console.log("  Email: admin@bartender.com");
    console.log("  Password: admin123");
    console.log("  Role: admin");
    
    process.exit(0);
  } catch (error) {
    console.error("[Seed] ❌ Error creating admin user:", error);
    process.exit(1);
  }
};

seedAdminUser();

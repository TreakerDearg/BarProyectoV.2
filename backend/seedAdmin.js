import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const exists = await User.findOne({ email: "admin@system.com" });

    if (exists) {
      console.log("⚠️ Admin ya existe");
      process.exit();
    }

    await User.create({
      name: "Admin Master",
      email: "admin@system.com",
      password: "123456",
      role: "admin",
      shift: null,
      permissions: {
        "users.manage": true,
        "orders.manage": true,
        "inventory.manage": true,
      },
      isActive: true,
    });

    console.log("✅ Admin creado correctamente");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

run();
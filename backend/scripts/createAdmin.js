import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

/* ==============================
   CONEXIÓN A DB
============================== */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 MongoDB conectado");
  } catch (error) {
    console.error("🔴 Error conexión DB:", error.message);
    process.exit(1);
  }
};

/* ==============================
   CREAR ADMIN
============================== */
const createAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@bar.com";

    /* ==========================
       VERIFICAR SI YA EXISTE
    ========================== */
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("⚠️ Admin ya existe");
      process.exit(0);
    }

    /* ==========================
       CREAR ADMIN
    ========================== */
    const admin = new User({
      name: "Admin",
      email,
      password: "123456", // se hashea automáticamente en el schema
      role: "admin",
      isActive: true,
      permissions: [
        "all",
      ],
    });

    await admin.save();

    console.log("🟢 Admin creado correctamente:");
    console.log({
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    process.exit(0);

  } catch (error) {
    console.error("🔴 Error creando admin:", error.message);
    process.exit(1);
  }
};

/* ==============================
   EXEC
============================== */
createAdmin();
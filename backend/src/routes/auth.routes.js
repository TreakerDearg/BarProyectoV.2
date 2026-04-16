import express from "express";
import {
  loginUser,
  registerUser,
  getProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

//  CLIENTES (auto registro)
router.post("/register", registerUser);

//  LOGIN (todos)
router.post("/login", loginUser);

//  PERFIL
router.get("/profile", protect, getProfile);

export default router;
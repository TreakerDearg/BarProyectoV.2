import express from "express";
import { loginUser, registerUser, getProfile, refreshToken, getSessions, revokeSession, logout, googleAuth, googleCallback } from "../controllers/auth.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../utils/schemas.js";

const router = express.Router();

/* =========================================================
   PUBLIC ROUTES
========================================================= */
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/refresh", refreshToken);

/* =========================================================
   OAUTH ROUTES
========================================================= */
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

/* =========================================================
   PRIVATE ROUTES
========================================================= */
router.get("/me", protect, getProfile);
router.get("/sessions", protect, getSessions);
router.delete("/sessions/:sessionId", protect, revokeSession);
router.post("/logout", protect, logout);

/* =========================================================
   TEST ADMIN
========================================================= */
router.get(
  "/admin-check",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ success: true, user: req.user });
  }
);

export default router;
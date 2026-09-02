import express from "express";
import {
  loginUser, registerUser, getProfile, refreshToken,
  getSessions, revokeSession, logout,
  googleAuth, googleCallback,
  generateSSOToken, redeemSSOToken,
  updateProfile, changeOwnPassword,
  getFavorites, addFavorite, removeFavorite,
} from "../controllers/auth.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../utils/schemas.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = express.Router();

/* =========================================================
   PUBLIC ROUTES
========================================================= */
router.post("/register", validate(registerSchema), asyncHandler(registerUser));
router.post("/login",    validate(loginSchema),    asyncHandler(loginUser));
router.post("/refresh",                            asyncHandler(refreshToken));

/* =========================================================
   OAUTH ROUTES
========================================================= */
router.get("/google",          asyncHandler(googleAuth));
router.get("/google/callback", asyncHandler(googleCallback));

/* =========================================================
   SSO HANDOFF (web → desktop)
========================================================= */
router.post("/sso-token",        protect, asyncHandler(generateSSOToken));
router.post("/sso-token/redeem",          asyncHandler(redeemSSOToken));

/* =========================================================
   PRIVATE ROUTES — perfil básico
========================================================= */
router.get("/me",       protect, asyncHandler(getProfile));
router.patch("/profile",protect, asyncHandler(updateProfile));
router.patch("/password",protect, asyncHandler(changeOwnPassword));

/* =========================================================
   SESIONES
========================================================= */
router.get("/sessions",              protect, asyncHandler(getSessions));
router.delete("/sessions/:sessionId",protect, asyncHandler(revokeSession));
router.post("/logout",               protect, asyncHandler(logout));

/* =========================================================
   FAVORITOS (solo clientes autenticados)
========================================================= */
router.get("/favorites",              protect, asyncHandler(getFavorites));
router.post("/favorites",             protect, asyncHandler(addFavorite));
router.delete("/favorites/:productId",protect, asyncHandler(removeFavorite));

/* =========================================================
   TEST ADMIN
========================================================= */
router.get(
  "/admin-check",
  protect,
  authorizeRoles("admin"),
  (req, res) => { res.json({ success: true, user: req.user }); }
);

export default router;
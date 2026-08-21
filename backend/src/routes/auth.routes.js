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
   TEMPORAL DIAGNOSTICS (eliminar después de confirmar OAuth)
========================================================= */
router.get("/google/check", (req, res) => {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri  = process.env.GOOGLE_REDIRECT_URI;
  const frontendUrl  = process.env.FRONTEND_URL;
  const apiUrl       = process.env.API_URL;

  res.json({
    success: true,
    env: {
      GOOGLE_CLIENT_ID_present:     !!clientId,
      GOOGLE_CLIENT_ID_prefix:      clientId ? clientId.slice(0, 20) + "..." : null,
      GOOGLE_CLIENT_SECRET_present: !!clientSecret,
      GOOGLE_REDIRECT_URI:          redirectUri || null,
      FRONTEND_URL:                 frontendUrl || null,
      API_URL:                      apiUrl || null,
      NODE_ENV:                     process.env.NODE_ENV || null,
    },
  });
});

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
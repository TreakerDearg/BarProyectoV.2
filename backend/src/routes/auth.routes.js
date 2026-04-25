import express from "express";
import { loginUser, registerUser, getProfile } from "../controllers/auth.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../utils/schemas.js";

const router = express.Router();

/* =========================================================
   PUBLIC ROUTES
========================================================= */
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

/* =========================================================
   PRIVATE ROUTES
========================================================= */
router.get("/me", protect, getProfile);

router.post("/logout", protect, (req, res) => {
  res.json({ success: true, message: "Logout OK" });
});

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
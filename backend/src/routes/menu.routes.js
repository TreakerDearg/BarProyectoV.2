import { Router } from "express";
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from "../controllers/menu.controller.js";

const router = Router();

router.get("/", getMenus);
router.post("/", createMenu);
router.put("/:id", updateMenu);
router.delete("/:id", deleteMenu);

export default router;
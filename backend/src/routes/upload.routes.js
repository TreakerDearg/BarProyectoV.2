import { Router } from "express";
import { uploadSingle, uploadMultiple } from "../middlewares/upload.js";
import { uploadSingleImage, uploadMultipleImagesController, deleteImageController } from "../controllers/upload.controller.js";

const router = Router();

/* =========================================================
   UPLOAD SINGLE IMAGE
========================================================= */
router.post("/", uploadSingle("image"), uploadSingleImage);

/* =========================================================
   UPLOAD MULTIPLE IMAGES
========================================================= */
router.post("/multiple", uploadMultiple("images", 5), uploadMultipleImagesController);

/* =========================================================
   DELETE IMAGE
========================================================= */
router.delete("/:publicId", deleteImageController);

export default router;

import { logger } from "../config/logger.js";
import { uploadImage, deleteImage, uploadMultipleImages } from "../config/cloudinary.js";
import { ok, created, badRequest, serverError } from "../utils/response.js";

/* =========================================================
   UPLOAD SINGLE IMAGE
========================================================= */
export const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return badRequest(res, "No se proporcionó ningún archivo");
    }

    logger.info(`[Upload] Single image upload: ${req.file.originalname}`);

    // The file is already uploaded by multer-storage-cloudinary middleware
    // req.file contains: secure_url, public_id, etc.
    const result = {
      url: req.file.secure_url || req.file.path,
      publicId: req.file.public_id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    };

    logger.info(`[Upload] Single image uploaded successfully: ${result.publicId}`);

    return created(res, result, "Imagen subida correctamente");
  } catch (error) {
    logger.error("[Upload] Error uploading single image:", error);
    return serverError(res, "Error al subir la imagen");
  }
};

/* =========================================================
   UPLOAD MULTIPLE IMAGES
========================================================= */
export const uploadMultipleImagesController = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return badRequest(res, "No se proporcionaron archivos");
    }

    logger.info(`[Upload] Multiple images upload: ${req.files.length} files`);

    // The files are already uploaded by multer-storage-cloudinary middleware
    const results = req.files.map((file) => ({
      url: file.secure_url || file.path,
      publicId: file.public_id,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    }));

    logger.info(`[Upload] Multiple images uploaded successfully: ${results.length} files`);

    return created(res, { files: results }, "Imágenes subidas correctamente");
  } catch (error) {
    logger.error("[Upload] Error uploading multiple images:", error);
    return serverError(res, "Error al subir las imágenes");
  }
};

/* =========================================================
   DELETE IMAGE
========================================================= */
export const deleteImageController = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return badRequest(res, "Se requiere publicId");
    }

    logger.info(`[Upload] Deleting image: ${publicId}`);

    await deleteImage(publicId);

    logger.info(`[Upload] Image deleted successfully: ${publicId}`);

    return ok(res, null, "Imagen eliminada correctamente");
  } catch (error) {
    logger.error("[Upload] Error deleting image:", error);
    return serverError(res, "Error al eliminar la imagen");
  }
};

import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger.js';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Verificar configuración al inicio
const cloudinaryConfigured = !!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET;

if (!cloudinaryConfigured) {
  logger.warn('[Cloudinary] Faltan variables de entorno de Cloudinary. La subida de imágenes podría no funcionar.');
} else {
  logger.info('[Cloudinary] Configuración cargada correctamente');
}

export const uploadImage = async (file, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `nebula/${folder}`,
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      resource_type: 'image',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    logger.error('[Cloudinary] Error uploading image:', error);
    throw new Error('Error al subir imagen a Cloudinary');
  }
};

export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    logger.error('[Cloudinary] Error deleting image:', error);
    throw new Error('Error al eliminar imagen de Cloudinary');
  }
};

export const uploadMultipleImages = async (files, folder = 'general') => {
  try {
    if (!files || !Array.isArray(files) || !files.length) {
      throw new Error("files debe ser un array no vacío");
    }
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    logger.error('[Cloudinary] Error uploading multiple images:', error);
    throw new Error('Error al subir múltiples imágenes a Cloudinary');
  }
};

export default cloudinary;
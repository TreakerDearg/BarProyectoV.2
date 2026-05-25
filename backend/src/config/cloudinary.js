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
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
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
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Error al subir imagen a Cloudinary');
  }
};

export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Error al eliminar imagen de Cloudinary');
  }
};

export const uploadMultipleImages = async (files, folder = 'general') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw new Error('Error al subir múltiples imágenes a Cloudinary');
  }
};

export default cloudinary;
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../config/logger.js';

// Cloudinary ya está configurado en config/cloudinary.js que se importa
// en server.js al iniciar. Aquí usamos directamente v2.

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Determinar carpeta según el campo y la ruta
    let folder = 'nebula/general';
    if (req.baseUrl?.includes('products') || req.path?.includes('products')) {
      folder = 'nebula/products';
    } else if (req.baseUrl?.includes('recipes')) {
      folder = 'nebula/recipes';
    } else if (req.baseUrl?.includes('upload')) {
      folder = 'nebula/uploads';
    }

    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `${originalName}-${timestamp}`,
      transformation: [
        { width: 1200, height: 900, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo no permitido: ${file.mimetype}. Solo jpg, jpeg, png, webp.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB
    files: 6,
  },
});

export const uploadSingle   = (field)          => upload.single(field);
export const uploadMultiple = (field, max = 5) => upload.array(field, max);
export const uploadFields   = (fields)          => upload.fields(fields);

export default upload;

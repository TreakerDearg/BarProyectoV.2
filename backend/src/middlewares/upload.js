import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configuración de almacenamiento de Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nebula',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: (req, file) => {
      // Generar un nombre único para el archivo
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      return `${originalName}-${timestamp}`;
    },
  },
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  console.log('[Upload Middleware] File filter check:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('[Upload Middleware] File type accepted');
    cb(null, true);
  } else {
    console.error('[Upload Middleware] File type rejected:', file.mimetype);
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan imágenes (jpg, jpeg, png, webp)`), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 5, // Máximo 5 archivos a la vez
  },
});

// Middleware para upload individual
export const uploadSingle = (fieldName) => upload.single(fieldName);

// Middleware para upload múltiple
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Middleware para upload de múltiples campos con diferentes nombres
export const uploadFields = (fields) => upload.fields(fields);

export default upload;
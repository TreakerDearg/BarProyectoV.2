import express from 'express';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.js';

const router = express.Router();

// Upload single image
router.post('/', uploadSingle('image'), (req, res) => {
  try {
    console.log('[Upload] Single image upload request received');
    console.log('[Upload] req.file:', req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      console.error('[Upload] No file in request');
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    
    console.log('[Upload] File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      filename: req.file.filename,
    });
    
    // Cloudinary storage returns the file info in req.file
    res.json({
      url: req.file.path, // Cloudinary URL
      publicId: req.file.filename, // Cloudinary public_id
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('[Upload] Error en upload:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Multer error handler for single upload
router.use((err, req, res, next) => {
  console.error('[Upload] Multer error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 5MB' });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Demasiados archivos. Máximo 5' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Campo de archivo inesperado' });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Error al subir la imagen' });
});

// Upload multiple images
router.post('/multiple', uploadMultiple('images', 5), (req, res) => {
  try {
    console.log('[Upload] Multiple images upload request received');
    console.log('[Upload] req.files:', req.files ? `Present (${req.files.length} files)` : 'Missing');
    
    if (!req.files || req.files.length === 0) {
      console.error('[Upload] No files in request');
      return res.status(400).json({ error: 'No se subieron archivos' });
    }
    
    console.log('[Upload] Files details:', req.files.map(file => ({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      filename: file.filename,
    })));
    
    const uploadedFiles = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    }));
    
    res.json({
      files: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (error) {
    console.error('[Upload] Error en upload multiple:', error);
    res.status(500).json({ error: 'Error al subir las imágenes' });
  }
});

export default router;

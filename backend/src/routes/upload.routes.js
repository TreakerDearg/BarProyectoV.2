import express from 'express';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.js';

const router = express.Router();

// Upload single image
router.post('/', uploadSingle('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    
    // Cloudinary storage returns the file info in req.file
    res.json({
      url: req.file.path, // Cloudinary URL
      publicId: req.file.filename, // Cloudinary public_id
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Error en upload:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Upload multiple images
router.post('/multiple', uploadMultiple('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subieron archivos' });
    }
    
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
    console.error('Error en upload multiple:', error);
    res.status(500).json({ error: 'Error al subir las imágenes' });
  }
});

export default router;

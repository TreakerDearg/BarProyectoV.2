import express from 'express';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.js';
import { deleteImage } from '../config/cloudinary.js';

const router = express.Router();

// Upload single image
router.post('/', uploadSingle('image'), (req, res) => {
  try {
    console.log('[Upload] Single image upload request received');
    console.log('[Upload] req.file:', req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      console.error('[Upload] No file in request');
      return res.status(400).json({ 
        success: false, 
        message: 'No se subió ningún archivo',
        data: null 
      });
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
    res.status(500).json({ 
      success: false, 
      message: 'Error al subir la imagen',
      data: null 
    });
  }
});

// Upload multiple images
router.post('/multiple', uploadMultiple('images', 5), (req, res) => {
  try {
    console.log('[Upload] Multiple images upload request received');
    console.log('[Upload] req.files:', req.files ? `Present (${req.files.length} files)` : 'Missing');
    
    if (!req.files || req.files.length === 0) {
      console.error('[Upload] No files in request');
      return res.status(400).json({ 
        success: false, 
        message: 'No se subieron archivos',
        data: null 
      });
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
      mimeType: file.mimeType,
      size: file.size,
    }));
    
    res.json({
      files: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (error) {
    console.error('[Upload] Error en upload multiple:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al subir las imágenes',
      data: null 
    });
  }
});

// Delete image from Cloudinary
router.delete('/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    console.log('[Upload] Delete image request:', publicId);
    
    if (!publicId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere publicId',
        data: null 
      });
    }

    await deleteImage(publicId);
    
    res.json({ 
      success: true, 
      message: 'Imagen eliminada correctamente',
      data: null 
    });
  } catch (error) {
    console.error('[Upload] Error deleting image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar la imagen',
      data: null 
    });
  }
});

// Multer error handler (must be after all routes)
router.use((err, req, res, next) => {
  console.error('[Upload] Multer error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      success: false, 
      message: 'El archivo es demasiado grande. Máximo 5MB',
      data: null 
    });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      success: false, 
      message: 'Demasiados archivos. Máximo 5',
      data: null 
    });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      success: false, 
      message: 'Campo de archivo inesperado',
      data: null 
    });
  }
  if (err.message) {
    return res.status(400).json({ 
      success: false, 
      message: err.message,
      data: null 
    });
  }
  res.status(500).json({ 
    success: false, 
    message: 'Error al subir la imagen',
    data: null 
  });
});

export default router;

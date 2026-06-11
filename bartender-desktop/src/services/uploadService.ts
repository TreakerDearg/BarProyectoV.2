import api from "./api";

export interface UploadResult {
  url: string;
  publicId: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface UploadError {
  message: string;
  error?: any;
}

/**
 * Upload a single image to Cloudinary via the backend upload endpoint
 * @param file - The file to upload
 * @param options - Upload options
 * @returns Promise with upload result containing URL and publicId
 */
export const uploadImage = async (
  file: File,
  options?: { compress?: boolean; maxWidth?: number; quality?: number }
): Promise<UploadResult> => {
  try {
    console.log('[UploadService] Starting image upload:', {
      name: file.name,
      size: file.size,
      type: file.type,
      compress: options?.compress ?? true,
    });

    // Validate file before upload
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Compress image if enabled (default: true)
    let fileToUpload = file;
    if (options?.compress !== false && file.size > 500 * 1024) { // Compress if larger than 500KB
      console.log('[UploadService] Compressing image...');
      try {
        fileToUpload = await compressImage(
          file,
          options?.maxWidth || 1920,
          options?.quality || 0.8
        );
        console.log('[UploadService] Image compressed:', {
          originalSize: file.size,
          compressedSize: fileToUpload.size,
          reduction: `${((1 - fileToUpload.size / file.size) * 100).toFixed(1)}%`,
        });
      } catch (compressError) {
        console.warn('[UploadService] Compression failed, using original file:', compressError);
        // Continue with original file if compression fails
      }
    }

    const formData = new FormData();
    formData.append('image', fileToUpload);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('[UploadService] Upload successful:', response.data);

    if (!response.data) {
      throw new Error('No data received from server');
    }

    if (!response.data.url) {
      throw new Error('No URL received in response');
    }

    if (!response.data.publicId) {
      console.warn('[UploadService] No publicId received in response - this may cause issues');
    }

    return {
      url: response.data.url,
      publicId: response.data.publicId || '',
      originalName: response.data.originalName || file.name,
      mimeType: response.data.mimeType || file.type,
      size: response.data.size || fileToUpload.size,
    };
  } catch (error: any) {
    console.error('[UploadService] Upload error:', error);
    
    // Provide specific error messages based on error type
    if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado. La imagen es muy grande o la conexión es lenta.');
    }
    
    if (error.response?.status === 413) {
      throw new Error('El archivo es demasiado grande para el servidor.');
    }
    
    if (error.response?.status === 415) {
      throw new Error('Tipo de archivo no soportado por el servidor.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Error del servidor al subir la imagen. Intente nuevamente.');
    }
    
    const errorMessage = error?.response?.data?.message || 
                        error?.response?.data?.error || 
                        error?.message || 
                        'Error al subir la imagen';
    throw new Error(errorMessage);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of files to upload
 * @param options - Upload options
 * @returns Promise with array of upload results
 */
export const uploadMultipleImages = async (
  files: File[],
  options?: { compress?: boolean; maxWidth?: number; quality?: number }
): Promise<UploadResult[]> => {
  try {
    console.log('[UploadService] Starting multiple image upload:', {
      count: files.length,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
    });

    // Validate all files before upload
    const validationResults = files.map(file => ({
      file,
      validation: validateImageFile(file)
    }));
    
    const invalidFiles = validationResults.filter(r => !r.validation.isValid);
    if (invalidFiles.length > 0) {
      const errors = invalidFiles.map(r => `${r.file.name}: ${r.validation.error}`).join('; ');
      throw new Error(`Archivos inválidos: ${errors}`);
    }

    // Compress images if enabled
    let filesToUpload = files;
    if (options?.compress !== false) {
      console.log('[UploadService] Compressing images...');
      try {
        filesToUpload = await Promise.all(
          files.map(file => 
            file.size > 500 * 1024 
              ? compressImage(file, options?.maxWidth || 1920, options?.quality || 0.8)
                  .catch(err => {
                    console.warn(`[UploadService] Compression failed for ${file.name}:`, err);
                    return file; // Use original if compression fails
                  })
              : file
          )
        );
        console.log('[UploadService] Images compressed');
      } catch (compressError) {
        console.warn('[UploadService] Batch compression failed, using original files:', compressError);
      }
    }

    const formData = new FormData();
    filesToUpload.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 second timeout for multiple files
    });

    console.log('[UploadService] Multiple upload successful:', response.data);

    if (!response.data) {
      throw new Error('No data received from server');
    }

    if (!response.data.files) {
      throw new Error('No files array in response data');
    }

    // Validate response structure
    const results = response.data.files.map((result: any, index: number) => ({
      url: result.url,
      publicId: result.publicId || '',
      originalName: result.originalName || filesToUpload[index].name,
      mimeType: result.mimeType || filesToUpload[index].type,
      size: result.size || filesToUpload[index].size,
    }));

    return results;
  } catch (error: any) {
    console.error('[UploadService] Multiple upload error:', error);
    
    // Provide specific error messages
    if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado. Las imágenes son muy grandes o la conexión es lenta.');
    }
    
    if (error.response?.status === 413) {
      throw new Error('Algunos archivos son demasiado grandes para el servidor.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Error del servidor al subir las imágenes. Intente nuevamente.');
    }
    
    const errorMessage = error?.response?.data?.message || 
                        error?.response?.data?.error || 
                        error?.message || 
                        'Error al subir las imágenes';
    throw new Error(errorMessage);
  }
};

/**
 * Compress image file before upload
 * @param file - The file to compress
 * @param maxWidth - Maximum width for compression (default: 1920)
 * @param quality - Quality for compression (default: 0.8)
 * @returns Promise with compressed file
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Error al obtener contexto del canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen para compresión'));
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
  });
};

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de archivo no permitido: ${file.type}. Solo se aceptan JPG, PNG y WebP`,
    };
  }

  // Check file size (max 10MB before compression)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 10MB`,
    };
  }

  // Check minimum size (at least 1KB)
  if (file.size < 1024) {
    return {
      isValid: false,
      error: 'El archivo es demasiado pequeño. Mínimo 1KB',
    };
  }

  return { isValid: true };
};

/**
 * Delete an image from Cloudinary
 * @param publicId - The Cloudinary public ID of the image to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    console.log('[UploadService] Deleting image:', publicId);
    await api.delete(`/upload/${publicId}`);
    console.log('[UploadService] Image deleted successfully');
  } catch (error: any) {
    console.error('[UploadService] Delete image error:', error);
    // Don't throw error - allow operation to continue even if deletion fails
    console.warn('[UploadService] Failed to delete image, continuing anyway');
  }
};

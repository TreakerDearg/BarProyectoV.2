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

// Upload queue management
interface UploadQueueItem {
  file: File;
  options?: { compress?: boolean; maxWidth?: number; quality?: number };
  resolve: (value: UploadResult) => void;
  reject: (error: Error) => void;
  retries: number;
}

class UploadQueue {
  private queue: UploadQueueItem[] = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private activeUploads = 0;

  add(file: File, options?: any): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ file, options, resolve, reject, retries: 0 });
      this.process();
    });
  }

  private async process() {
    if (this.isProcessing || this.activeUploads >= this.maxConcurrent) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0 && this.activeUploads < this.maxConcurrent) {
      const item = this.queue.shift();
      if (item) {
        this.activeUploads++;
        this.uploadWithRetry(item).finally(() => {
          this.activeUploads--;
          this.process();
        });
      }
    }
    
    this.isProcessing = false;
  }

  private async uploadWithRetry(item: UploadQueueItem): Promise<void> {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.uploadSingle(item.file, item.options);
        item.resolve(result);
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          item.reject(error as Error);
          return;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[UploadQueue] Retry ${attempt + 1}/${maxRetries} for ${item.file.name} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private async uploadSingle(file: File, options?: any): Promise<UploadResult> {
    // Use the existing uploadImage logic
    return uploadImageInternal(file, options);
  }
}

const uploadQueue = new UploadQueue();

/**
 * Internal upload function without queue management
 */
const uploadImageInternal = async (
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

    // Adaptive quality based on image type
    let quality = options?.quality || 0.8;
    if (file.type === 'image/png') {
      quality = 0.9; // Higher quality for PNG
    } else if (file.type === 'image/webp') {
      quality = 0.85; // Medium-high quality for WebP
    }

    // Compress image if enabled (default: true)
    let fileToUpload = file;
    if (options?.compress !== false && file.size > 500 * 1024) { // Compress if larger than 500KB
      console.log('[UploadService] Compressing image...');
      try {
        fileToUpload = await compressImage(
          file,
          options?.maxWidth || 1920,
          quality
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
 * Upload a single image to Cloudinary via the backend upload endpoint
 * Uses queue management with automatic retry
 * @param file - The file to upload
 * @param options - Upload options
 * @returns Promise with upload result containing URL and publicId
 */
export const uploadImage = async (
  file: File,
  options?: { compress?: boolean; maxWidth?: number; quality?: number }
): Promise<UploadResult> => {
  return uploadQueue.add(file, options);
};

/**
 * Upload multiple images to Cloudinary
 * Uses queue management for better performance
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

    // Upload using queue for better performance
    const uploadPromises = files.map(file => uploadQueue.add(file, options));
    const results = await Promise.all(uploadPromises);

    console.log('[UploadService] Multiple upload successful:', results);

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

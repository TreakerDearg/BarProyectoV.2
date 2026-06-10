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
 * @returns Promise with upload result containing URL and publicId
 */
export const uploadImage = async (file: File): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      url: response.data.url,
      publicId: response.data.publicId,
      originalName: response.data.originalName,
      mimeType: response.data.mimeType,
      size: response.data.size,
    };
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Error al subir la imagen';
    throw new Error(errorMessage);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of files to upload
 * @returns Promise with array of upload results
 */
export const uploadMultipleImages = async (files: File[]): Promise<UploadResult[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.files;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Error al subir las imágenes';
    throw new Error(errorMessage);
  }
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
      error: 'Tipo de archivo no permitido. Solo se aceptan JPG, PNG y WebP',
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande. Máximo 5MB',
    };
  }

  return { isValid: true };
};

"use client";

import { useState, memo } from "react";
import { Upload, Loader2, AlertCircle, CheckCircle2, X, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "../../../services/uploadService";

interface Props {
  currentImage: string;
  onImageUploaded: (url: string, publicId: string) => void;
}

function ImageUploader({ currentImage, onImageUploaded }: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      setImageUploadProgress(0);
      setUploadError(null);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setImageUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload image to Cloudinary
      const uploadResult = await uploadImage(file);

      clearInterval(progressInterval);
      setImageUploadProgress(100);

      // Update menu with uploaded image data
      onImageUploaded(uploadResult.url, uploadResult.publicId);

      // Keep preview for UI
      setImagePreview(null);
      setImageFile(null);

      console.log('[ImageUploader] Image uploaded successfully:', uploadResult);
    } catch (error: any) {
      console.error('[ImageUploader] Error uploading image:', error);
      setUploadError(error.message || "Error al subir la imagen");
      setImageUploadProgress(0);
    } finally {
      setImageUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Solo se permiten archivos de imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('El archivo no debe exceder 5MB');
      return;
    }

    setImageFile(file);
    setUploadError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelPreview = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {currentImage || imagePreview ? (
          <div className="relative group">
            <img
              src={imagePreview || currentImage}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl border border-white/10"
            />
            {imagePreview && (
              <button
                onClick={handleCancelPreview}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-full h-48 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center bg-surface-2/50 hover:border-violet-400/40 transition-colors">
            <ImageIcon size={32} className="text-muted mb-2" />
            <p className="text-xs text-muted">Sin imagen</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="flex-1 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={imageUploading}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-2 border border-white/10 rounded-xl hover:border-violet-400/40 transition-colors text-ivory text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            {imageUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={16} />
                Subir Imagen
              </>
            )}
          </div>
        </label>

        {imagePreview && (
          <button
            onClick={() => handleImageUpload(imageFile!)}
            disabled={imageUploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 rounded-xl text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {imageUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {imageUploadProgress}%
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Confirmar
              </>
            )}
          </button>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red/10 border border-red/30 rounded-lg">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-xs text-red-300">{uploadError}</p>
        </div>
      )}
    </div>
  );
}

export default memo(ImageUploader);

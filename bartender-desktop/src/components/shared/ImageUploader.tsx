"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

import api from "../../services/api";

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  folder?: 'inventory' | 'menus' | 'products' | 'products/gallery';
  mode?: 'simple' | 'advanced';
  label?: string;
  maxSize?: number; // in MB
}

export default function ImageUploader({
  onImageUpload,
  currentImage,
  folder = 'products',
  mode = 'advanced',
  label = 'Subir imagen',
  maxSize = 5,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo excede el tamaño máximo de ${maxSize}MB`);
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    // Crear preview local
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setError(null);

    // Subir al backend
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      // Use the axios instance with proper base URL and auth headers
      const response: any = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onImageUpload(response.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload('');
    setSuccess(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={handleButtonClick}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          mode === 'simple'
            ? 'border-white/10 hover:border-gold/30'
            : 'border-white/20 hover:border-gold/50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-xl object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full ${
                mode === 'simple' ? 'bg-gold/20' : 'bg-gold/10'
              }`}>
                <Upload size={32} className="text-gold" />
              </div>
            </div>
            <div>
              <p className={`font-bold ${
                mode === 'simple' ? 'text-sm' : 'text-base'
              } text-ivory`}>
                {label}
              </p>
              <p className={`text-xs text-muted mt-1`}>
                JPG, PNG o WebP (máx {maxSize}MB)
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
            <Loader2 className="text-gold animate-spin" size={32} />
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle size={16} />
          <span>Imagen subida correctamente</span>
        </div>
      )}

      {/* Advanced Mode Info */}
      {mode === 'advanced' && (
        <div className="text-xs text-muted space-y-1">
          <p>• Las imágenes se optimizan automáticamente</p>
          <p>• Formatos recomendados: JPG, PNG, WebP</p>
          <p>• Ratio recomendado: 4:3 o 1:1</p>
        </div>
      )}
    </div>
  );
}
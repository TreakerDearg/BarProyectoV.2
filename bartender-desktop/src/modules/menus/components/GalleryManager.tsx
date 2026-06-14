"use client";

import { useState, memo } from "react";
import { Plus, X, Loader2, AlertCircle } from "lucide-react";
import { validateImageFile, uploadMultipleImages } from "../../../services/uploadService";
import type { GalleryImage } from "../../../types/menu";

interface Props {
  gallery: GalleryImage[];
  onGalleryUpdate: (gallery: GalleryImage[]) => void;
}

function GalleryManager({ gallery, onGalleryUpdate }: Props) {
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);

  const addGalleryImage = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setGalleryUploading(true);
      setGalleryUploadError(null);

      // Validate files
      const validFiles = Array.from(files).filter(file => {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          console.error(`Invalid file ${file.name}:`, validation.error);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        setGalleryUploadError("No hay archivos válidos para subir");
        return;
      }

      // Upload files to Cloudinary
      const uploadResults = await uploadMultipleImages(validFiles);

      // Add to gallery with proper order
      const newGalleryItems = uploadResults.map((result, index) => ({
        url: result.url,
        publicId: result.publicId,
        order: gallery.length + index,
      }));

      const newGallery = [...gallery, ...newGalleryItems];
      onGalleryUpdate(newGallery);
    } catch (error: any) {
      console.error("Error uploading gallery images:", error);
      setGalleryUploadError(error.message || "Error al subir imágenes");
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    onGalleryUpdate(newGallery);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Galería de Imágenes</h4>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addGalleryImage(e.target.files)}
            disabled={galleryUploading}
            className="hidden"
          />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-400/30 rounded-lg hover:bg-violet-500/20 transition-colors text-violet-300 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            {galleryUploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Plus size={14} />
                Agregar
              </>
            )}
          </div>
        </label>
      </div>

      {galleryUploadError && (
        <div className="flex items-center gap-2 p-3 bg-red/10 border border-red/30 rounded-lg">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-xs text-red-300">{galleryUploadError}</p>
        </div>
      )}

      {gallery.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {gallery.map((item, index) => (
            <div key={index} className="relative group">
              <img
                src={item.url}
                alt={`Gallery ${index}`}
                className="w-full h-24 object-cover rounded-lg border border-white/10"
              />
              <button
                onClick={() => removeGalleryImage(index)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 border-2 border-dashed border-white/10 rounded-lg text-center">
          <p className="text-xs text-muted">No hay imágenes en la galería</p>
        </div>
      )}
    </div>
  );
}

export default memo(GalleryManager);

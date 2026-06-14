"use client";

import { useState, useCallback } from "react";
import { Type, Image as ImageIcon, Globe, Clock, Plus, XCircle, X, AlertCircle, Upload, Loader2, CheckCircle2, Eye, Info, Sparkles } from "lucide-react";
import type { Menu } from "../../../types/menu";
import { validateImageFile, uploadMultipleImages, uploadImage } from "../../../services/uploadService";
import IdentityPreview from "./IdentityPreview";

interface Props {
  menu: Menu;
  onUpdate: (updates: Partial<Menu & { imageFile?: File }>) => void;
}

export default function MenuIdentityEditor({ menu, onUpdate }: Props) {
  const [name, setName] = useState(menu.name || "");
  const [description, setDescription] = useState(menu.description || "");
  const [type, setType] = useState(menu.type || "mixed");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState(menu.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(menu.metaDescription || "");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(menu.keywords || []);

  const removeKeyword = (keyword: string) => {
    const newKeywords = keywords.filter(k => k !== keyword);
    setKeywords(newKeywords);
    onUpdate({ keywords: newKeywords });
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()];
      setKeywords(newKeywords);
      setKeywordInput("");
      onUpdate({ keywords: newKeywords });
    }
  };
  
  // Availability
  const [availableHours, setAvailableHours] = useState(
    menu.availableHours || { start: "09:00", end: "23:00" }
  );
  const [availableDays, setAvailableDays] = useState<string[]>(
    menu.availableDays || []
  );
  
  // Gallery
  const [gallery, setGallery] = useState(menu.gallery || []);

  // Dietary restrictions
  const [dietaryRestrictions, setDietaryRestrictions] = useState<("vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free")[]>(
    (menu.dietaryRestrictions as any) || []
  );

  const DIETARY_RESTRICTION_OPTIONS = [
    { value: "vegan", label: "Vegano", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    { value: "vegetarian", label: "Vegetariano", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { value: "gluten-free", label: "Sin Gluten", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { value: "dairy-free", label: "Sin Lácteos", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { value: "nut-free", label: "Sin Frutos Secos", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    { value: "sugar-free", label: "Sin Azúcar", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  ];

  const toggleDietaryRestriction = (restriction: "vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free") => {
    const updated = dietaryRestrictions.includes(restriction)
      ? dietaryRestrictions.filter(r => r !== restriction)
      : [...dietaryRestrictions, restriction];
    setDietaryRestrictions(updated);
    onUpdate({ dietaryRestrictions: updated as any });
  };

  const toggleDay = (day: string) => {
    const newDays = availableDays.includes(day)
      ? availableDays.filter(d => d !== day)
      : [...availableDays, day];
    setAvailableDays(newDays);
    onUpdate({ availableDays: newDays });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      setImageUploadProgress(0);
      setUploadError(null);
      setUploadSuccess(false);

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
      onUpdate({
        image: uploadResult.url,
        imagePublicId: uploadResult.publicId,
      });

      // Keep preview for UI
      setImagePreview(null);
      setImageFile(null);

      // Show success feedback
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      console.log('[MenuIdentityEditor] Image uploaded successfully:', uploadResult);
    } catch (error: any) {
      console.error('[MenuIdentityEditor] Error uploading image:', error);
      setUploadError(error.message || "Error al subir la imagen");
      setImageUploadProgress(0);
    } finally {
      setImageUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setUploadError(validation.error || "Error de validación");
        return;
      }
      
      setUploadError(null);
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      await handleImageUpload(file);
    }
  }, [handleImageUpload]);

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
      setGallery(newGallery);
      onUpdate({ gallery: newGallery });
    } catch (error: any) {
      console.error("Error uploading gallery images:", error);
      setGalleryUploadError(error.message || "Error al subir imágenes");
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    setGallery(newGallery);
    onUpdate({ gallery: newGallery });
  };

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const dayLabels = {
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mié",
    thursday: "Jue",
    friday: "Vie",
    saturday: "Sáb",
    sunday: "Dom"
  };

  return (
    <div className="nebula-panel p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-500/10 rounded-xl">
          <Type className="text-violet-300" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Identidad de la Carta</h3>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1">
            Nombre de la Carta
          </label>
          <div className="group relative">
            <Info size={12} className="text-muted/50 hover:text-violet-400 cursor-help" />
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-surface-2 border border-white/10 rounded-lg text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              El nombre debe ser único y descriptivo. Aparecerá en la vista pública del menú.
            </div>
          </div>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            onUpdate({ name: e.target.value });
          }}
          className="w-full bg-surface-3 border-white/10 rounded-lg px-4 py-3 text-ivory focus:ring-2 focus:ring-violet/40 focus:border-transparent transition-all outline-none"
          placeholder="Ej: Carta de Cocteles Principal"
        />
        {name.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-emerald-400">
            <CheckCircle2 size={10} />
            <span>Nombre válido</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1">
            Descripción
          </label>
          <div className="group relative">
            <Info size={12} className="text-muted/50 hover:text-violet-400 cursor-help" />
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-surface-2 border border-white/10 rounded-lg text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              Una descripción breve ayuda a los clientes a entender el tipo de menú.
            </div>
          </div>
        </div>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            onUpdate({ description: e.target.value });
          }}
          className="w-full bg-surface-3 border-white/10 rounded-lg px-4 py-3 text-ivory focus:ring-2 focus:ring-violet/40 focus:border-transparent transition-all outline-none resize-none h-24"
          placeholder="Descripción breve de la carta..."
        />
        <div className="flex items-center justify-between text-[10px] text-muted">
          <span>{description.length}/500 caracteres</span>
          {description.length > 0 && description.length < 50 && (
            <span className="text-amber-400">Recomendado: más de 50 caracteres</span>
          )}
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
          Tipo de Carta
        </label>
        <div className="flex gap-2">
          {[
            { value: "drink", label: "Bebidas" },
            { value: "food", label: "Comida" },
            { value: "mixed", label: "Mixto" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setType(opt.value as any);
                onUpdate({ type: opt.value as any });
              }}
              className={`flex-1 p-3 rounded-lg border transition-all ${
                type === opt.value
                  ? "bg-violet/10 border-violet/30 text-violet-300"
                  : "bg-white/5 border-white/10 text-muted hover:border-white/20"
              }`}
            >
              <span className="text-xs font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Image */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1">
            Imagen de Portada
          </label>
          <div className="group relative">
            <Info size={12} className="text-muted/50 hover:text-violet-400 cursor-help" />
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-surface-2 border border-white/10 rounded-lg text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              Arrastra una imagen o haz clic para subir. Formatos: PNG, JPG, WebP (máx 5MB).
            </div>
          </div>
        </div>
        <div 
          className={`relative group cursor-pointer border-2 border-dashed rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center transition-all ${
            isDragging 
              ? 'border-violet/40 bg-violet/5' 
              : 'border-white/10 hover:border-violet/40'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {imageUploading ? (
            <div className="relative z-10 flex flex-col items-center text-violet-300">
              <Loader2 size={32} className="mb-2 animate-spin" />
              <p className="text-sm font-medium">Subiendo imagen...</p>
              <div className="w-32 h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-violet-500 transition-all duration-300" 
                  style={{ width: `${imageUploadProgress}%` }}
                />
              </div>
              <p className="text-[10px] mt-2 opacity-60">{imageUploadProgress}%</p>
            </div>
          ) : uploadSuccess ? (
            <div className="relative z-10 flex flex-col items-center text-emerald-400 animate-in fade-in duration-300">
              <CheckCircle2 size={32} className="mb-2" />
              <p className="text-sm font-medium">¡Imagen subida con éxito!</p>
            </div>
          ) : (imagePreview || menu.image) ? (
            <>
              <img
                src={imagePreview || menu.image}
                alt="Menu preview"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="relative z-10 flex flex-col items-center text-muted group-hover:text-violet-300">
                {menu.imagePublicId && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-emerald/10 border border-emerald/30 rounded-full">
                    <CheckCircle2 size={10} className="text-emerald-400" />
                    <span className="text-[8px] font-semibold text-emerald-300">Sincronizado</span>
                  </div>
                )}
                <ImageIcon size={32} className="mb-2" />
                <p className="text-sm font-medium">Click para reemplazar imagen</p>
                <p className="text-[10px] mt-1 opacity-60">o arrastra una nueva imagen</p>
              </div>
            </>
          ) : (
            <div className="relative z-10 flex flex-col items-center text-muted group-hover:text-violet-300">
              <div className="p-3 bg-violet/10 rounded-full mb-3 group-hover:bg-violet/20 transition-colors">
                <Upload size={24} className="text-violet-400" />
              </div>
              <p className="text-sm font-medium">Arrastra una imagen aquí</p>
              <p className="text-[10px] mt-1 opacity-60">o haz clic para seleccionar</p>
              <p className="text-[9px] mt-2 opacity-40">PNG, JPG, WebP hasta 5MB</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const validation = validateImageFile(file);
                if (!validation.isValid) {
                  setUploadError(validation.error || "Error de validación");
                  return;
                }

                setUploadError(null);
                setImageFile(file);
                
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
                
                await handleImageUpload(file);
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        {uploadError && (
          <div className="flex items-center gap-2 text-red-400 text-xs animate-in fade-in duration-300">
            <AlertCircle size={12} />
            <span>{uploadError}</span>
          </div>
        )}
        {menu.imagePublicId && !imageUploading && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs">
            <CheckCircle2 size={12} />
            <span>Imagen sincronizada con Cloudinary</span>
          </div>
        )}
      </div>

      {/* SEO Section */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 pb-2">
          <div className="p-2 bg-cyan/10 rounded-lg">
            <Globe size={16} className="text-cyan-400" />
          </div>
          <h4 className="text-sm font-bold text-ivory uppercase tracking-widest">SEO & Metadatos</h4>
        </div>
        
        <div>
          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Meta Title</label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => {
              setMetaTitle(e.target.value);
              onUpdate({ metaTitle: e.target.value });
            }}
            className="w-full bg-surface-3 border-white/10 rounded-lg px-3 py-2 text-ivory text-xs focus:ring-2 focus:ring-cyan/40 focus:border-transparent transition-all outline-none"
            placeholder="Título para SEO (opcional)"
          />
        </div>
        
        <div>
          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Meta Description</label>
          <textarea
            value={metaDescription}
            onChange={(e) => {
              setMetaDescription(e.target.value);
              onUpdate({ metaDescription: e.target.value });
            }}
            className="w-full bg-surface-3 border-white/10 rounded-lg px-3 py-2 text-ivory text-xs focus:ring-2 focus:ring-cyan/40 focus:border-transparent transition-all outline-none resize-none h-16"
            placeholder="Descripción para SEO (opcional)"
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Keywords</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              className="flex-1 bg-surface-3 border-white/10 rounded-lg px-3 py-2 text-ivory text-xs focus:ring-2 focus:ring-cyan/40 focus:border-transparent transition-all outline-none"
              placeholder="Agregar keyword..."
            />
            <button
              onClick={addKeyword}
              className="px-3 py-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan-300 hover:bg-cyan/20 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan-300 text-xs"
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="hover:text-cyan-100"
                >
                  <XCircle size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dietary Restrictions Section */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 pb-2">
          <div className="p-2 bg-emerald/10 rounded-lg">
            <Type size={16} className="text-emerald-400" />
          </div>
          <h4 className="text-sm font-bold text-ivory uppercase tracking-widest">Restricciones Dietéticas</h4>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {DIETARY_RESTRICTION_OPTIONS.map((option) => {
            const isSelected = dietaryRestrictions.includes(option.value as any);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleDietaryRestriction(option.value as any)}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  isSelected
                    ? option.color
                    : 'bg-white/5 border-white/10 text-muted hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Section */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 pb-2">
          <div className="p-2 bg-gold/10 rounded-lg">
            <Clock size={16} className="text-gold" />
          </div>
          <h4 className="text-sm font-bold text-ivory uppercase tracking-widest">Disponibilidad</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Hora Inicio</label>
            <input
              type="time"
              value={availableHours.start}
              onChange={(e) => setAvailableHours({ ...availableHours, start: e.target.value })}
              className="w-full bg-surface-3 border-white/10 rounded-lg px-3 py-2 text-ivory text-xs focus:ring-2 focus:ring-gold/40 focus:border-transparent transition-all outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Hora Fin</label>
            <input
              type="time"
              value={availableHours.end}
              onChange={(e) => setAvailableHours({ ...availableHours, end: e.target.value })}
              className="w-full bg-surface-3 border-white/10 rounded-lg px-3 py-2 text-ivory text-xs focus:ring-2 focus:ring-gold/40 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2 block">Días Disponibles</label>
          <div className="flex gap-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`flex-1 py-2 rounded-lg border transition-all text-xs font-semibold ${
                  availableDays.includes(day)
                    ? 'bg-gold/10 border-gold/30 text-gold-300'
                    : 'bg-white/5 border-white/10 text-muted hover:border-white/20'
                }`}
              >
                {dayLabels[day as keyof typeof dayLabels]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet/10 rounded-lg">
              <ImageIcon size={16} className="text-violet-400" />
            </div>
            <h4 className="text-sm font-bold text-ivory uppercase tracking-widest">Galería de Imágenes</h4>
            <span className="text-xs text-muted font-semibold bg-surface-3 px-2 py-1 rounded-full">
              {gallery.length} imagen{gallery.length !== 1 ? 'es' : ''}
            </span>
          </div>
          <label className="flex items-center gap-1 px-3 py-2 rounded-lg bg-violet/10 border border-violet/30 text-violet-300 text-xs hover:bg-violet/20 transition-colors cursor-pointer">
            {galleryUploading ? (
              <>
                <div className="w-3 h-3 border-2 border-violet-300/30 border-t-violet-300 rounded-full animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={12} />
                Agregar
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addGalleryImage(e.target.files)}
              disabled={galleryUploading}
              className="hidden"
            />
          </label>
        </div>
        {galleryUploadError && (
          <div className="flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle size={12} />
            <span>{galleryUploadError}</span>
          </div>
        )}
        
        {gallery.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img.url}
                  alt={`Gallery ${idx}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <button
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red/10 border border-red/30 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted text-center py-4">No hay imágenes en la galería</p>
        )}
      </div>

      {/* Preview Section */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan/10 rounded-lg">
              <Eye size={16} className="text-cyan-400" />
            </div>
            <h4 className="text-sm font-bold text-ivory uppercase tracking-widest">Vista Previa</h4>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold uppercase tracking-wider transition-colors"
          >
            {showPreview ? 'Ocultar' : 'Ver'}
          </button>
        </div>
        
        {showPreview && (
          <IdentityPreview menu={menu} />
        )}
      </div>
    </div>
  );
}

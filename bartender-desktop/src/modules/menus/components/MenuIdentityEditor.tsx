"use client";

import { useState } from "react";
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
  const [, setImageFile] = useState<File | null>(null);
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
    { value: "vegan", label: "Vegano" },
    { value: "vegetarian", label: "Vegetariano" },
    { value: "gluten-free", label: "Sin Gluten" },
    { value: "dairy-free", label: "Sin Lácteos" },
    { value: "nut-free", label: "Sin Frutos Secos" },
    { value: "sugar-free", label: "Sin Azúcar" },
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

      const progressInterval = setInterval(() => {
        setImageUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const { uploadImage } = await import("../../../services/uploadService");
      const result = await uploadImage(file, {
        folder: "bartender/menus",
        transformation: [{ width: 1200, height: 630, crop: "fill" }],
      });

      clearInterval(progressInterval);
      setImageUploadProgress(100);

      onUpdate({
        image: result.url,
        imagePublicId: result.publicId,
        imageFile: file,
      });

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setUploadError(error.message || "Error al subir la imagen");
    } finally {
      setImageUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
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
  };

  const addGalleryImage = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setGalleryUploading(true);
      setGalleryUploadError(null);

      const fileArray = Array.from(files);
      const uploadResults = await uploadMultipleImages(fileArray, {
        folder: "bartender/menus/gallery",
      });

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
    <div className="p-6 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#30363D]">
        <div className="p-2 bg-[rgba(240,180,41,0.12)] text-[#F0B429] rounded-xl">
          <Type size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider">
            Identidad de la Carta
          </h3>
          <p className="text-xs text-[#8B949E]">
            Personaliza el nombre, tipo, descripción y portada de tu carta digital
          </p>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
            Nombre de la Carta <span className="text-[#F85149]">*</span>
          </label>
          {name.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#3FB950]">
              <CheckCircle2 size={12} /> Válido
            </span>
          )}
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            onUpdate({ name: e.target.value });
          }}
          className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:border-[#F0B429] focus:ring-1 focus:ring-[#F0B429] transition-all outline-none"
          placeholder="Ej: Carta Nebula Signature"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
            Descripción
          </label>
          <span className="text-xs text-[#8B949E]">{description.length}/500</span>
        </div>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            onUpdate({ description: e.target.value });
          }}
          className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:border-[#F0B429] focus:ring-1 focus:ring-[#F0B429] transition-all outline-none resize-none h-20"
          placeholder="Describe la propuesta gastronómica o coctelera de esta carta..."
        />
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
          Tipo de Carta
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "drink", label: "Bebidas & Bar" },
            { value: "food", label: "Cocina & Gastronomía" },
            { value: "mixed", label: "Carta Mixta" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setType(opt.value as any);
                onUpdate({ type: opt.value as any });
              }}
              className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                type === opt.value
                  ? "bg-[#21283A] border-[#F0B429] text-[#F0B429] shadow-sm"
                  : "bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cover Image Upload */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
          Imagen de Portada
        </label>
        <div
          className={`relative group cursor-pointer border-2 border-dashed rounded-xl overflow-hidden aspect-[16/7] flex flex-col items-center justify-center transition-all ${
            isDragging
              ? "border-[#F0B429] bg-[rgba(240,180,41,0.05)]"
              : "border-[#30363D] hover:border-[#F0B429]/60 bg-[#0D1117]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {imageUploading ? (
            <div className="relative z-10 flex flex-col items-center text-[#F0B429]">
              <Loader2 size={28} className="mb-2 animate-spin" />
              <p className="text-xs font-semibold">Subiendo portada...</p>
              <div className="w-32 h-1.5 bg-[#161B22] rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#F0B429] transition-all duration-300"
                  style={{ width: `${imageUploadProgress}%` }}
                />
              </div>
            </div>
          ) : uploadSuccess ? (
            <div className="relative z-10 flex flex-col items-center text-[#3FB950]">
              <CheckCircle2 size={28} className="mb-1" />
              <p className="text-xs font-semibold">¡Imagen subida con éxito!</p>
            </div>
          ) : imagePreview || menu.image ? (
            <>
              <img
                src={imagePreview || menu.image}
                alt="Portada de carta"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="relative z-10 flex flex-col items-center p-3 rounded-xl bg-black/60 backdrop-blur-xs text-[#E6EDF3] border border-[#30363D]">
                <ImageIcon size={20} className="mb-1 text-[#F0B429]" />
                <p className="text-xs font-semibold">Clic para cambiar imagen</p>
                <p className="text-xs text-[#8B949E]">o arrastra una nueva imagen</p>
              </div>
            </>
          ) : (
            <div className="relative z-10 flex flex-col items-center text-[#8B949E] group-hover:text-[#E6EDF3] p-4 text-center">
              <div className="p-3 bg-[#161B22] border border-[#30363D] rounded-full mb-2">
                <Upload size={20} className="text-[#F0B429]" />
              </div>
              <p className="text-xs font-semibold text-[#E6EDF3]">Arrastra una imagen aquí</p>
              <p className="text-xs text-[#8B949E]">o haz clic para explorar tus archivos</p>
              <p className="text-xs text-[#8B949E]/70 mt-1">PNG, JPG, WebP hasta 5MB</p>
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
          <div className="flex items-center gap-1.5 text-[#F85149] text-xs">
            <AlertCircle size={13} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-3 pt-4 border-t border-[#30363D]">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
          Restricciones Dietéticas Generales
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {DIETARY_RESTRICTION_OPTIONS.map((option) => {
            const isSelected = dietaryRestrictions.includes(option.value as any);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleDietaryRestriction(option.value as any)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[rgba(63,185,80,0.12)] border-[rgba(63,185,80,0.40)] text-[#3FB950]"
                    : "bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Schedule */}
      <div className="space-y-3 pt-4 border-t border-[#30363D]">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#F0B429]" />
          <label className="text-xs font-semibold text-[#E6EDF3] uppercase tracking-wider">
            Horarios y Días Habilitados
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-[#8B949E] block mb-1">Hora Inicio</span>
            <input
              type="time"
              value={availableHours.start}
              onChange={(e) => setAvailableHours({ ...availableHours, start: e.target.value })}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-[#E6EDF3] focus:border-[#F0B429] outline-none"
            />
          </div>
          <div>
            <span className="text-xs text-[#8B949E] block mb-1">Hora Fin</span>
            <input
              type="time"
              value={availableHours.end}
              onChange={(e) => setAvailableHours({ ...availableHours, end: e.target.value })}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-[#E6EDF3] focus:border-[#F0B429] outline-none"
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-[#8B949E] block mb-2">Días Activos</span>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                  availableDays.includes(day)
                    ? "bg-[#21283A] border-[#F0B429] text-[#F0B429]"
                    : "bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]"
                }`}
              >
                {dayLabels[day as keyof typeof dayLabels]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="space-y-3 pt-4 border-t border-[#30363D]">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#388BFD]" />
          <h4 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">
            Metadatos y SEO
          </h4>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => {
              setMetaTitle(e.target.value);
              onUpdate({ metaTitle: e.target.value });
            }}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:border-[#F0B429] outline-none"
            placeholder="Meta Title (para Google y redes sociales)"
          />
          <textarea
            value={metaDescription}
            onChange={(e) => {
              setMetaDescription(e.target.value);
              onUpdate({ metaDescription: e.target.value });
            }}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:border-[#F0B429] outline-none resize-none h-14"
            placeholder="Meta Description..."
          />
        </div>
      </div>
    </div>
  );
}

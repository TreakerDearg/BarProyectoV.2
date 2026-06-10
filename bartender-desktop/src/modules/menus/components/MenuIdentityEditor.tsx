"use client";

import { useState } from "react";
import { Type, Image as ImageIcon, Globe, Clock, Plus, XCircle, X, AlertCircle } from "lucide-react";
import type { Menu } from "../../../types/menu";
import { validateImageFile } from "../../../services/uploadService";

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

  const toggleDay = (day: string) => {
    const newDays = availableDays.includes(day)
      ? availableDays.filter(d => d !== day)
      : [...availableDays, day];
    setAvailableDays(newDays);
    onUpdate({ availableDays: newDays });
  };

  const addGalleryImage = (url: string) => {
    const newGallery = [...gallery, { url, publicId: "", order: gallery.length }];
    setGallery(newGallery);
    onUpdate({ gallery: newGallery });
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
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
          Nombre de la Carta
        </label>
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
      </div>

      {/* Description */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            onUpdate({ description: e.target.value });
          }}
          className="w-full bg-surface-3 border-white/10 rounded-lg px-4 py-3 text-ivory focus:ring-2 focus:ring-violet/40 focus:border-transparent transition-all outline-none resize-none h-24"
          placeholder="Descripción breve de la carta..."
        />
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
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
          Imagen de Portada
        </label>
        <div className="relative group cursor-pointer border-2 border-dashed border-white/10 rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center hover:border-violet/40 transition-colors">
          {(imagePreview || menu.image) ? (
            <>
              <img
                src={imagePreview || menu.image}
                alt="Menu preview"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="relative z-10 flex flex-col items-center text-muted group-hover:text-violet-300">
                <ImageIcon size={32} className="mb-2" />
                <p className="text-sm font-medium">Click to replace image</p>
              </div>
            </>
          ) : (
            <div className="relative z-10 flex flex-col items-center text-muted group-hover:text-violet-300">
              <ImageIcon size={32} className="mb-2" />
              <p className="text-sm font-medium">Click to upload image</p>
              <p className="text-[10px] mt-1 opacity-60">PNG, JPG, WebP up to 5MB</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Validate file
                const validation = validateImageFile(file);
                if (!validation.isValid) {
                  setUploadError(validation.error || "Error de validación");
                  return;
                }

                setUploadError(null);
                setImageFile(file);
                
                // Create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
                
                // Notify parent about the new image file
                onUpdate({ imageFile: file });
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        {uploadError && (
          <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle size={12} />
            <span>{uploadError}</span>
          </div>
        )}
        {imageFile && (
          <div className="mt-2 flex items-center gap-2 text-violet-400 text-xs">
            <span>Imagen seleccionada: {imageFile.name}</span>
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="text-red-400 hover:text-red-300"
            >
              <XCircle size={12} />
            </button>
          </div>
        )}
      </div>

      {/* SEO Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-cyan-400" />
          <h4 className="text-xs font-bold text-ivory uppercase tracking-widest">SEO</h4>
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

      {/* Availability Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gold" />
          <h4 className="text-xs font-bold text-ivory uppercase tracking-widest">Disponibilidad</h4>
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
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-violet-400" />
            <h4 className="text-xs font-bold text-ivory uppercase tracking-widest">Galería</h4>
          </div>
          <button
            onClick={() => {
              const url = prompt("URL de la imagen:");
              if (url) addGalleryImage(url);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet/10 border border-violet/30 text-violet-300 text-xs hover:bg-violet/20 transition-colors"
          >
            <Plus size={12} />
            Agregar
          </button>
        </div>
        
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
    </div>
  );
}

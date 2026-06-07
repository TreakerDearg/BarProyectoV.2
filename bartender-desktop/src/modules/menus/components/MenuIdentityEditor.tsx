"use client";

import { useState } from "react";
import { Type, Image as ImageIcon, Save, X } from "lucide-react";
import type { Menu } from "../../../types/menu";

interface Props {
  menu: Menu;
  onUpdate: (updates: Partial<Menu>) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function MenuIdentityEditor({ menu, onUpdate, onSave, onCancel }: Props) {
  const [name, setName] = useState(menu.name || "");
  const [description, setDescription] = useState(menu.description || "");
  const [type, setType] = useState(menu.type || "mixed");
  const [image, setImage] = useState(menu.image || "");

  const handleSave = () => {
    onUpdate({ name, description, type, image });
    onSave?.();
  };

  const handleCancel = () => {
    setName(menu.name || "");
    setDescription(menu.description || "");
    setType(menu.type || "mixed");
    setImage(menu.image || "");
    onCancel?.();
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
          onChange={(e) => setName(e.target.value)}
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
          onChange={(e) => setDescription(e.target.value)}
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
              onClick={() => setType(opt.value as any)}
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
          {image ? (
            <>
              <img
                src={image}
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
              <p className="text-[10px] mt-1 opacity-60">PNG, JPG up to 10MB</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImage(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/5">
        {onCancel && (
          <button
            onClick={handleCancel}
            className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <X size={16} className="text-muted" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted">Cancelar</span>
          </button>
        )}
        {onSave && (
          <button
            onClick={handleSave}
            className="flex-1 h-12 rounded-xl bg-violet/10 border border-violet/30 flex items-center justify-center gap-2 hover:bg-violet/20 transition-all"
          >
            <Save size={16} className="text-violet-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-violet-300">Guardar</span>
          </button>
        )}
      </div>
    </div>
  );
}

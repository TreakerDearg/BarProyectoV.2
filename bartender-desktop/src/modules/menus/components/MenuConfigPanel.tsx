"use client";

import { useState } from "react";
import { Settings, ToggleLeft, ToggleRight, Globe, Star, DollarSign, CheckCircle2 } from "lucide-react";
import type { Menu } from "../../../types/menu";
import MenuAvailabilityEditor from "./MenuAvailabilityEditor";

interface Props {
  menu: Menu;
  onUpdate: (updates: Partial<Menu>) => void;
}

export default function MenuConfigPanel({ menu, onUpdate }: Props) {
  const [active, setActive] = useState(menu.active ?? true);
  const [isPublic, setIsPublic] = useState(menu.isPublic ?? false);
  const [featured, setFeatured] = useState(menu.featured ?? false);
  const [color, setColor] = useState(menu.color || "#8B5CF6");
  const [slug, setSlug] = useState(menu.slug || "");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Promotion
  const [promotedUntil, setPromotedUntil] = useState(
    menu.promotedUntil || ""
  );
  
  // Pricing
  const [minPrice, setMinPrice] = useState(menu.minPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(menu.maxPrice?.toString() || "");

  const handleToggle = (key: keyof Menu, value: any) => {
    onUpdate({ [key]: value });
    // Show success feedback
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  return (
    <div className="nebula-panel p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500/10 rounded-xl">
          <Settings className="text-cyan-300" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Configuración</h3>
        {saveSuccess && (
          <div className="flex items-center gap-1 text-emerald-400 text-[10px] animate-in fade-in duration-300">
            <CheckCircle2 size={10} />
            <span>Guardado</span>
          </div>
        )}
      </div>

      {/* Visibility Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2">
          <div className="p-2 bg-emerald/10 rounded-lg">
            <Globe size={16} className="text-emerald-400" />
          </div>
          <h4 className="text-xs font-bold text-ivory uppercase tracking-widest">Visibilidad</h4>
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between p-4 bg-surface-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${active ? 'bg-emerald-500/10' : 'bg-red/10'}`}>
              {active ? (
                <ToggleRight className="text-emerald-400" size={20} />
              ) : (
                <ToggleLeft className="text-red-400" size={20} />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-ivory">Estado Activo</p>
              <p className="text-[10px] text-muted">
                {active ? "La carta está visible en el sistema" : "La carta está oculta"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActive(!active);
              handleToggle('active', !active);
            }}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              active ? 'bg-emerald-500/20' : 'bg-red/20'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full transition-transform ${
                active ? 'left-7 bg-emerald-400' : 'left-1 bg-red-400'
              }`}
            />
          </button>
        </div>

        {/* Public Status */}
        <div className="flex items-center justify-between p-4 bg-surface-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isPublic ? 'bg-cyan/10' : 'bg-surface-2'}`}>
              <Globe className={isPublic ? 'text-cyan-400' : 'text-muted'} size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ivory">Público</p>
              <p className="text-[10px] text-muted">
                {isPublic ? "Visible para todos los usuarios" : "Solo visible para administradores"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsPublic(!isPublic);
              handleToggle('isPublic', !isPublic);
            }}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isPublic ? 'bg-cyan/20' : 'bg-surface-2'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full transition-transform ${
                isPublic ? 'left-7 bg-cyan-400' : 'left-1 bg-muted'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Featured Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2">
          <div className="p-2 bg-gold/10 rounded-lg">
            <Star size={16} className="text-gold" />
          </div>
          <h4 className="text-xs font-bold text-ivory uppercase tracking-widest">Destacados</h4>
        </div>

        {/* Featured Status */}
        <div className="flex items-center justify-between p-4 bg-surface-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${featured ? 'bg-gold/10' : 'bg-surface-2'}`}>
              <Star className={featured ? 'text-gold-400' : 'text-muted'} size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ivory">Destacado</p>
              <p className="text-[10px] text-muted">
                {featured ? "Mostrar en sección destacada" : "No destacar"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFeatured(!featured);
              handleToggle('featured', !featured);
            }}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              featured ? 'bg-gold/20' : 'bg-surface-2'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full transition-transform ${
                featured ? 'left-7 bg-gold-400' : 'left-1 bg-muted'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
          Color de Tema
        </label>
        <div className="flex gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              onUpdate({ color: e.target.value });
            }}
            className="w-16 h-12 rounded-lg border border-white/10 cursor-pointer bg-surface-3"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              onUpdate({ color: e.target.value });
            }}
            className="flex-1 bg-surface-3 border-white/10 rounded-lg px-4 py-3 text-ivory font-mono focus:ring-2 focus:ring-cyan/40 focus:border-transparent transition-all outline-none"
            placeholder="#8B5CF6"
          />
        </div>
        <div className="flex gap-2 mt-3">
          {["#8B5CF6", "#06B6D4", "#F59E0B", "#10B981", "#EF4444"].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setColor(preset);
                onUpdate({ color: preset });
              }}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                color === preset ? 'border-white scale-110' : 'border-transparent hover:border-white/30'
              }`}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </div>

      {/* Slug */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
          URL Slug (Opcional)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">/menu/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
              setSlug(newSlug);
              onUpdate({ slug: newSlug });
            }}
            className="w-full bg-surface-3 border-white/10 rounded-lg pl-16 pr-4 py-3 text-ivory font-mono focus:ring-2 focus:ring-cyan/40 focus:border-transparent transition-all outline-none"
            placeholder="carta-cocteles"
          />
        </div>
        <p className="text-[10px] text-muted mt-2 ml-1">
          Identificador único para enlaces públicos
        </p>
      </div>

      {/* Availability Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <MenuAvailabilityEditor
          availableHours={menu.availableHours || null}
          availableDays={menu.availableDays || []}
          onHoursChange={(hours) => onUpdate({ availableHours: hours })}
          onDaysChange={(days) => onUpdate({ availableDays: days })}
        />
      </div>

      {/* Promotion Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-gold" />
          <h4 className="text-xs font-bold text-ivory uppercase tracking-widest">Promoción</h4>
        </div>
        
        <div>
          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Promocionado hasta</label>
          <input
            type="date"
            value={promotedUntil}
            onChange={(e) => {
              setPromotedUntil(e.target.value);
              onUpdate({ promotedUntil: e.target.value || undefined });
            }}
            className="w-full bg-surface-3 border-white/10 rounded-lg px-3 py-2 text-ivory text-xs focus:ring-2 focus:ring-gold/40 focus:border-transparent transition-all outline-none"
          />
          <p className="text-[10px] text-muted mt-1">Formato: YYYY-MM-DD (dejar vacío para promoción permanente)</p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-emerald-400" />
          <h4 className="text-xs font-bold text-ivory uppercase tracking-widest">Rango de Precios</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Precio Mínimo</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                onUpdate({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined });
              }}
              className="w-full bg-surface-3 border-white/10 rounded-lg px-3 py-2 text-ivory text-xs focus:ring-2 focus:ring-emerald/40 focus:border-transparent transition-all outline-none"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Precio Máximo</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                onUpdate({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined });
              }}
              className="w-full bg-surface-3 border-white/10 rounded-lg px-3 py-2 text-ivory text-xs focus:ring-2 focus:ring-emerald/40 focus:border-transparent transition-all outline-none"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted">Calculado automáticamente basado en productos (opcional sobrescribir)</p>
      </div>
    </div>
  );
}

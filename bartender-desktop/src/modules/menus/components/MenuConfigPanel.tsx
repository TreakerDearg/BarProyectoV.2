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
  const [color, setColor] = useState(menu.color || "#F0B429");
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
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#30363D]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(240,180,41,0.12)] text-[#F0B429] rounded-xl">
            <Settings size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider">
              Configuración y Parámetros
            </h3>
            <p className="text-xs text-[#8B949E]">
              Control de visibilidad en salón, acceso público, enlaces y rangos
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(63,185,80,0.15)] border border-[rgba(63,185,80,0.30)] text-[#3FB950] text-xs font-semibold animate-in fade-in duration-300">
            <CheckCircle2 size={13} />
            <span>Actualizado</span>
          </div>
        )}
      </div>

      {/* Visibility Toggles */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
          Visibilidad y Publicación
        </label>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 bg-[#0D1117] rounded-xl border border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${active ? 'bg-[rgba(63,185,80,0.15)] text-[#3FB950]' : 'bg-[#21283A] text-[#8B949E]'}`}>
              {active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </div>
            <div>
              <p className="text-xs font-bold text-[#E6EDF3]">Carta Activa en Salón</p>
              <p className="text-xs text-[#8B949E]">
                {active ? "Visible para pedidos y personal de salón" : "Oculta temporalmente en salón"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !active;
              setActive(next);
              handleToggle('active', next);
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              active ? 'bg-[#3FB950]' : 'bg-[#30363D]'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                active ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Public Toggle */}
        <div className="flex items-center justify-between p-4 bg-[#0D1117] rounded-xl border border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isPublic ? 'bg-[rgba(240,180,41,0.15)] text-[#F0B429]' : 'bg-[#21283A] text-[#8B949E]'}`}>
              <Globe size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#E6EDF3]">Acceso Público (QR Web)</p>
              <p className="text-xs text-[#8B949E]">
                {isPublic ? "Cualquier comensal puede verla escaneando el código QR" : "Solo visible internamente en el sistema"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !isPublic;
              setIsPublic(next);
              handleToggle('isPublic', next);
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isPublic ? 'bg-[#F0B429]' : 'bg-[#30363D]'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                isPublic ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center justify-between p-4 bg-[#0D1117] rounded-xl border border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${featured ? 'bg-[rgba(240,180,41,0.15)] text-[#F0B429]' : 'bg-[#21283A] text-[#8B949E]'}`}>
              <Star size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#E6EDF3]">Carta Destacada</p>
              <p className="text-xs text-[#8B949E]">
                {featured ? "Prioridad en terminales táctiles y menú de bienvenida" : "Visualización estándar"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !featured;
              setFeatured(next);
              handleToggle('featured', next);
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              featured ? 'bg-[#F0B429]' : 'bg-[#30363D]'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                featured ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* URL Slug */}
      <div className="space-y-1.5 pt-4 border-t border-[#30363D]">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
          URL Slug Pública
        </label>
        <div className="flex items-center bg-[#0D1117] border border-[#30363D] rounded-xl overflow-hidden focus-within:border-[#F0B429]">
          <span className="px-3 text-xs text-[#8B949E] bg-[#161B22] border-r border-[#30363D] py-2.5">
            /menu/
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
              setSlug(newSlug);
              onUpdate({ slug: newSlug });
            }}
            className="flex-1 px-3 py-2.5 text-xs text-[#E6EDF3] bg-transparent outline-none font-mono"
            placeholder="carta-principal"
          />
        </div>
        <p className="text-xs text-[#8B949E]">
          Identificador amigable para el enlace directo de clientes
        </p>
      </div>

      {/* Theme Color */}
      <div className="space-y-2 pt-4 border-t border-[#30363D]">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
          Color Distintivo de la Carta
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              onUpdate({ color: e.target.value });
            }}
            className="w-12 h-10 rounded-xl border border-[#30363D] cursor-pointer bg-[#0D1117]"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              onUpdate({ color: e.target.value });
            }}
            className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-[#E6EDF3] font-mono outline-none focus:border-[#F0B429]"
          />
        </div>
        <div className="flex gap-2">
          {["#F0B429", "#3FB950", "#388BFD", "#FF7B54", "#A371F7", "#58A6FF"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setColor(preset);
                onUpdate({ color: preset });
              }}
              className={`w-7 h-7 rounded-lg border-2 transition-all ${
                color === preset ? 'border-white scale-110 shadow-sm' : 'border-transparent hover:border-[#8B949E]'
              }`}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </div>

      {/* Availability Editor component */}
      <div className="pt-4 border-t border-[#30363D]">
        <MenuAvailabilityEditor
          availableHours={menu.availableHours || null}
          availableDays={menu.availableDays || []}
          onHoursChange={(hours) => onUpdate({ availableHours: hours })}
          onDaysChange={(days) => onUpdate({ availableDays: days })}
        />
      </div>

      {/* Pricing Range */}
      <div className="space-y-3 pt-4 border-t border-[#30363D]">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-[#3FB950]" />
          <h4 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">
            Rango de Precios Referencial
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-[#8B949E] block mb-1">Precio Mínimo</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                onUpdate({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined });
              }}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-[#E6EDF3] focus:border-[#F0B429] outline-none"
              placeholder="0.00"
              step="1"
            />
          </div>
          <div>
            <span className="text-xs text-[#8B949E] block mb-1">Precio Máximo</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                onUpdate({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined });
              }}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-[#E6EDF3] focus:border-[#F0B429] outline-none"
              placeholder="0.00"
              step="1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

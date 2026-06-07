"use client";

import { useState } from "react";
import { Settings, ToggleLeft, ToggleRight, Calendar, Globe, Save, X } from "lucide-react";
import type { Menu } from "../../../types/menu";

interface Props {
  menu: Menu;
  onUpdate: (updates: Partial<Menu>) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function MenuConfigPanel({ menu, onUpdate, onSave, onCancel }: Props) {
  const [active, setActive] = useState(menu.active ?? true);
  const [isPublic, setIsPublic] = useState(menu.isPublic ?? false);
  const [color, setColor] = useState(menu.color || "#8B5CF6");
  const [slug, setSlug] = useState(menu.slug || "");

  const handleSave = () => {
    onUpdate({ active, isPublic, color, slug });
    onSave?.();
  };

  const handleCancel = () => {
    setActive(menu.active ?? true);
    setIsPublic(menu.isPublic ?? false);
    setColor(menu.color || "#8B5CF6");
    setSlug(menu.slug || "");
    onCancel?.();
  };

  return (
    <div className="nebula-panel p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500/10 rounded-xl">
          <Settings className="text-cyan-300" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Configuración</h3>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between p-4 bg-surface-3 rounded-xl border border-white/5">
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
          onClick={() => setActive(!active)}
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
      <div className="flex items-center justify-between p-4 bg-surface-3 rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isPublic ? 'bg-violet-500/10' : 'bg-surface-2'}`}>
            <Globe className={isPublic ? 'text-violet-300' : 'text-muted'} size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ivory">Público</p>
            <p className="text-[10px] text-muted">
              {isPublic ? "Visible para clientes externos" : "Solo uso interno"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsPublic(!isPublic)}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            isPublic ? 'bg-violet-500/20' : 'bg-surface-2'
          }`}
        >
          <div
            className={`absolute top-1 w-6 h-6 rounded-full transition-transform ${
              isPublic ? 'left-7 bg-violet-300' : 'left-1 bg-muted'
            }`}
          />
        </button>
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
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-12 rounded-lg border border-white/10 cursor-pointer bg-surface-3"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1 bg-surface-3 border-white/10 rounded-lg px-4 py-3 text-ivory font-mono focus:ring-2 focus:ring-cyan/40 focus:border-transparent transition-all outline-none"
            placeholder="#8B5CF6"
          />
        </div>
        <div className="flex gap-2 mt-3">
          {["#8B5CF6", "#06B6D4", "#F59E0B", "#10B981", "#EF4444"].map((preset) => (
            <button
              key={preset}
              onClick={() => setColor(preset)}
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
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            className="w-full bg-surface-3 border-white/10 rounded-lg pl-16 pr-4 py-3 text-ivory font-mono focus:ring-2 focus:ring-cyan/40 focus:border-transparent transition-all outline-none"
            placeholder="carta-cocteles"
          />
        </div>
        <p className="text-[10px] text-muted mt-2 ml-1">
          Identificador único para enlaces públicos
        </p>
      </div>

      {/* Schedule Placeholder */}
      <div className="p-4 bg-surface-3 rounded-xl border border-dashed border-white/10">
        <div className="flex items-center gap-3">
          <Calendar className="text-muted" size={20} />
          <div>
            <p className="text-sm font-semibold text-ivory">Horario (Próximamente)</p>
            <p className="text-[10px] text-muted">Configuración de disponibilidad por horario</p>
          </div>
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
            className="flex-1 h-12 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center gap-2 hover:bg-cyan/20 transition-all"
          >
            <Save size={16} className="text-cyan-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">Guardar</span>
          </button>
        )}
      </div>
    </div>
  );
}

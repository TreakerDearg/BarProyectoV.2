"use client";

import { useState } from "react";
import { Martini, Utensils, Layers, Copy, Check, Plus, Coffee, Sun, Clock, Star, Edit2, Eye } from "lucide-react";
import type { Menu } from "../../../types/menu";
import { createMenu } from "../../../services/menuService";

interface Props {
  onMenuCreated: (menu: Menu) => void;
  onCancel: () => void;
  onCreateEmpty?: () => void;
}

const TEMPLATES = [
  {
    id: "drinks",
    name: "Carta de Bebidas",
    icon: <Martini size={20} />,
    description: "Plantilla para bares y coctelería",
    type: "drink" as const,
    categories: [
      { name: "Cócteles Clásicos", products: [] },
      { name: "Cócteles de Autor", products: [] },
      { name: "Vinos", products: [] },
      { name: "Cervezas", products: [] },
      { name: "Sin Alcohol", products: [] },
    ]
  },
  {
    id: "food",
    name: "Carta de Comida",
    icon: <Utensils size={20} />,
    description: "Plantilla para restaurantes",
    type: "food" as const,
    categories: [
      { name: "Entradas", products: [] },
      { name: "Platos Fuertes", products: [] },
      { name: "Postres", products: [] },
      { name: "Bebidas", products: [] },
    ]
  },
  {
    id: "mixed",
    name: "Carta Mixta",
    icon: <Layers size={20} />,
    description: "Plantilla para bares con comida",
    type: "mixed" as const,
    categories: [
      { name: "Cócteles", products: [] },
      { name: "Tapas", products: [] },
      { name: "Platos Fuertes", products: [] },
      { name: "Postres", products: [] },
    ]
  },
  {
    id: "brunch",
    name: "Brunch",
    icon: <Coffee size={20} />,
    description: "Plantilla para cafeterías y brunch",
    type: "food" as const,
    categories: [
      { name: "Cafés y Tés", products: [] },
      { name: "Desayunos", products: [] },
      { name: "Brunch", products: [] },
      { name: "Postres", products: [] },
    ]
  },
  {
    id: "happy-hour",
    name: "Happy Hour",
    icon: <Sun size={20} />,
    description: "Plantilla para happy hour y promociones",
    type: "drink" as const,
    categories: [
      { name: "2x1 Cócteles", products: [] },
      { name: "Promociones", products: [] },
      { name: "Snacks", products: [] },
      { name: "Cervezas", products: [] },
    ]
  },
  {
    id: "late-night",
    name: "Late Night",
    icon: <Clock size={20} />,
    description: "Plantilla para servicio nocturno",
    type: "mixed" as const,
    categories: [
      { name: "Cócteles Nocturnos", products: [] },
      { name: "Comida Tardía", products: [] },
      { name: "Shots", products: [] },
    ]
  },
];

export default function MenuTemplates({ onMenuCreated, onCancel, onCreateEmpty }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [customName, setCustomName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('favorite_templates');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorite_templates', JSON.stringify([...newFavorites]));
  };

  const handleUseTemplate = async (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    try {
      setCreating(true);
      const newMenu = await createMenu({
        name: customName || template.name,
        description: template.description,
        type: template.type,
        active: true,
        categories: template.categories,
      }, { allowEmptyCategories: true });
      setCreated(true);
      setTimeout(() => {
        onMenuCreated(newMenu);
      }, 500);
    } catch (err) {
      console.error("Error creating menu from template", err);
      alert("Error al crear la carta: " + (err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const selectedTemplateData = TEMPLATES.find(t => t.id === selectedTemplate);

  if (created) {
    return (
      <div className="nebula-discounts-panel p-6 rounded-3xl text-center">
        <div className="p-4 bg-emerald/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-ivory mb-2">¡Carta Creada!</h3>
        <p className="text-sm text-muted">Tu nueva carta está lista para personalizar</p>
      </div>
    );
  }

  return (
    <div className="nebula-discounts-panel p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet/10 rounded-xl">
            <Layers size={20} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Crear Nueva Carta</h3>
            <p className="text-xs text-muted">Elige cómo comenzar</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          onClick={onCreateEmpty}
          className="p-6 rounded-2xl border border-dashed border-violet/40 bg-violet/5 hover:bg-violet/10 transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-violet/20">
              <Plus size={20} className="text-violet-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ivory">Crear desde Cero</h4>
              <p className="text-[10px] text-muted">Menú vacío para personalizar</p>
            </div>
          </div>
          <p className="text-[10px] text-muted/70">Empieza con una carta en blanco y añade tus categorías y productos</p>
        </button>

        <button
          onClick={() => setSelectedTemplate("custom")}
          className={`p-6 rounded-2xl border transition-all text-left ${
            selectedTemplate === "custom" 
              ? 'bg-violet/10 border-violet/40' 
              : 'bg-white/5 border-white/10 hover:border-violet/30 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-3 rounded-xl ${selectedTemplate === "custom" ? 'bg-violet/20' : 'bg-white/10'}`}>
              <Copy size={20} className="text-violet-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ivory">Usar Plantilla</h4>
              <p className="text-[10px] text-muted">Estructura predefinida</p>
            </div>
          </div>
          <p className="text-[10px] text-muted/70">Elige una plantilla con categorías ya configuradas</p>
        </button>
      </div>

      {/* Favorites Section */}
      {favorites.size > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star size={12} className="text-gold" />
            Favoritos
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TEMPLATES.filter(t => favorites.has(t.id)).map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  selectedTemplate === template.id
                    ? 'bg-gold/10 border-gold/40'
                    : 'bg-white/5 border-white/10 hover:border-gold/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${selectedTemplate === template.id ? 'bg-gold/20' : 'bg-white/10'}`}>
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-ivory truncate">{template.name}</h4>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTemplate === "custom" && (
        <>
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Selecciona una plantilla</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`
                    relative p-4 rounded-2xl border transition-all text-left
                    ${selectedTemplate === template.id
                      ? 'bg-violet/10 border-violet/40'
                      : 'bg-white/5 border-white/10 hover:border-violet/30 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedTemplate === template.id ? 'bg-violet/20' : 'bg-white/10'}`}>
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-ivory">{template.name}</h4>
                        <p className="text-[10px] text-muted">{template.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(template.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        favorites.has(template.id) 
                          ? 'text-gold hover:text-gold/80' 
                          : 'text-muted/50 hover:text-muted'
                      }`}
                    >
                      <Star size={14} fill={favorites.has(template.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {template.categories.slice(0, 4).map((cat) => (
                      <div key={cat.name} className="text-[10px] text-muted/70 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-violet/40" />
                        {cat.name}
                      </div>
                    ))}
                    {template.categories.length > 4 && (
                      <div className="text-[10px] text-muted/50 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-violet/40" />
                        +{template.categories.length - 4} más
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedTemplate && selectedTemplate !== "custom" && (
            <>
              {/* Customization Section */}
              <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Edit2 size={14} className="text-violet-400" />
                  <p className="text-xs font-semibold text-ivory uppercase tracking-wider">Personalizar</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1.5 block">Nombre de la carta</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={selectedTemplateData?.name || "Nombre personalizado"}
                      className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-ivory text-xs focus:outline-none focus:border-violet/40 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 text-[10px] text-violet-400 hover:text-violet-300 font-semibold uppercase tracking-wider transition-colors"
                  >
                    <Eye size={12} />
                    {showPreview ? 'Ocultar' : 'Ver'} Preview
                  </button>
                </div>
              </div>

              {/* Preview Section */}
              {showPreview && selectedTemplateData && (
                <div className="mb-4 p-4 bg-surface-3 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye size={14} className="text-cyan-400" />
                    <p className="text-xs font-semibold text-ivory uppercase tracking-wider">Preview</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-violet/20">
                        {selectedTemplateData.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-ivory">{customName || selectedTemplateData.name}</h4>
                        <p className="text-[10px] text-muted">{selectedTemplateData.description}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-2">Categorías ({selectedTemplateData.categories.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplateData.categories.map((cat) => (
                          <span key={cat.name} className="text-[10px] px-2 py-1 bg-violet/10 text-violet-300 rounded font-semibold">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleUseTemplate(selectedTemplate)}
                  disabled={creating}
                  className="flex-1 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Crear Carta
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate("custom");
                    setCustomName("");
                    setShowPreview(false);
                  }}
                  disabled={creating}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

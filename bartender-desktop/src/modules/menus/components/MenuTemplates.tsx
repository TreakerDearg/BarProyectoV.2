"use client";

import { useState } from "react";
import { Martini, Utensils, Layers, Copy, Check, Plus } from "lucide-react";
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
      { name: "Comida", products: [] },
      { name: "Postres", products: [] },
    ]
  },
];

export default function MenuTemplates({ onMenuCreated, onCancel, onCreateEmpty }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const handleUseTemplate = async (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    try {
      setCreating(true);
      const newMenu = await createMenu({
        name: template.name,
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
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${selectedTemplate === template.id ? 'bg-violet/20' : 'bg-white/10'}`}>
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-ivory">{template.name}</h4>
                      <p className="text-[10px] text-muted">{template.description}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {template.categories.map((cat) => (
                      <div key={cat.name} className="text-[10px] text-muted/70 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-violet/40" />
                        {cat.name}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedTemplate && selectedTemplate !== "custom" && (
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
                    Usar Plantilla
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedTemplate("custom")}
                disabled={creating}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

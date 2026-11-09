"use client";

import { useState } from "react";
import {
  Martini,
  Utensils,
  Layers,
  Copy,
  Check,
  Plus,
  Coffee,
  Sun,
  Clock,
  Star,
  X,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type { Menu } from "../../../types/menu";
import { createMenu } from "../../../services/menuService";

interface Props {
  onMenuCreated: (menu: Menu) => void;
  onCancel: () => void;
  onCreateEmpty?: () => void;
}

interface TemplateDef {
  id: string;
  name: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  type: "drink" | "food" | "mixed";
  categories: { name: string; products: any[] }[];
}

const TEMPLATES: TemplateDef[] = [
  {
    id: "drinks",
    name: "Coctelería & Bar",
    badge: "Mixología",
    icon: <Martini size={18} className="text-[#F0B429]" />,
    description: "Diseñada para bares, coctelerías y lounges de autor",
    type: "drink",
    categories: [
      { name: "Cócteles Clásicos", products: [] },
      { name: "Cócteles de Autor", products: [] },
      { name: "Gin & Tonics", products: [] },
      { name: "Cervezas & Vinos", products: [] },
      { name: "Sin Alcohol & Mocktails", products: [] },
    ],
  },
  {
    id: "food",
    name: "Restó & Gastronomía",
    badge: "Cocina",
    icon: <Utensils size={18} className="text-[#3FB950]" />,
    description: "Estructura completa para restaurantes y gastronomía",
    type: "food",
    categories: [
      { name: "Entradas & Tapas", products: [] },
      { name: "Platos Principales", products: [] },
      { name: "Guarniciones", products: [] },
      { name: "Postres", products: [] },
    ],
  },
  {
    id: "mixed",
    name: "Bar & Tapas (Mixta)",
    badge: "Integral",
    icon: <Layers size={18} className="text-[#388BFD]" />,
    description: "El formato más versátil: tragos de barra y cocina para picar",
    type: "mixed",
    categories: [
      { name: "Tragos de Autor", products: [] },
      { name: "Para Picar & Tablas", products: [] },
      { name: "Platos al Paso", products: [] },
      { name: "Cervezas Tiradas", products: [] },
    ],
  },
  {
    id: "happy-hour",
    name: "Happy Hour Express",
    badge: "Promos",
    icon: <Sun size={18} className="text-[#F0B429]" />,
    description: "Carta promocional para franja horaria especial",
    type: "drink",
    categories: [
      { name: "Tragos 2x1", products: [] },
      { name: "Pintas Promocionales", products: [] },
      { name: "Snacks Rápidos", products: [] },
    ],
  },
  {
    id: "brunch",
    name: "Brunch & Cafetería",
    badge: "Día",
    icon: <Coffee size={18} className="text-[#FF7B54]" />,
    description: "Cafetería de especialidad, pastelería y tostadas",
    type: "food",
    categories: [
      { name: "Cafetería de Especialidad", products: [] },
      { name: "Tostadas & Huevos", products: [] },
      { name: "Pastelería Artesanal", products: [] },
      { name: "Jugos Naturales", products: [] },
    ],
  },
  {
    id: "late-night",
    name: "Late Night & Boliche",
    badge: "Noche",
    icon: <Clock size={18} className="text-[#E6EDF3]" />,
    description: "Carta nocturna ágil para alta rotación y eventos",
    type: "mixed",
    categories: [
      { name: "Shots & Chupitos", products: [] },
      { name: "Jarras & Baldes", products: [] },
      { name: "Comida Nocturna", products: [] },
    ],
  },
];

export default function MenuTemplates({ onMenuCreated, onCancel, onCreateEmpty }: Props) {
  const [creationMode, setCreationMode] = useState<"template" | "blank">("template");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("drinks");
  const [menuName, setMenuName] = useState<string>("");
  const [menuType, setMenuType] = useState<"drink" | "food" | "mixed">("mixed");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const selectedTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  const handleCreate = async () => {
    try {
      setCreating(true);

      const isBlank = creationMode === "blank";
      const finalName = menuName.trim() || (isBlank ? "Nueva Carta Digital" : selectedTemplate.name);
      const finalType = isBlank ? menuType : selectedTemplate.type;
      const finalCategories = isBlank ? [] : selectedTemplate.categories;
      const finalDescription = isBlank
        ? "Carta digital personalizada para el salón."
        : selectedTemplate.description;

      const newMenu = await createMenu(
        {
          name: finalName,
          description: finalDescription,
          type: finalType,
          active: true,
          categories: finalCategories,
        },
        { allowEmptyCategories: true }
      );

      setCreated(true);
      setTimeout(() => {
        onMenuCreated(newMenu);
      }, 400);
    } catch (err: any) {
      console.error("Error creating menu", err);
      alert("Error al crear la carta: " + (err?.message || "Ocurrió un error inesperado"));
    } finally {
      setCreating(false);
    }
  };

  if (created) {
    return (
      <div className="bg-[#161B22] border border-[#30363D] p-8 rounded-2xl text-center max-w-md w-full shadow-2xl">
        <div className="p-3.5 bg-[rgba(63,185,80,0.15)] rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3 text-[#3FB950] border border-[rgba(63,185,80,0.30)]">
          <Check size={28} />
        </div>
        <h3 className="text-base font-bold text-[#E6EDF3] mb-1">¡Carta Creada con Éxito!</h3>
        <p className="text-xs text-[#8B949E]">Abriendo el Studio de diseño para configurar productos…</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col gap-5">
      {/* ── Header del Asistente ──────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-[#30363D] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[rgba(240,180,41,0.12)] text-[#F0B429] rounded-xl border border-[rgba(240,180,41,0.25)]">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#E6EDF3] tracking-tight">Crear Nueva Carta Digital</h3>
            <p className="text-xs text-[#8B949E]">Selecciona cómo deseas estructurar tu menú</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2333] rounded-lg transition-colors"
          title="Cerrar"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Paso 1: Elegir punto de partida ────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2.5">
          1. Punto de partida
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Opción Plantilla */}
          <button
            type="button"
            onClick={() => setCreationMode("template")}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
              creationMode === "template"
                ? "bg-[#1C2333] border-[#F0B429] shadow-sm ring-1 ring-[#F0B429]/30"
                : "bg-[#161B22] border-[#30363D] hover:border-[#3D444D]"
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${
              creationMode === "template"
                ? "bg-[rgba(240,180,41,0.15)] text-[#F0B429]"
                : "bg-[#21283A] text-[#8B949E]"
            }`}>
              <Copy size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-[#E6EDF3]">Usar Plantilla Curada</h4>
                <span className="text-xs font-bold px-1.5 py-0.2 rounded bg-[rgba(240,180,41,0.15)] text-[#F0B429]">
                  Recomendado
                </span>
              </div>
              <p className="text-xs text-[#8B949E] mt-1 leading-relaxed">
                Categorías prediseñadas según tu modelo de bar o restaurante.
              </p>
            </div>
          </button>

          {/* Opción En Blanco */}
          <button
            type="button"
            onClick={() => setCreationMode("blank")}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
              creationMode === "blank"
                ? "bg-[#1C2333] border-[#F0B429] shadow-sm ring-1 ring-[#F0B429]/30"
                : "bg-[#161B22] border-[#30363D] hover:border-[#3D444D]"
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${
              creationMode === "blank"
                ? "bg-[rgba(240,180,41,0.15)] text-[#F0B429]"
                : "bg-[#21283A] text-[#8B949E]"
            }`}>
              <Plus size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#E6EDF3]">Carta en Blanco (Desde Cero)</h4>
              <p className="text-xs text-[#8B949E] mt-1 leading-relaxed">
                Empieza con una carta limpia y define cada categoría a medida.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Catálogo de Plantillas (si está en modo plantilla) ──────── */}
      {creationMode === "template" && (
        <div>
          <p className="text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2.5">
            2. Selecciona la especialidad
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tmpl.id);
                    if (!menuName || TEMPLATES.some(t => t.name === menuName)) {
                      setMenuName(tmpl.name);
                    }
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "bg-[#1C2333] border-[#F0B429] shadow-sm ring-1 ring-[#F0B429]/30"
                      : "bg-[#161B22] border-[#30363D] hover:border-[#3D444D] hover:bg-[#1C2333]/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg bg-[#21283A]">
                        {tmpl.icon}
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#21283A] text-[#8B949E]">
                        {tmpl.badge}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-[#E6EDF3] leading-tight">{tmpl.name}</h5>
                    <p className="text-xs text-[#8B949E] mt-1 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#30363D]/60 flex flex-wrap gap-1">
                    {tmpl.categories.slice(0, 3).map((cat, idx) => (
                      <span key={idx} className="text-xs px-1.5 py-0.2 rounded bg-[#21283A] text-[#8B949E]">
                        {cat.name}
                      </span>
                    ))}
                    {tmpl.categories.length > 3 && (
                      <span className="text-xs text-[#8B949E]/70 self-center">
                        +{tmpl.categories.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Personalización del Nombre y Tipo ──────────────────────── */}
      <div className="p-4 bg-[#1C2333] border border-[#30363D] rounded-xl space-y-3">
        <p className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#F0B429]" />
          <span>Configuración Inicial</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1">
              Nombre de la Carta *
            </label>
            <input
              type="text"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              placeholder={creationMode === "blank" ? "Ej: Carta Temporada Verano" : selectedTemplate.name}
              className="w-full h-9 px-3 bg-[#161B22] border border-[#30363D] rounded-lg text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/50 focus:outline-none focus:border-[#F0B429] transition-colors"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1">
              Tipo de Servicio
            </label>
            <select
              value={creationMode === "template" ? selectedTemplate.type : menuType}
              onChange={(e) => setMenuType(e.target.value as any)}
              disabled={creationMode === "template"}
              className="w-full h-9 px-3 bg-[#161B22] border border-[#30363D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429] transition-colors disabled:opacity-60"
            >
              <option value="drink">Mixología / Bebidas</option>
              <option value="food">Gastronomía / Platos</option>
              <option value="mixed">Mixta (Tragos + Comida)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Footer de Acciones ─────────────────────────────────────── */}
      <div className="pt-3 border-t border-[#30363D] flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2333] rounded-lg transition-colors"
        >
          Cancelar
        </button>

        <button
          type="button"
          disabled={creating}
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F0B429] hover:bg-[#F5C842] text-black font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Creando carta…</span>
            </>
          ) : (
            <>
              <span>Crear y Abrir en Menu Studio</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Edit, Trash2, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import type { RouletteDrink } from "../services/rouletteService";

interface RouletteAdminListProps {
  drinks: RouletteDrink[];
  onEdit: (drink: RouletteDrink) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onUpdateWeight: (id: string, weight: number) => void;
}

const RARITY_COLORS = {
  COMMON: "bg-gray-500",
  RARE: "bg-blue-500",
  EPIC: "bg-purple-500",
  LEGENDARY: "bg-amber-500",
};

const RARITY_LABELS = {
  COMMON: "Común",
  RARE: "Raro",
  EPIC: "Épico",
  LEGENDARY: "Legendario",
};

export default function RouletteAdminList({
  drinks,
  onEdit,
  onDelete,
  onToggle,
  onUpdateWeight,
}: RouletteAdminListProps) {
  const [editingWeight, setEditingWeight] = useState<string | null>(null);

  const handleWeightChange = (id: string, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      onUpdateWeight(id, num);
    }
    setEditingWeight(null);
  };

  return (
    <div className="space-y-4">
      {drinks.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay tragos configurados en la ruleta</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {drinks.map((drink) => (
            <div
              key={drink._id}
              className={`p-6 rounded-xl border ${
                drink.active
                  ? "bg-zinc-900/50 border-zinc-800"
                  : "bg-zinc-900/30 border-zinc-800/50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-4 h-4 rounded-full ${RARITY_COLORS[drink.rarity]}`}
                      title={RARITY_LABELS[drink.rarity]}
                    />
                    <h3 className="text-lg font-semibold text-white truncate">
                      {drink.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        drink.active
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {drink.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500 mb-1">Categoría</p>
                      <p className="text-zinc-300 capitalize">{drink.category}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Rareza</p>
                      <p className="text-zinc-300">{RARITY_LABELS[drink.rarity]}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Probabilidad</p>
                      <p className="text-zinc-300">
                        {drink.probability ? `${drink.probability.toFixed(1)}%` : "0%"}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Total Spins</p>
                      <p className="text-zinc-300">{drink.totalSpins || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Weight & Actions */}
                <div className="flex flex-col items-end gap-2">
                  {/* Weight Editor */}
                  <div className="flex items-center gap-2">
                    {editingWeight === drink._id ? (
                      <input
                        type="number"
                        defaultValue={drink.weight}
                        min="1"
                        className="w-20 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                        autoFocus
                        onBlur={(e) => handleWeightChange(drink._id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleWeightChange(drink._id, e.currentTarget.value);
                          }
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => setEditingWeight(drink._id)}
                        className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm hover:border-zinc-600 transition-colors"
                      >
                        Peso: {drink.weight}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggle(drink._id, !drink.active)}
                      className="p-2 hover:bg-zinc-800 rounded transition-colors"
                      title={drink.active ? "Desactivar" : "Activar"}
                    >
                      {drink.active ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-zinc-500" />
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(drink)}
                      className="p-2 hover:bg-zinc-800 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5 text-zinc-400" />
                    </button>
                    <button
                      onClick={() => onDelete(drink._id)}
                      className="p-2 hover:bg-zinc-800 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full border-2 border-zinc-700"
                  style={{ backgroundColor: drink.color }}
                />
                <span className="text-xs text-zinc-500">{drink.color}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

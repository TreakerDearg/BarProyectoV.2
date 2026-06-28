"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Minus,
  Save,
  Search,
  Layers,
  Beaker,
  Calculator,
  CheckCircle,
  Info
} from "lucide-react";

import type { Product } from "../../../types/product";

interface Ingredient {
  _id: string;
  name: string;
  category: string;
  unit: string;
  cost: number;
  stock: number;
}

interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

interface Props {
  product: Product;
  onClose: () => void;
  onSave: (recipe: RecipeItem[]) => void;
}

export default function IngredientMappingPanel({ product, onClose, onSave }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Mock ingredients - in real app, this would come from inventory
  const availableIngredients: Ingredient[] = [
    { _id: "1", name: "Vodka", category: "Alcohol", unit: "ml", cost: 0.05, stock: 5000 },
    { _id: "2", name: "Gin", category: "Alcohol", unit: "ml", cost: 0.06, stock: 4000 },
    { _id: "3", name: "Rum", category: "Alcohol", unit: "ml", cost: 0.04, stock: 3500 },
    { _id: "4", name: "Tequila", category: "Alcohol", unit: "ml", cost: 0.07, stock: 3000 },
    { _id: "5", name: "Whisky", category: "Alcohol", unit: "ml", cost: 0.12, stock: 2500 },
    { _id: "6", name: "Lemon Juice", category: "Mixers", unit: "ml", cost: 0.02, stock: 2000 },
    { _id: "7", name: "Simple Syrup", category: "Mixers", unit: "ml", cost: 0.01, stock: 3000 },
    { _id: "8", name: "Soda Water", category: "Mixers", unit: "ml", cost: 0.005, stock: 5000 },
    { _id: "9", name: "Ice", category: "Mixers", unit: "g", cost: 0.001, stock: 10000 },
    { _id: "10", name: "Mint", category: "Garnish", unit: "unit", cost: 0.03, stock: 500 },
  ];

  const filteredIngredients = availableIngredients.filter(ing =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ing.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToRecipe = () => {
    if (!selectedIngredient) return;
    
    const existingIndex = recipe.findIndex(r => r.ingredientId === selectedIngredient._id);
    if (existingIndex >= 0) {
      const updated = [...recipe];
      updated[existingIndex].quantity += quantity;
      setRecipe(updated);
    } else {
      setRecipe([...recipe, {
        ingredientId: selectedIngredient._id,
        ingredientName: selectedIngredient.name,
        quantity,
        unit: selectedIngredient.unit
      }]);
    }
    
    setSelectedIngredient(null);
    setQuantity(1);
  };

  const removeFromRecipe = (ingredientId: string) => {
    setRecipe(recipe.filter(r => r.ingredientId !== ingredientId));
  };

  const updateQuantity = (ingredientId: string, delta: number) => {
    setRecipe(recipe.map(r => {
      if (r.ingredientId === ingredientId) {
        const newQuantity = Math.max(1, r.quantity + delta);
        return { ...r, quantity: newQuantity };
      }
      return r;
    }));
  };

  const calculateRecipeCost = () => {
    return recipe.reduce((total, item) => {
      const ingredient = availableIngredients.find(i => i._id === item.ingredientId);
      if (ingredient) {
        return total + (ingredient.cost * item.quantity);
      }
      return total;
    }, 0);
  };

  const recipeCost = calculateRecipeCost();
  const productCost = product.cost || 0;
  const costDifference = recipeCost - productCost;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface-2 border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-violet-500/30 to-cyan-500/20 rounded-xl border border-violet/30">
              <Layers size={24} className="text-violet-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Mapeo de Ingredientes</h2>
              <p className="text-sm text-white/60">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} className="text-white/50" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Ingredient Selection */}
          <div className="w-1/2 p-6 border-r border-white/10 overflow-y-auto">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  placeholder="Buscar ingredientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-cyan/50 focus:ring-2 focus:ring-cyan/20 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Ingredientes Disponibles</p>
              {filteredIngredients.map((ingredient) => (
                <button
                  key={ingredient._id}
                  onClick={() => setSelectedIngredient(ingredient)}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${
                    selectedIngredient?._id === ingredient._id
                      ? 'bg-cyan/20 border-cyan/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet/10 rounded-lg">
                        <Beaker size={16} className="text-violet-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{ingredient.name}</p>
                        <p className="text-xs text-white/50">{ingredient.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-cyan">${ingredient.cost.toFixed(3)}/{ingredient.unit}</p>
                      <p className="text-xs text-white/50">Stock: {ingredient.stock}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Recipe Builder */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {/* Selected Ingredient Quick Add */}
            {selectedIngredient && (
              <div className="mb-6 p-4 bg-cyan/10 border border-cyan/30 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Beaker size={18} className="text-cyan" />
                    <span className="font-semibold text-white">{selectedIngredient.name}</span>
                  </div>
                  <span className="text-sm text-cyan">${selectedIngredient.cost.toFixed(3)}/{selectedIngredient.unit}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Minus size={16} className="text-white" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="w-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-center text-white font-mono"
                  />
                  <span className="text-white/50">{selectedIngredient.unit}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Plus size={16} className="text-white" />
                  </button>
                  <button
                    onClick={addToRecipe}
                    className="flex-1 ml-2 bg-cyan text-black font-semibold rounded-lg py-2 hover:bg-cyan/90 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Recipe List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/50 uppercase tracking-wider">Receta Actual</p>
                <span className="text-xs text-white/50">{recipe.length} ingrediente(s)</span>
              </div>

              {recipe.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-xl">
                  <Layers size={32} className="text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/50">No hay ingredientes en la receta</p>
                  <p className="text-xs text-white/30 mt-1">Selecciona ingredientes para comenzar</p>
                </div>
              ) : (
                recipe.map((item) => (
                  <div
                    key={item.ingredientId}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald/10 rounded-lg">
                        <Beaker size={16} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.ingredientName}</p>
                        <p className="text-xs text-white/50">{item.quantity} {item.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.ingredientId, -1)}
                        className="p-1.5 bg-white/10 rounded hover:bg-white/20 transition-colors"
                      >
                        <Minus size={14} className="text-white/50" />
                      </button>
                      <span className="w-8 text-center text-sm font-mono text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.ingredientId, 1)}
                        className="p-1.5 bg-white/10 rounded hover:bg-white/20 transition-colors"
                      >
                        <Plus size={14} className="text-white/50" />
                      </button>
                      <button
                        onClick={() => removeFromRecipe(item.ingredientId)}
                        className="p-1.5 bg-red/10 rounded hover:bg-red/20 transition-colors ml-2"
                      >
                        <X size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cost Analysis */}
            {recipe.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-br from-violet/10 to-cyan/10 border border-violet/20 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator size={18} className="text-violet-400" />
                  <p className="text-sm font-bold text-white uppercase tracking-wider">Análisis de Costos</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Costo de Receta</span>
                    <span className="text-lg font-bold text-cyan">${recipeCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Costo del Producto</span>
                    <span className="text-lg font-bold text-white">${productCost.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className={`flex justify-between items-center ${Math.abs(costDifference) > 0.01 ? 'text-emerald-400' : 'text-white/50'}`}>
                    <span className="text-sm font-semibold">Diferencia</span>
                    <span className="text-lg font-bold">
                      {costDifference > 0 ? '+' : ''}${costDifference.toFixed(2)}
                    </span>
                  </div>
                </div>

                {Math.abs(costDifference) > 0.5 && (
                  <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                    costDifference > 0 
                      ? 'bg-amber/10 border border-amber/30' 
                      : 'bg-emerald/10 border border-emerald/30'
                  }`}>
                    <Info size={16} className={costDifference > 0 ? 'text-amber-400' : 'text-emerald-400'} />
                    <p className="text-xs text-white/70">
                      {costDifference > 0 
                        ? 'El costo de la receta es mayor al costo del producto. Considera ajustar el precio.'
                        : 'El costo de la receta es menor al costo del producto. El margen es mayor al calculado.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {recipe.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald/10 border border-emerald/30 rounded-full">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">
                  {recipe.length} ingrediente(s)
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-white/50 hover:text-white font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(recipe)}
              disabled={recipe.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-violet-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={18} />
              Guardar Receta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

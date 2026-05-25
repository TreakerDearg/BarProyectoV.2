"use client";

import type { Order, SelectedItem } from "../types/discounts";
import { CheckSquare, Square, ShoppingBag, Calculator, Info } from "lucide-react";

interface Props {
  order: Order;
  items: SelectedItem[];
  setItems: (items: SelectedItem[]) => void;
}

export default function NebulaOrderDetails({ order, items, setItems }: Props) {
  const toggleItem = (index: number) => {
    const updated = [...items];
    updated[index].selected = !updated[index].selected;
    setItems(updated);
  };

  const toggleAll = () => {
    const allSelected = items.every(i => i.selected);
    setItems(items.map(i => ({ ...i, selected: !allSelected })));
  };

  const allSelected = items.every(i => i.selected);
  const selectedCount = items.filter(i => i.selected).length;
  const selectedTotal = items.filter(i => i.selected).reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* ENCABEZADO AMIGABLE NEBULA */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <ShoppingBag size={28} />
             </div>
             <div>
                <h3 className="text-xl font-bold">Mesa {typeof order.table === 'object' ? order.table?.number : order.table}</h3>
                <p className="text-sm text-blue-100">Orden #{order._id.slice(-8).toUpperCase()}</p>
             </div>
          </div>
          <button 
            onClick={toggleAll}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${allSelected 
              ? 'bg-white text-blue-600 border-white' 
              : 'bg-transparent text-white border-white/50 hover:bg-white/10'}`}
          >
            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
        </div>
        
        {/* SUB-ENCABEZADO INFORMATIVO */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-sm font-medium flex items-center gap-2">
            <Info size={16} /> 
            Paso 1: Selecciona los productos que tendrán descuento
          </p>
        </div>
      </div>

      {/* LISTA DE ITEMS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {items.map((item, index) => (
          <div
            key={item._id || `${item.product}-${index}`}
            onClick={() => toggleItem(index)}
            className={`
              p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between cursor-pointer
              ${item.selected 
                ? 'bg-blue-50 border-blue-500 shadow-md' 
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'}
            `}
          >
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${item.selected ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                  {item.selected ? <CheckSquare size={24} /> : <Square size={24} />}
               </div>
               <div>
                  <p className={`font-semibold text-gray-800 ${item.selected ? 'text-blue-900' : ''}`}>
                    {item.name}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-gray-500">
                      ${item.price.toLocaleString()} × {item.quantity}
                    </p>
                    {item.discountApplied && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        Ya tiene descuento
                      </span>
                    )}
                  </div>
               </div>
            </div>
            
            <div className="text-right">
               <p className={`text-lg font-bold ${item.selected ? 'text-blue-600' : 'text-gray-700'}`}>
                 ${(item.price * item.quantity).toLocaleString()}
               </p>
            </div>
          </div>
        ))}
      </div>

      {/* PIE DE PÁGINA RESUMEN NEBULA */}
      <div className="p-6 bg-white border-t border-gray-200">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-600">
               <Calculator size={20} />
               <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {selectedCount} {selectedCount === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                  </p>
                  <p className="text-xs text-gray-400">Subtotal para descuento</p>
               </div>
            </div>
            <div className="text-right">
               <span className="text-sm font-bold text-gray-500">Total</span>
               <span className="text-2xl font-bold text-blue-600 ml-3">
                 ${selectedTotal.toLocaleString()}
               </span>
            </div>
         </div>
      </div>
    </div>
  );
}
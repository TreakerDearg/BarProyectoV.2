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
    <div className="flex flex-col h-full nebula-discounts-panel overflow-hidden">
      {/* ENCABEZADO NEBULA */}
      <div className="p-4 md:p-6 border-b border-white/10" style={{
        background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(139, 92, 246, 0.1))'
      }}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="p-2 md:p-3 bg-cyan/20 rounded-xl md:rounded-2xl backdrop-blur-sm">
                <ShoppingBag size={20} className="md:size-28 text-cyan" />
             </div>
             <div>
                <h3 className="text-base md:text-xl font-bold text-white">Mesa {typeof order.table === 'object' ? order.table?.number : order.table}</h3>
                <p className="text-xs md:text-sm text-cyan/70">Orden #{order._id.slice(-8).toUpperCase()}</p>
             </div>
          </div>
          <button 
            onClick={toggleAll}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs font-bold transition-all border-2 ${allSelected 
              ? 'bg-cyan text-black border-cyan' 
              : 'bg-transparent text-white border-white/30 hover:bg-white/10'}`}
          >
            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
        </div>
        
        {/* SUB-ENCABEZADO INFORMATIVO */}
        <div className="p-3 rounded-xl backdrop-blur-sm" style={{
          background: 'rgba(0, 229, 255, 0.1)',
          border: '1px solid rgba(0, 229, 255, 0.2)'
        }}>
          <p className="text-xs md:text-sm font-medium flex items-center gap-2 text-cyan/90">
            <Info size={14} className="md:size-16" /> 
            Paso 1: Selecciona los productos que tendrán descuento
          </p>
        </div>
      </div>

      {/* LISTA DE ITEMS */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3">
        {items.map((item, index) => (
          <div
            key={item._id || `${item.product}-${index}`}
            onClick={() => toggleItem(index)}
            className={`
              p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all duration-200 flex items-center justify-between cursor-pointer
              ${item.selected 
                ? 'bg-cyan/10 border-cyan/30 shadow-lg' 
                : 'bg-white/5 border-white/10 hover:border-cyan/20 hover:bg-white/10'}
            `}
          >
            <div className="flex items-center gap-3 md:gap-4">
               <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center transition-all ${item.selected ? 'bg-cyan text-black shadow-md' : 'bg-white/10 text-white/50'}`}>
                  {item.selected ? <CheckSquare size={16} className="md:size-24" /> : <Square size={16} className="md:size-24" />}
               </div>
               <div>
                  <p className={`font-semibold text-sm md:text-base ${item.selected ? 'text-cyan' : 'text-white'}`}>
                    {item.name}
                  </p>
                  
                  <div className="flex items-center gap-2 md:gap-3 mt-1">
                    <p className="text-xs md:text-sm text-white/50">
                      ${item.price.toLocaleString()} × {item.quantity}
                    </p>
                    {item.discountApplied && (
                      <span className="px-2 py-0.5 md:py-1 bg-gold/20 text-gold text-[10px] md:text-xs font-bold rounded-full border border-gold/30">
                        Ya tiene descuento
                      </span>
                    )}
                  </div>
               </div>
            </div>
            
            <div className="text-right">
               <p className={`text-base md:text-lg font-bold ${item.selected ? 'text-cyan' : 'text-white'}`}>
                 ${(item.price * item.quantity).toLocaleString()}
               </p>
            </div>
          </div>
        ))}
      </div>

      {/* PIE DE PÁGINA RESUMEN NEBULA */}
      <div className="p-4 md:p-6 border-t border-white/10" style={{
        background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.05), rgba(139, 92, 246, 0.05))'
      }}>
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/70">
               <Calculator size={16} className="md:size-20 text-cyan" />
               <div>
                  <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-white/50">
                    {selectedCount} {selectedCount === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                  </p>
                  <p className="text-[10px] md:text-xs text-white/40">Subtotal para descuento</p>
               </div>
            </div>
            <div className="text-right">
               <span className="text-xs md:text-sm font-bold text-white/50">Total</span>
               <span className="text-xl md:text-2xl font-bold text-cyan ml-2 md:ml-3">
                 ${selectedTotal.toLocaleString()}
               </span>
            </div>
         </div>
      </div>
    </div>
  );
}
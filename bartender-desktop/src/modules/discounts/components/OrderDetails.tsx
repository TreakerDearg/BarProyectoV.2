"use client";

import type { Order, SelectedItem } from "../types/discounts";
import { CheckSquare, Square, Zap, Flame, ShieldCheck, Target } from "lucide-react";

interface Props {
  order: Order;
  items: SelectedItem[];
  setItems: (items: SelectedItem[]) => void;
}

export default function OrderDetails({ order, items, setItems }: Props) {
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

  return (
    <div className="flex flex-col h-full">
      {/* PANEL HEADER */}
      <div className="p-8 bg-surface-3/50 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-6">
           <div className="p-4 rounded-2xl bg-emerald-400/10 text-emerald-400 shadow-emerald-400/10 animate-float">
              <ShieldCheck size={28} />
           </div>
           <div>
              <h3 className="text-2xl font-black text-ivory tracking-tighter uppercase">Audit de Mesa {String(order.table)}</h3>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] mt-1">Identificador: {order._id.slice(-8).toUpperCase()}</p>
           </div>
        </div>
        <button 
          onClick={toggleAll}
          className={`px-6 py-2.5 rounded-xl text-[9px] font-black tracking-widest transition-all border ${allSelected ? 'bg-emerald-400 text-bg border-emerald-400' : 'bg-white/5 text-muted border-white/10 hover:text-ivory'}`}
        >
          {allSelected ? 'DESELECCIONAR TODO' : 'SELECCIONAR TODO'}
        </button>
      </div>

      {/* ITEMS LIST */}
      <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar pb-20">
        {items.map((item, index) => (
          <div
            key={item._id || `${item.product}-${index}`}
            onClick={() => toggleItem(index)}
            className={`
              p-6 rounded-[2.5rem] border transition-all duration-500 flex items-center justify-between cursor-pointer group relative overflow-hidden
              ${item.selected 
                ? 'bg-emerald-400/5 border-emerald-400/30 shadow-emerald-400/10' 
                : 'bg-surface-3/30 border-white/5 hover:border-white/10 hover:bg-surface-4'}
            `}
          >
            <div className="flex items-center gap-6 relative z-10">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${item.selected ? 'bg-emerald-400 text-bg' : 'bg-white/5 text-muted'}`}>
                  {item.selected ? <CheckSquare size={24} /> : <Square size={24} />}
               </div>
               <div>
                  <p className={`text-lg font-black uppercase tracking-tighter transition-colors ${item.selected ? 'text-ivory' : 'text-muted group-hover:text-ivory'}`}>
                    {item.name}
                  </p>
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1">
                    ${item.price.toLocaleString()} · CANTIDAD: {item.quantity}
                  </p>
               </div>
            </div>
            
            <div className="text-right relative z-10">
               <p className={`text-2xl font-black tracking-tighter ${item.selected ? 'text-emerald-400' : 'text-muted group-hover:text-ivory'}`}>
                 ${(item.price * item.quantity).toLocaleString()}
               </p>
               {item.selected && (
                 <p className="text-[8px] font-black text-emerald-400/60 uppercase tracking-widest mt-1 animate-pulse">AUDITADO</p>
               )}
            </div>

            {/* ATMOSPHERIC ELEMENT */}
            <div className={`absolute -bottom-2 -right-2 opacity-[0.02] transition-opacity ${item.selected ? 'opacity-[0.05]' : 'group-hover:opacity-[0.03]'}`}>
               <Zap size={60} />
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER SUMMARY */}
      <div className="p-8 bg-surface-3 border-t border-white/5 flex justify-between items-center">
         <div className="flex items-center gap-4 text-muted">
            <Target size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{items.filter(i => i.selected).length} ITEMS AUDITADOS</span>
         </div>
         <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">TOTAL AUDITORÍA</span>
            <span className="text-3xl font-black text-ivory tracking-tighter">
              ${items.filter(i => i.selected).reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString()}
            </span>
         </div>
      </div>
    </div>
  );
}
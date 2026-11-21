import { Pencil, Trash2, Infinity, Coins, Package, Clock, Sparkles } from "lucide-react";
import type { Reward } from "../types/reward";

interface RewardCardProps {
  reward:   Reward;
  onEdit:   (reward: Reward) => void;
  onDelete: (id: string) => void;
  onToggleActive?: (id: string, active: boolean) => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  drink:      { label: "Bebida",      color: "text-[#388BFD] bg-[#388BFD]/10 border-[#388BFD]/30" },
  food:       { label: "Cocina",      color: "text-[#F0B429] bg-[#F0B429]/10 border-[#F0B429]/30" },
  experience: { label: "Experiencia", color: "text-[#A371F7] bg-[#A371F7]/10 border-[#A371F7]/30" },
  discount:   { label: "Descuento",   color: "text-[#3FB950] bg-[#3FB950]/10 border-[#3FB950]/30" },
};

export default function RewardCard({ reward, onEdit, onDelete, onToggleActive }: RewardCardProps) {
  const cat = CATEGORY_CONFIG[reward.category] || { label: reward.category, color: "text-[#8B949E] bg-[#1C2333] border-[#30363D]" };

  return (
    <div className="bg-[#161B22] rounded-2xl border border-[#30363D] p-5 flex flex-col justify-between gap-4 hover:border-[#F0B429]/40 transition-all duration-200 shadow-lg">

      {/* Header & Points */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${cat.color}`}>
                {cat.label}
              </span>
              {reward.discountPercent > 0 && (
                <span className="text-[9px] font-bold text-[#3FB950] bg-[#3FB950]/10 border border-[#3FB950]/20 px-1.5 py-0.5 rounded">
                  -{reward.discountPercent}%
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-[#E6EDF3] tracking-tight truncate">
              {reward.name}
            </h3>
            {reward.description && (
              <p className="text-[11px] text-[#8B949E] mt-1 line-clamp-2 leading-relaxed">
                {reward.description}
              </p>
            )}
          </div>

          {/* Points badge */}
          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C2333] border border-[#F0B429]/30 shadow-inner">
            <Coins size={14} className="text-[#F0B429]" />
            <span className="text-xs font-mono font-bold text-[#F0B429]">
              {reward.pointsCost} <span className="text-[9px] font-sans font-medium text-[#8B949E]">pts</span>
            </span>
          </div>
        </div>

        {/* Linked POS Product */}
        {reward.product && (
          <div className="mt-3.5 p-2 rounded-xl bg-[#0D1117] border border-[#30363D] flex items-center gap-2">
            <Package size={13} className="text-[#8B949E] flex-shrink-0" />
            <span className="text-[10px] text-[#8B949E] font-medium">Asociado a Carta:</span>
            <span className="text-[11px] text-[#E6EDF3] font-bold truncate">
              {typeof reward.product === "object" ? reward.product.name : "Producto Vinculado"}
            </span>
          </div>
        )}
      </div>

      {/* Meta Row: Stock & Dates */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#30363D]/60 flex-wrap">
        <div className="flex items-center gap-2 text-[10px] text-[#8B949E]">
          <span className="flex items-center gap-1 bg-[#1C2333] px-2 py-0.5 rounded border border-[#30363D]">
            {reward.stock === -1 ? (
              <>
                <Infinity size={12} className="text-[#3FB950]" />
                <span className="font-semibold text-[#E6EDF3]">Ilimitado</span>
              </>
            ) : (
              <span>
                Stock: <strong className={reward.stock <= 5 ? "text-[#F85149]" : "text-[#E6EDF3]"}>{reward.stock}</strong>
              </span>
            )}
          </span>

          {reward.validUntil && (
            <span className="flex items-center gap-1 text-[9px] bg-[#1C2333] px-1.5 py-0.5 rounded border border-[#30363D]">
              <Clock size={10} />
              Hasta {new Date(reward.validUntil).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Status Toggle */}
        <button
          type="button"
          onClick={() => onToggleActive?.(reward._id, reward.active)}
          className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all ${
            reward.active
              ? "bg-[#3FB950]/15 border-[#3FB950]/40 text-[#3FB950] hover:bg-[#3FB950]/25"
              : "bg-[#F85149]/15 border-[#F85149]/40 text-[#F85149] hover:bg-[#F85149]/25"
          }`}
        >
          {reward.active ? "Activo" : "Inactivo"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onEdit(reward)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#1C2333] hover:bg-[#F0B429]/15 hover:text-[#F0B429] hover:border-[#F0B429]/30 text-[#8B949E] text-[10px] font-bold uppercase tracking-wider border border-[#30363D] transition-all"
        >
          <Pencil size={12} />
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(reward._id)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C2333] hover:bg-[#F85149]/15 hover:text-[#F85149] hover:border-[#F85149]/30 text-[#8B949E] text-[10px] font-bold uppercase tracking-wider border border-[#30363D] transition-all"
          title="Eliminar recompensa"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

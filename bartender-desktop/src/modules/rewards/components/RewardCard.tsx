import { Pencil, Trash2, Infinity } from "lucide-react";
import type { Reward } from "../types/reward";

interface RewardCardProps {
  reward:   Reward;
  onEdit:   (reward: Reward) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  drink:      "Bebida",
  food:       "Comida",
  experience: "Experiencia",
  discount:   "Descuento",
};

export default function RewardCard({ reward, onEdit, onDelete }: RewardCardProps) {
  return (
    <div className="glass-royale rounded-2xl border border-white/8 p-5 flex flex-col gap-4 hover:border-gold/20 transition-all duration-200">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-ivory uppercase tracking-tight truncate">
            {reward.name}
          </h3>
          {reward.description && (
            <p className="text-[10px] text-muted mt-0.5 line-clamp-2">{reward.description}</p>
          )}
        </div>

        {/* Points badge */}
        <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/25">
          <span className="text-[10px] font-black text-gold">⭐</span>
          <span className="text-[11px] font-black text-gold">{reward.pointsCost}</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-muted">
          {CATEGORY_LABELS[reward.category] ?? reward.category}
        </span>

        <span className="flex items-center gap-1 text-[9px] font-bold text-muted uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 border border-white/8">
          {reward.stock === -1 ? (
            <>
              <Infinity size={11} />
              <span>Ilimitado</span>
            </>
          ) : (
            <span>Stock: {reward.stock}</span>
          )}
        </span>

        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
            reward.active
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {reward.active ? "Activo" : "Inactivo"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <button
          type="button"
          onClick={() => onEdit(reward)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-gold/10 hover:text-gold text-muted text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          <Pencil size={12} />
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(reward._id)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-muted text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

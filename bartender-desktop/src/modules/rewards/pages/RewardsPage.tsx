import { useState } from "react";
import { Gift, Plus, RefreshCw, Star, TrendingUp, Award } from "lucide-react";
import { useRewards } from "../hooks/useRewards";
import RewardCard     from "../components/RewardCard";
import RewardForm     from "../components/RewardForm";
import RedemptionsLog from "../components/RedemptionsLog";
import type { Reward } from "../types/reward";

export default function RewardsPage() {
  const { rewards, loading, error, points, actions } = useRewards();

  const [showForm,    setShowForm]    = useState(false);
  const [editReward,  setEditReward]  = useState<Reward | null>(null);
  const [showPoints,  setShowPoints]  = useState(false);

  const handleEdit = (reward: Reward) => {
    setEditReward(reward);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditReward(null);
  };

  const handleSave = async (data: Partial<Reward>) => {
    if (editReward) {
      await actions.updateReward(editReward._id, data);
    } else {
      await actions.createReward(data);
    }
    handleCloseForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar esta recompensa?")) {
      await actions.deleteReward(id);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        <p className="text-[10px] font-black text-gold uppercase tracking-[0.5em] animate-pulse">
          Cargando recompensas...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 animate-fade-in p-2 md:p-8">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-gold/10 text-gold shadow-gold-glow">
              <Gift size={24} />
            </div>
            <h1 className="text-4xl font-black text-ivory tracking-tighter uppercase">
              Rewards <span className="text-grad-gold">Engine</span>
            </h1>
          </div>
          <p className="text-[10px] text-muted font-black uppercase tracking-[0.5em]">
            Sistema de puntos y recompensas
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => { actions.fetchRewards(); actions.fetchPoints(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-muted hover:text-ivory rounded-xl border border-white/8 transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <RefreshCw size={13} />
            Actualizar
          </button>
          <button
            onClick={() => setShowPoints((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-gold/10 text-muted hover:text-gold rounded-xl border border-white/8 transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <Star size={13} />
            Mis Puntos
          </button>
          <button
            onClick={() => { setEditReward(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/20 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <Plus size={13} />
            Nueva Recompensa
          </button>
        </div>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ================= POINTS SUMMARY ================= */}
      {showPoints && (
        <div className="glass-royale rounded-[2.5rem] p-8 border border-white/5 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <Star size={18} className="text-gold" />
            <h2 className="text-base font-black text-ivory uppercase tracking-tighter">
              Mi Balance de Puntos
            </h2>
          </div>

          {points ? (
            <div className="flex flex-col gap-6">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Balance",   value: points.balance,       icon: Star,       color: "text-gold"        },
                  { label: "Ganados",   value: points.totalEarned,   icon: TrendingUp, color: "text-emerald-400" },
                  { label: "Canjeados", value: points.totalRedeemed, icon: Award,      color: "text-violet-400"  },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white/3 rounded-2xl p-4 border border-white/5 flex flex-col gap-1">
                    <Icon size={14} className={color} />
                    <p className="text-2xl font-black text-ivory mt-1">{value}</p>
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest">{label}</p>
                  </div>
                ))}
              </div>

              {/* Movements */}
              {points.movements.length > 0 && (
                <div>
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-3">
                    Últimos movimientos
                  </p>
                  <RedemptionsLog movements={points.movements} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">Sin datos de puntos disponibles.</p>
          )}
        </div>
      )}

      {/* ================= REWARDS GRID ================= */}
      {rewards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted">
          <Gift size={40} className="opacity-20" />
          <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-50">
            No hay recompensas
          </p>
          <button
            onClick={() => { setEditReward(null); setShowForm(true); }}
            className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Plus size={13} />
            Crear primera recompensa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {rewards.map((reward) => (
            <RewardCard
              key={reward._id}
              reward={reward}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ================= FORM MODAL ================= */}
      {showForm && (
        <RewardForm
          reward={editReward}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

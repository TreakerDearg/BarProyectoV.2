import { useState } from "react";
import { Gift, Plus, RefreshCw, Coins, Award, CheckCircle2, Search, History, LayoutGrid, Sparkles } from "lucide-react";
import { useRewards } from "../hooks/useRewards";
import RewardCard from "../components/RewardCard";
import RewardForm from "../components/RewardForm";
import VoucherValidator from "../components/VoucherValidator";
import RedemptionsHistoryTable from "../components/RedemptionsHistoryTable";
import type { Reward } from "../types/reward";

type ActiveTab = "catalog" | "validator" | "history";

export default function RewardsPage() {
  const { rewards, kpis, redemptions, loading, error, actions } = useRewards();

  const [activeTab, setActiveTab] = useState<ActiveTab>("catalog");
  const [showForm, setShowForm] = useState(false);
  const [editReward, setEditReward] = useState<Reward | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
    if (confirm("¿Eliminar esta recompensa del catálogo?")) {
      await actions.deleteReward(id);
    }
  };

  const filteredRewards = rewards.filter((r) => {
    if (categoryFilter === "all") return true;
    return r.category === categoryFilter;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in p-4 md:p-8 min-h-screen bg-[#0D1117] text-[#E6EDF3]">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-[#30363D] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded-xl bg-[#F0B429]/10 text-[#F0B429] border border-[#F0B429]/20">
              <Gift size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#E6EDF3] tracking-tight">
                Programa de Recompensas & Fidelidad
              </h1>
              <p className="text-xs text-[#8B949E]">
                Configuración del motor de fidelidad para la app móvil, canjes en vivo y validación en barra
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              actions.fetchRewards();
              actions.fetchKpis();
              actions.fetchRedemptions();
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#161B22] hover:bg-[#1C2333] text-[#8B949E] hover:text-[#E6EDF3] rounded-xl border border-[#30363D] transition-all text-xs font-bold"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Sincronizar
          </button>

          <button
            onClick={() => { setEditReward(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#F0B429] hover:bg-[#F0B429]/90 text-[#0D1117] font-bold text-xs rounded-xl transition-all shadow-md shadow-[#F0B429]/20"
          >
            <Plus size={14} />
            Nueva Recompensa
          </button>
        </div>
      </div>

      {/* ================= KPI STRIP ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Recompensas Activas",
            value: kpis?.totalActiveRewards ?? rewards.filter((r) => r.active).length,
            icon: Gift,
            color: "text-[#3FB950]",
            bg: "bg-[#3FB950]/10",
          },
          {
            label: "Puntos en Circulación",
            value: kpis?.totalPointsInCirculation ?? 0,
            icon: Coins,
            color: "text-[#F0B429]",
            bg: "bg-[#F0B429]/10",
          },
          {
            label: "Canjes Realizados",
            value: kpis?.totalRedemptionsCount ?? 0,
            icon: Award,
            color: "text-[#388BFD]",
            bg: "bg-[#388BFD]/10",
          },
          {
            label: "Entregas en Barra",
            value: kpis?.claimedCount ?? 0,
            icon: CheckCircle2,
            color: "text-[#A371F7]",
            bg: "bg-[#A371F7]/10",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex items-center gap-3.5">
            <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xl font-mono font-bold text-[#E6EDF3] leading-none">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              <p className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ================= NAVIGATION TABS ================= */}
      <div className="flex items-center gap-2 border-b border-[#30363D] pb-3">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "catalog"
            ? "bg-[#161B22] text-[#F0B429] border border-[#F0B429]/30"
            : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]"
            }`}
        >
          <LayoutGrid size={15} />
          Catálogo de Recompensas ({rewards.length})
        </button>

        <button
          onClick={() => setActiveTab("validator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "validator"
            ? "bg-[#161B22] text-[#F0B429] border border-[#F0B429]/30"
            : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]"
            }`}
        >
          <Search size={15} />
          Validador de Cupones en Barra
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "history"
            ? "bg-[#161B22] text-[#F0B429] border border-[#F0B429]/30"
            : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]"
            }`}
        >
          <History size={15} />
          Historial de Canjes ({redemptions.length})
        </button>
      </div>

      {/* ================= ERROR BANNER ================= */}
      {error && (
        <div className="p-4 rounded-xl bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] text-xs">
          {error}
        </div>
      )}

      {/* ================= TAB 1: CATALOG ================= */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "all", label: "Todas las Categorías" },
              { id: "drink", label: "Bebidas & Cócteles" },
              { id: "food", label: "Cocina & Platos" },
              { id: "discount", label: "Descuentos" },
              { id: "experience", label: "Experiencias VIP" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${categoryFilter === f.id
                  ? "bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/30"
                  : "bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D]"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filteredRewards.length === 0 ? (
            <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-12 text-center text-[#8B949E] space-y-3">
              <Gift size={36} className="mx-auto opacity-30 text-[#F0B429]" />
              <h3 className="text-sm font-bold text-[#E6EDF3]">No hay recompensas en esta categoría</h3>
              <p className="text-xs max-w-sm mx-auto">
                Crea nuevas opciones de canje para incentivar a los clientes que usan la app del bar.
              </p>
              <button
                onClick={() => { setEditReward(null); setShowForm(true); }}
                className="mt-2 px-4 py-2 bg-[#F0B429] text-[#0D1117] font-bold text-xs rounded-xl"
              >
                Crear Primera Recompensa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredRewards.map((reward) => (
                <RewardCard
                  key={reward._id}
                  reward={reward}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={actions.toggleActive}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: VALIDATOR ================= */}
      {activeTab === "validator" && (
        <VoucherValidator
          onValidate={actions.validateVoucher}
          onClaim={actions.claimVoucher}
          onSuccessClaim={() => {
            actions.fetchKpis();
            actions.fetchRedemptions();
          }}
        />
      )}

      {/* ================= TAB 3: HISTORY ================= */}
      {activeTab === "history" && (
        <RedemptionsHistoryTable redemptions={redemptions} />
      )}

      {/* ================= MODAL FORM ================= */}
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

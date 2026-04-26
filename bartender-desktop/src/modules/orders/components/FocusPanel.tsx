import { ShieldAlert, CheckCircle2, Flame } from "lucide-react";

interface Props {
  selectedItem: any;
  recipeData?: any;
  onMarkReady?: () => void;
}

export default function FocusPanel({
  selectedItem,
  recipeData,
  onMarkReady,
}: Props) {
  if (!selectedItem) {
    return (
      <div className="w-full xl:w-96 border border-obsidian/60 bg-void/50 p-6 rounded-xl shadow-glass flex flex-col items-center justify-center text-center opacity-50">
        <ShieldAlert className="w-12 h-12 mb-4 text-gray-600" />
        <p className="text-xs tracking-widest uppercase font-bold text-gray-500">
          NO_ITEM_SELECTED
        </p>
        <p className="text-[10px] text-gray-600 mt-2 max-w-[200px]">
          Selecciona un item para ver receta y telemetría
        </p>
      </div>
    );
  }

  const name =
    selectedItem.name ||
    selectedItem.product?.name ||
    "PRODUCT";

  return (
    <div className="w-full xl:w-96 border border-obsidian/60 bg-void/60 p-6 rounded-xl shadow-glass flex flex-col min-h-[600px] xl:sticky xl:top-6">

      {/* HEADER */}
      <div className="mb-6">
        <span className="px-3 py-1 rounded-full text-[9px] font-bold border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6] mb-3 inline-block">
          FOCUS_MODE
        </span>

        <h2 className="text-xl font-black text-white leading-tight">
          {name.toUpperCase().replace(/\s+/g, "_")}
        </h2>

        <p className="text-[10px] text-gray-500 tracking-widest">
          LIVE_PREPARATION_PANEL
        </p>
      </div>

      {/* CONTENT */}
      {!recipeData ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-50">
          <Flame className="w-8 h-8 mb-2 text-gray-500 animate-pulse" />
          <p className="text-[10px] tracking-widest">
            FETCHING_RECIPE...
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6">

          {/* SPECS */}
          <div>
            <p className="text-[10px] text-gray-400 font-bold mb-2 tracking-widest">
              SPECIFICATIONS
            </p>

            <div className="grid grid-cols-2 gap-2">
              <SpecBox label="GLASS" value={recipeData.specifications?.glass} icon="🍸" />
              <SpecBox label="ICE" value={recipeData.specifications?.ice} icon="❄️" />
            </div>
          </div>

          {/* STEPS */}
          <div>
            <p className="text-[10px] text-gray-400 font-bold mb-2 tracking-widest">
              RECIPE
            </p>

            <div className="space-y-3">
              {recipeData.steps?.map((step: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <StepIndex i={i} />
                  <p className="text-xs text-gray-300 uppercase">
                    {step.instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* INGREDIENTS */}
          <div>
            <p className="text-[10px] text-gray-400 font-bold mb-2 tracking-widest">
              INVENTORY
            </p>

            <div className="space-y-2">
              {recipeData.ingredients?.map((ing: any, i: number) => {
                const low =
                  ing.inventoryItem?.stock <=
                  (ing.inventoryItem?.minStock || 1);

                return (
                  <div
                    key={i}
                    className={`flex justify-between p-2 rounded border text-xs ${
                      low
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : "bg-obsidian/20 border-obsidian text-green-400"
                    }`}
                  >
                    <span>
                      {ing.inventoryItem?.name?.toUpperCase()}
                    </span>

                    <span>
                      {low
                        ? "LOW"
                        : `${ing.inventoryItem?.stock}${ing.unit}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ACTION */}
      <div className="mt-6">
        <button
          onClick={onMarkReady}
          className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-black font-bold py-3 rounded flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={18} />
          MARK_ITEM_READY
        </button>
      </div>
    </div>
  );
}

/* =========================
   SUB COMPONENTS
========================= */

function SpecBox({ label, value, icon }: any) {
  return (
    <div className="bg-obsidian/30 border border-obsidian rounded p-3 text-center">
      <div className="text-lg">{icon}</div>
      <div className="text-[9px] text-gray-400">{label}</div>
      <div className="text-xs font-bold text-white">
        {(value || "N/A").toUpperCase()}
      </div>
    </div>
  );
}

function StepIndex({ i }: { i: number }) {
  return (
    <span className="w-5 h-5 flex items-center justify-center text-[9px] border border-[#8B5CF6]/30 text-[#8B5CF6] rounded">
      {(i + 1).toString().padStart(2, "0")}
    </span>
  );
}
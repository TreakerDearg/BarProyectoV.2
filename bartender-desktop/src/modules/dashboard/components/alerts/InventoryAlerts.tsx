import { AlertTriangle } from "lucide-react";

interface Props {
  lowStock: number;
  outOfStock: number;
}

export default function InventoryAlerts({ lowStock, outOfStock }: Props) {
  // Simularemos los items ya que el backend por ahora devuelve count
  return (
    <div className="bg-void border border-obsidian/40 rounded-xl p-6 shadow-glass">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-white text-sm">Inventory Alerts</h3>
        <AlertTriangle size={16} className="text-bar-red" />
      </div>

      <div className="space-y-3">
        {outOfStock > 0 && (
          <div className="flex items-center gap-4 p-3 rounded-lg border border-bar-red/20 bg-bar-red/5">
            <div className="w-10 h-10 rounded bg-obsidian flex items-center justify-center flex-shrink-0 border border-obsidian/60">
              <span className="text-bar-red text-xs font-bold">X</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{outOfStock} items out of stock</p>
              <p className="text-xs text-bar-red">Action required immediately</p>
            </div>
          </div>
        )}

        {lowStock > 0 && (
          <div className="flex items-center gap-4 p-3 rounded-lg border border-bar-orange/20 bg-bar-orange/5">
            <div className="w-10 h-10 rounded bg-obsidian flex items-center justify-center flex-shrink-0 border border-obsidian/60">
              <span className="text-bar-orange text-xs font-bold">!</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{lowStock} items low on stock</p>
              <p className="text-xs text-bar-orange">Consider restocking soon</p>
            </div>
          </div>
        )}

        {outOfStock === 0 && lowStock === 0 && (
           <p className="text-gray-500 text-sm">Inventory optimal.</p>
        )}
      </div>
    </div>
  );
}

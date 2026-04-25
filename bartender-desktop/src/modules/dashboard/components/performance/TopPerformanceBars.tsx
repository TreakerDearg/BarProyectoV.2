import type { TopProduct } from "../../services/dashboardService";

interface Props {
  title: string;
  items: TopProduct[];
  color: string;
  bgBar: string;
}

export default function TopPerformanceBars({ title, items, color, bgBar }: Props) {
  // Find max qty for relative bar widths
  const maxQty = Math.max(...items.map((i) => i.qty), 1);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {/* Placeholder Icon */}
        <div className={`p-1.5 rounded bg-obsidian ${color}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <h3 className="font-bold text-white text-sm">{title}</h3>
      </div>

      <div className="space-y-4">
        {items.length === 0 && <p className="text-gray-500 text-sm">No hay datos</p>}
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300 truncate pr-2">{item.name}</span>
              <span className="font-bold text-white">{item.qty} sold</span>
            </div>
            <div className="w-full bg-obsidian rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${bgBar} shadow-[0_0_10px_currentColor]`}
                style={{ width: `${(item.qty / maxQty) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

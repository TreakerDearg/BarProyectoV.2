// components/KpiCard.tsx
export function KpiCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-amber-400">{value}</p>
    </div>
  );
}
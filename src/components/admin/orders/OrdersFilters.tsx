"use client";

interface Props {
  filter: string;
  setFilter: (value: string) => void;
}

export default function OrdersFilters({ filter, setFilter }: Props) {
  const filters = [
    { label: "ALL ORDERS", value: "all" },
    { label: "PENDING", value: "pending" },
    { label: "MY STATION", value: "station" },
  ];

  return (
    <div className="flex gap-3 mb-6">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === f.value
              ? "bg-pink-500 text-black shadow-lg shadow-pink-500/40"
              : "bg-zinc-900 text-zinc-400 border border-zinc-700 hover:text-white"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
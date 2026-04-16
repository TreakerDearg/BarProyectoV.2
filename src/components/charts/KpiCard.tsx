interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export default function KpiCard({
  title,
  value,
  icon,
}: KpiCardProps) {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="text-sm text-zinc-400">{title}</p>
        <h2 className="text-xl neon-cyan font-bold">{value}</h2>
      </div>
      <div className="text-cyan-400 text-2xl">{icon}</div>
    </div>
  );
}
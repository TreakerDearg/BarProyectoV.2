export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-4 gap-4">
        <Card title="Ventas del Día" value="$0.00" />
        <Card title="Pedidos" value="0" />
        <Card title="Reservas" value="0" />
        <Card title="Mesas Ocupadas" value="0" />
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-amber-400">{value}</p>
    </div>
  );
}
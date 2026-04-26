export default function DynamicPricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Dynamic Pricing Control
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Ajustes dinamicos por demanda y contexto operativo, sin salir del layout principal.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 xl:col-span-6 bg-surface-container border border-white/10 rounded-xl p-5">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Global base multiplier</h2>
          <div className="text-4xl font-black text-primary">1.25x</div>
          <p className="text-xs text-gray-500 mt-2">+12% vs. ultima hora</p>
          <input type="range" min="0.5" max="3" step="0.05" defaultValue="1.25" className="w-full mt-4" />
        </section>

        <section className="col-span-12 xl:col-span-3 bg-surface-container border border-white/10 rounded-xl p-5">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Revenue impact</h2>
          <p className="text-3xl font-black text-white">+$12,450</p>
          <p className="text-xs text-gray-500 mt-2">Proyeccion diaria</p>
        </section>

        <section className="col-span-12 xl:col-span-3 bg-surface-container border border-white/10 rounded-xl p-5">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Demand threshold</h2>
          <p className="text-3xl font-black text-red-300">Critical</p>
          <p className="text-xs text-gray-500 mt-2">2 zonas superan capacidad</p>
        </section>

        <section className="col-span-12 bg-surface-container border border-white/10 rounded-xl p-5">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
            Category overrides (beta operativa)
          </h2>
          <div className="grid grid-cols-12 text-xs text-gray-400 mb-2">
            <span className="col-span-5">Producto</span>
            <span className="col-span-2">Base</span>
            <span className="col-span-2">Ajuste</span>
            <span className="col-span-3">Actual</span>
          </div>
          {[
            { name: "Vintage Cabernet", base: 120, adj: "+5%", now: 126 },
            { name: "Ribeye 12oz", base: 42.5, adj: "+20%", now: 51 },
            { name: "Old Fashioned", base: 16, adj: "-10%", now: 14.4 },
          ].map((row) => (
            <div key={row.name} className="grid grid-cols-12 text-sm border-t border-white/10 py-3">
              <span className="col-span-5 text-white">{row.name}</span>
              <span className="col-span-2">${row.base.toFixed(2)}</span>
              <span className="col-span-2 text-primary">{row.adj}</span>
              <span className="col-span-3 text-white font-semibold">${row.now.toFixed(2)}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Promotions Builder</h1>
        <p className="text-sm text-gray-400 mt-1">
          Configura promociones recurrentes y campañas temporales conectadas al ecosistema de descuentos.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 xl:col-span-7 bg-surface-container border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-gray-400">Configuration</h2>
          <input
            defaultValue="Happy Hour - Friday Night"
            className="w-full bg-surface-container-high border border-white/10 rounded-lg px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input type="time" defaultValue="16:00" className="bg-surface-container-high border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <input type="time" defaultValue="19:00" className="bg-surface-container-high border border-white/10 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <button
                key={d}
                className={`px-3 py-1.5 rounded-md text-xs border ${
                  d === "Fri" || d === "Sat"
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "border-white/10 text-gray-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        <section className="col-span-12 xl:col-span-5 bg-surface-container border border-white/10 rounded-xl p-5">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-4">Active schedule</h2>
          <div className="space-y-2 text-sm">
            <div className="p-3 rounded-lg border border-primary/30 bg-primary/10">
              <p className="text-white font-semibold">Happy Hour (Current)</p>
              <p className="text-xs text-gray-400">16:00 - 19:00 · Friday</p>
            </div>
            <div className="p-3 rounded-lg border border-white/10">
              <p className="text-white">Taco Thursday</p>
              <p className="text-xs text-gray-400">10:00 - 22:00 · Thursday</p>
            </div>
          </div>
        </section>

        <section className="col-span-12 bg-surface-container border border-white/10 rounded-xl p-5 flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-surface-container-high transition">
            Save Draft
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary text-black font-semibold">
            Deploy Campaign
          </button>
        </section>
      </div>
    </div>
  );
}

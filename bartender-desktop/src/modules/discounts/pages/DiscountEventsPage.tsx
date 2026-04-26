export default function DiscountEventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Discount Events</h1>
        <p className="text-sm text-gray-400 mt-1">
          Trazabilidad operativa de eventos de pricing y descuentos para auditoria y soporte.
        </p>
      </div>

      <section className="bg-surface-container border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm uppercase tracking-wider text-gray-400">System events</h2>
          <span className="text-xs text-gray-500">Auto refresh: 30s</span>
        </div>

        <div className="space-y-3">
          {[
            {
              title: "Base multiplier applied",
              detail: "Manager V. ajusto multiplicador global de 1.20x a 1.25x.",
              time: "Just now",
              level: "ok",
            },
            {
              title: "Scheduled reset: Happy Hour",
              detail: "Campaign 'Friday Night' programada para cierre a las 19:00.",
              time: "14 mins ago",
              level: "info",
            },
            {
              title: "Capacity warning: Kitchen",
              detail: "Wait-time promedio excedio 40 min. Recomendado +0.15x en mains.",
              time: "29 mins ago",
              level: "warn",
            },
          ].map((event) => (
            <article key={event.title} className="p-3 rounded-lg border border-white/10 bg-surface-container-high">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{event.title}</h3>
                <span className="text-xs text-gray-500">{event.time}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{event.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

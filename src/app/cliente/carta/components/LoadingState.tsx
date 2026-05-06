import { Loader2 } from "lucide-react";
import ui from "../../cliente-ui.module.css";

export default function LoadingState() {
  return (
    <section className={ui.statePanel} aria-live="polite">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Cargando carta en tiempo real…
      </div>

      <div className={ui.skeletonGrid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={ui.skeletonCard} />
        ))}
      </div>
    </section>
  );
}
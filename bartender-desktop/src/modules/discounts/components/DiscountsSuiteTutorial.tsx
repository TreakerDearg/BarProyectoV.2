import { X, CheckCircle2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const steps = [
  {
    title: "Vista Descuentos",
    text: "Aplica descuentos por orden de forma asistida: selecciona orden, items, tipo, motivo y confirma.",
  },
  {
    title: "Vista Dynamic Pricing",
    text: "Ajusta el multiplicador global para responder a demanda y ver impacto en catálogo en tiempo real.",
  },
  {
    title: "Vista Promotions",
    text: "Crea promociones programadas por rango horario, días y productos concretos.",
  },
  {
    title: "Vista Events",
    text: "Audita eventos del sistema de precios y descuentos para trazabilidad operativa.",
  },
  {
    title: "Flujo Recomendado",
    text: "Configura estrategia en Dynamic/Potions, aplica en Descuentos y monitorea en Events.",
  },
];

export default function DiscountsSuiteTutorial({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0b0f18] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-black text-ivory">Tutorial · Sistema Nebula Discounts</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-muted hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {steps.map((step) => (
            <div key={step.title} className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
              <p className="text-sm font-black text-gold uppercase tracking-widest">{step.title}</p>
              <p className="text-sm text-muted mt-1">{step.text}</p>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gold text-black font-bold flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}


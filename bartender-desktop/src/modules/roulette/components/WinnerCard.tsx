import { Zap, FlaskConical, Printer } from "lucide-react";
import type { SpinPhase, RouletteSpinResult } from "../types/roulette";
import RarityBadge from "./RarityBadge";

interface WinnerCardProps {
  result: RouletteSpinResult | null;
  phase: SpinPhase;
  onSpin: () => void;
}

function printPOSReceipt(result: RouletteSpinResult) {
  const drink = result.result;
  const product = typeof drink.product === "object" && drink.product ? drink.product : null;

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const ingredientsHTML =
    drink.recipe?.ingredients && drink.recipe.ingredients.length > 0
      ? `<ul style="list-style:none;padding:0;margin:8px 0 0 0;">
          ${drink.recipe.ingredients
            .map(
              (ing) =>
                `<li style="font-size:12px;margin:2px 0;">• ${ing.name} — ${ing.quantity} ${ing.unit}</li>`
            )
            .join("")}
         </ul>`
      : "<p style='font-size:12px;color:#666;'>Sin receta disponible</p>";

  const priceHTML =
    product?.dynamicPrice != null
      ? `<p style="font-size:14px;margin:4px 0;"><strong>Precio:</strong> $${product.dynamicPrice.toLocaleString("es-AR")}</p>`
      : "";

  const receiptHTML = `
    <div id="pos-receipt" style="font-family:monospace;max-width:280px;padding:16px;">
      <h2 style="text-align:center;font-size:16px;margin:0 0 8px 0;text-transform:uppercase;">
        🍸 RULETA ROYALE
      </h2>
      <hr style="border:1px dashed #000;margin:8px 0;"/>
      <p style="font-size:14px;font-weight:bold;margin:4px 0;text-transform:uppercase;">${drink.name}</p>
      <p style="font-size:12px;margin:2px 0;">Rareza: ${drink.rarity}</p>
      <p style="font-size:12px;margin:2px 0;">Categoría: ${drink.category}</p>
      ${priceHTML}
      <hr style="border:1px dashed #000;margin:8px 0;"/>
      <p style="font-size:12px;font-weight:bold;margin:4px 0;">INGREDIENTES:</p>
      ${ingredientsHTML}
      <hr style="border:1px dashed #000;margin:8px 0;"/>
      <p style="font-size:11px;color:#666;text-align:center;">${dateStr}</p>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `@media print { body * { display: none !important; } #pos-receipt { display: block !important; } }`;

  const div = document.createElement("div");
  div.innerHTML = receiptHTML;

  document.head.appendChild(style);
  document.body.appendChild(div);

  window.print();

  setTimeout(() => {
    document.head.removeChild(style);
    document.body.removeChild(div);
  }, 100);
}

export default function WinnerCard({ result, phase, onSpin }: WinnerCardProps) {
  const isIdle = phase === "idle";
  const isRevealed = phase === "revealed";
  const canSpin = isIdle || isRevealed;
  const spinning = phase !== "idle" && phase !== "revealed";

  const drink = result?.result ?? null;
  const product = drink && typeof drink.product === "object" && drink.product ? drink.product : null;

  return (
    <div className="glass-royale rounded-[3.5rem] p-8 border border-white/5 flex-1 flex flex-col justify-between relative overflow-hidden min-h-[280px]">
      {/* Decorative watermark */}
      <div className="absolute -right-10 -top-10 text-[100px] font-black text-white/5 pointer-events-none select-none uppercase tracking-tighter">
        ROYALE
      </div>

      <div>
        {/* ── Header ── */}
        <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em] block mb-5">
          ÚLTIMO GANADOR
        </span>

        {isRevealed && drink ? (
          <div className="animate-fade-in space-y-5">
            {/* ── Hero row ── */}
            <div className="flex items-center gap-5">
              {product?.image ? (
                <img
                  src={product.image}
                  alt={drink.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-gold/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-[1.5rem] bg-gold flex items-center justify-center text-3xl shadow-gold-glow animate-bounce-subtle">
                  🍸
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <RarityBadge rarity={drink.rarity} size="lg" />
                  <span className="text-[9px] font-black text-muted uppercase tracking-[0.3em]">
                    {drink.category}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-ivory tracking-tighter uppercase leading-tight capitalize">
                  {drink.name}
                </h2>
                {product?.description && (
                  <p className="text-[9px] text-muted mt-1 line-clamp-2">{product.description}</p>
                )}
              </div>
            </div>

            {/* ── Stats grid ── */}
            <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">
                  PROBABILIDAD
                </p>
                <span className="text-2xl font-black text-grad-gold tracking-tighter">
                  {(drink.probability ?? 0).toFixed(1)}%
                </span>
              </div>
              <div>
                <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">
                  TIRADAS
                </p>
                <span className="text-lg font-black text-ivory tracking-tight">
                  {drink.totalSpins ?? 0}
                </span>
              </div>
              {product?.dynamicPrice != null && (
                <div>
                  <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">
                    PRECIO
                  </p>
                  <span className="text-lg font-black text-ivory tracking-tight">
                    ${product.dynamicPrice.toLocaleString("es-AR")}
                  </span>
                </div>
              )}
            </div>

            {/* ── Ingredients ── */}
            {drink.recipe?.ingredients && drink.recipe.ingredients.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical size={13} className="text-gold/60" />
                  <span className="text-[9px] font-black text-muted uppercase tracking-widest">
                    Ingredientes
                  </span>
                </div>
                <ul className="space-y-1">
                  {drink.recipe.ingredients.map((ing, i) => (
                    <li key={i} className="text-[9px] text-ivory/80 font-mono">
                      <span className="text-gold/60 mr-1">•</span>
                      {ing.name}
                      <span className="text-muted"> — {ing.quantity} {ing.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Print POS ── */}
            <div className="pt-2">
              <button
                onClick={() => printPOSReceipt(result!)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-muted hover:text-ivory transition-all text-[9px] font-black uppercase tracking-widest"
              >
                <Printer size={13} />
                Imprimir comanda POS
              </button>
            </div>
          </div>
        ) : (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-2xl text-muted/40 mb-3 border border-white/5">
              🎰
            </div>
            <h3 className="text-xs font-black text-muted uppercase tracking-widest">
              Sin resultados aún
            </h3>
            <p className="text-[9px] text-muted/50 uppercase tracking-wider mt-2 max-w-[220px]">
              Lanzá la ruleta para ver el ganador
            </p>
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="pt-6 border-t border-white/5">
        <button
          onClick={onSpin}
          disabled={!canSpin}
          className="w-full flex items-center justify-center gap-4 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] bg-grad-gold text-bg shadow-gold-glow hover:scale-102 active:scale-98 transition-all disabled:opacity-50 disabled:grayscale cursor-pointer"
        >
          <Zap size={18} className={spinning ? "animate-spin" : ""} />
          {spinning ? "GIRANDO LA RULETA..." : "LANZAR DE NUEVO"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { Zap, FlaskConical, Printer, Sparkles, Award } from "lucide-react";
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
                `<li style="font-size:12px;margin:3px 0;">• ${ing.name} — ${ing.quantity} ${ing.unit}</li>`
            )
            .join("")}
         </ul>`
      : "<p style='font-size:12px;color:#888;'>Sin receta adjunta</p>";

  const priceHTML =
    product?.dynamicPrice != null
      ? `<p style="font-size:14px;margin:6px 0;"><strong>Precio POS:</strong> $${product.dynamicPrice.toLocaleString("es-AR")}</p>`
      : "";

  const receiptHTML = `
    <div id="pos-receipt" style="font-family:monospace;max-width:280px;padding:16px;background:#fff;color:#000;">
      <h2 style="text-align:center;font-size:16px;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:1px;">
        🍸 RULETA ROYALE
      </h2>
      <hr style="border:1px dashed #000;margin:8px 0;"/>
      <p style="font-size:15px;font-weight:bold;margin:4px 0;text-transform:uppercase;">${drink.name}</p>
      <p style="font-size:12px;margin:2px 0;">Rareza: ${drink.rarity}</p>
      <p style="font-size:12px;margin:2px 0;">Categoría: ${drink.category}</p>
      ${priceHTML}
      <hr style="border:1px dashed #000;margin:8px 0;"/>
      <p style="font-size:12px;font-weight:bold;margin:4px 0;">COMPOSICIÓN / INGREDIENTES:</p>
      ${ingredientsHTML}
      <hr style="border:1px dashed #000;margin:8px 0;"/>
      <p style="font-size:11px;color:#555;text-align:center;">${dateStr}</p>
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
    <div className="bg-surface-2 border border-border rounded-3xl p-6 sm:p-7 shadow-xl flex-1 flex flex-col justify-between relative overflow-hidden min-h-[360px]">
      {/* Marca de agua decorativa */}
      <div className="absolute -right-8 -top-8 text-7xl font-black text-white/[0.03] pointer-events-none select-none uppercase tracking-tighter">
        ROYALE
      </div>

      <div className="relative z-10">
        {/* Cabecera del Podio */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-gold" />
            <span className="text-xs font-black text-ivory uppercase tracking-widest">
              Podio de la Tirada
            </span>
          </div>
          {isRevealed && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald/10 border border-emerald/30 text-emerald text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} /> Ganador
            </span>
          )}
        </div>

        {/* Contenido Dinámico */}
        {isRevealed && drink ? (
          <div className="space-y-5 animate-fadeIn">
            {/* Ficha Principal del Ganador */}
            <div className="flex items-start gap-4">
              {product?.image ? (
                <img
                  src={product.image}
                  alt={drink.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-gold/40 shadow-md shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-gold-dark text-bg flex items-center justify-center text-3xl font-black shadow-gold-glow shrink-0">
                  🍸
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <RarityBadge rarity={drink.rarity} size="sm" />
                  <span className="text-xs text-muted font-bold uppercase tracking-wider">
                    {drink.category}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-ivory tracking-tight uppercase truncate">
                  {drink.name}
                </h3>
                {product?.description && (
                  <p className="text-xs text-muted line-clamp-2 mt-1">
                    {product.description}
                  </p>
                )}
              </div>
            </div>

            {/* Métricas del Trago */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-3/60 border border-border">
              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mb-0.5">
                  Probabilidad
                </p>
                <span className="text-lg sm:text-xl font-black text-gold">
                  {(drink.probability ?? 0).toFixed(1)}%
                </span>
              </div>
              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mb-0.5">
                  Tiradas
                </p>
                <span className="text-lg sm:text-xl font-black text-ivory">
                  {drink.totalSpins ?? 0}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mb-0.5">
                  Precio POS
                </p>
                <span className="text-lg sm:text-xl font-black text-emerald">
                  {product?.dynamicPrice != null ? `$${product.dynamicPrice.toLocaleString("es-AR")}` : "Incluido"}
                </span>
              </div>
            </div>

            {/* Receta & Composición */}
            {drink.recipe?.ingredients && drink.recipe.ingredients.length > 0 && (
              <div className="p-4 rounded-2xl bg-surface-3/40 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical size={14} className="text-gold" />
                  <span className="text-xs font-black text-ivory uppercase tracking-wider">
                    Ingredientes de la Receta
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {drink.recipe.ingredients.map((ing, i) => (
                    <div key={i} className="text-xs text-ivory/80 flex items-center justify-between bg-surface-2/60 px-2.5 py-1.5 rounded-lg border border-border">
                      <span className="truncate">{ing.name}</span>
                      <span className="text-gold font-bold shrink-0 ml-2">{ing.quantity} {ing.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acción de Comanda POS */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => printPOSReceipt(result!)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-3 hover:bg-surface-4 border border-border hover:border-gold/30 text-ivory text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Printer size={14} className="text-gold" />
                Imprimir Comanda POS
              </button>
            </div>
          </div>
        ) : (
          /* Estado Vacío / Espera de Giro */
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-3 border border-border flex items-center justify-center text-3xl mb-3 shadow-inner">
              🎲
            </div>
            <h4 className="text-sm font-black text-ivory uppercase tracking-wider">
              {spinning ? "Girando Ruleta..." : "Esperando Lanzamiento"}
            </h4>
            <p className="text-xs text-muted max-w-[260px] mt-1.5 leading-relaxed">
              {spinning
                ? "Determinando aleatoriamente el cóctel seleccionado según los pesos del pool."
                : "Presiona el botón inferior para iniciar el sorteo y descubrir el trago ganador."}
            </p>
          </div>
        )}
      </div>

      {/* Botón de Lanzamiento Heroico */}
      <div className="pt-6 border-t border-border mt-6 relative z-10">
        <button
          onClick={onSpin}
          disabled={!canSpin}
          className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all cursor-pointer shadow-lg ${
            canSpin
              ? "bg-gold hover:bg-gold-light text-bg shadow-gold-glow hover:scale-[1.01] active:scale-[0.99]"
              : "bg-surface-3 text-muted border border-border cursor-not-allowed opacity-60"
          }`}
        >
          <Zap size={18} className={spinning ? "animate-spin text-gold" : "text-bg"} />
          <span>
            {spinning
              ? "Girando Ruleta..."
              : isRevealed
              ? "Lanzar Nuevamente"
              : "Iniciar Giro Royale"}
          </span>
        </button>
      </div>
    </div>
  );
}

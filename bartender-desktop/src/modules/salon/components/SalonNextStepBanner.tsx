"use client";

import { ArrowRight } from "lucide-react";
import { getSalonNextStep } from "../utils/getSalonNextStep";
import type { Table } from "../../tables/types/table";

interface Props {
  table: Table | null;
  onAction?: () => void;
}

export default function SalonNextStepBanner({ table, onAction }: Props) {
  const step = getSalonNextStep(table);
  if (!step) return null;

  const toneClass =
    step.tone === "warning"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
      : step.tone === "success"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
        : "border-violet-400/25 bg-violet-500/10 text-violet-100";

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border ${toneClass}`}
      data-tutorial="next-step-banner"
    >
      <p className="text-sm font-medium flex-1 min-w-[200px]">
        <span className="font-semibold text-violet-200">Siguiente paso: </span>
        {step.message}
      </p>
      {step.actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold shrink-0"
        >
          {step.actionLabel}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

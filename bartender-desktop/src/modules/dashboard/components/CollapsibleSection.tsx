"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** En modo simple, empieza cerrado salvo que defaultOpen sea true */
  mode?: "simple" | "advanced";
}

export default function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
  mode = "advanced",
}: Props) {
  const [open, setOpen] = useState(
    mode === "advanced" ? defaultOpen : false
  );

  return (
    <section className="dashboard-panel overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left hover:bg-white/[0.02] transition-colors"
        aria-expanded={open}
      >
        <div>
          <h3 className="text-sm font-bold text-ivory tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-muted shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0 border-t border-white/5">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

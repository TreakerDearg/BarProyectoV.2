"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: ReactNode;
  expandedContent?: ReactNode;
  expanded?: boolean;
  onExpandToggle?: (expanded: boolean) => void;
  id?: string;
  className?: string;
}

export default function ExpandableCardWrapper({
  children,
  expandedContent,
  expanded: controlledExpanded,
  onExpandToggle,
  id,
  className = "",
}: Props) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const newState = !isExpanded;
    setInternalExpanded(newState);
    onExpandToggle?.(newState);
  };

  return (
    <div id={id} className={`relative ${className}`}>
      {/* Compact Content */}
      <div className="relative z-10">{children}</div>

      {/* Expanded Content */}
      {expandedContent && (
        <div
          className={`
            relative z-0 overflow-hidden transition-all duration-500 ease-in-out
            ${isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="bg-surface-3/30 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
            {expandedContent}
          </div>
        </div>
      )}

      {/* Expand Toggle Button (if expanded content exists) */}
      {expandedContent && (
        <button
          onClick={handleToggle}
          className="w-full mt-3 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all group"
        >
          <span className="text-[9px] font-black uppercase tracking-widest text-muted group-hover:text-ivory">
            {isExpanded ? "COLAPSAR DETALLES" : "VER DETALLES"}
          </span>
          {isExpanded ? (
            <ChevronUp size={14} className="text-muted group-hover:text-ivory transition-transform" />
          ) : (
            <ChevronDown size={14} className="text-muted group-hover:text-ivory transition-transform" />
          )}
        </button>
      )}
    </div>
  );
}

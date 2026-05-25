"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";

interface Props {
  content: string;
  title?: string;
  position?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
}

export default function RouletteTooltip({ 
  content, 
  title, 
  position = "top",
  children 
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      {children ? (
        <div onClick={() => setIsOpen(!isOpen)}>
          {children}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-gold transition-all"
          title="Mostrar ayuda"
        >
          <HelpCircle size={14} />
        </button>
      )}

      {isOpen && (
        <div className={`absolute z-50 w-72 p-4 glass-royale border border-gold/20 rounded-2xl shadow-2xl ${positionClasses[position]}`}>
          <div className="flex items-start justify-between gap-3 mb-2">
            {title && (
              <h4 className="text-xs font-black text-gold uppercase tracking-widest">
                {title}
              </h4>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-ivory transition-colors"
            >
              <X size={12} />
            </button>
          </div>
          <p className="text-[10px] text-muted/90 leading-relaxed">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}

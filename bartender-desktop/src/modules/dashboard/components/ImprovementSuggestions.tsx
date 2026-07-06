import { useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from "lucide-react";

interface Suggestion {
  id: string;
  text: string;
  type: "warning" | "info" | "success";
  icon?: React.ReactNode;
}

interface Props {
  suggestions: Suggestion[];
  title?: string;
  maxVisible?: number;
}

export default function ImprovementSuggestions({ 
  suggestions, 
  title = "Mejoras sugeridas",
  maxVisible = 3 
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleSuggestions = expanded ? suggestions : suggestions.slice(0, maxVisible);

  if (suggestions.length === 0) {
    return null;
  }

  const getIcon = (type: string, customIcon?: React.ReactNode) => {
    if (customIcon) return customIcon;
    switch (type) {
      case "warning":
        return <AlertTriangle size={16} className="text-gold" />;
      case "success":
        return <CheckCircle size={16} className="text-emerald-400" />;
      case "info":
      default:
        return <Lightbulb size={16} className="text-violet-300" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "warning":
        return "border-gold/30 bg-gold/5";
      case "success":
        return "border-emerald-400/30 bg-emerald-400/5";
      case "info":
      default:
        return "border-violet-400/30 bg-violet-400/5";
    }
  };

  return (
    <div className="dashboard-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={20} className="text-violet-300" />
        <h3 className="text-base font-bold text-ivory">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {visibleSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`flex items-start gap-3 p-3 rounded-xl border ${getTypeStyles(suggestion.type)}`}
          >
            <div className="mt-0.5 shrink-0">
              {getIcon(suggestion.type, suggestion.icon)}
            </div>
            <p className="text-sm text-muted leading-relaxed">{suggestion.text}</p>
          </div>
        ))}
      </div>

      {suggestions.length > maxVisible && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Ver más mejoras ({suggestions.length - maxVisible})
            </>
          )}
        </button>
      )}
    </div>
  );
}

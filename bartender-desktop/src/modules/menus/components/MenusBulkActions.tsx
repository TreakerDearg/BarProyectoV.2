"use client";

import { memo } from "react";
import { Trash2 } from "lucide-react";

interface Props {
  selectedCount: number;
  onCancel: () => void;
  onDelete: () => void;
}

function MenusBulkActions({ selectedCount, onCancel, onDelete }: Props) {
  return (
    <div className="p-4 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-between">
      <p className="text-xs font-semibold text-gold-300">
        {selectedCount} menú{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-muted text-xs font-semibold hover:text-ivory transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red/10 border border-red/30 text-red-300 text-xs font-semibold hover:bg-red/20 transition-colors"
        >
          <Trash2 size={14} />
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default memo(MenusBulkActions);

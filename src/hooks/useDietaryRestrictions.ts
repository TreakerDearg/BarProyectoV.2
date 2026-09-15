import { useState, useEffect } from "react";
import { onTableRestrictions } from "@/lib/realtime/socket";
import type { GuestDietaryEntry } from "@/lib/types/reservation";

export interface TableRestrictionsEvent {
  tableId: string;
  tableNumber: number;
  guestDietaryRestrictions: GuestDietaryEntry[];
  timestamp: number;
}

export function useDietaryRestrictions() {
  const [restrictions, setRestrictions] = useState<TableRestrictionsEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onTableRestrictions((event: TableRestrictionsEvent) => {
      setRestrictions(event);
      setVisible(true);

      // Auto-dismiss después de 8 segundos
      const timeout = setTimeout(() => {
        setVisible(false);
      }, 8000);

      return () => clearTimeout(timeout);
    });

    return unsubscribe;
  }, []);

  const dismiss = () => setVisible(false);

  return {
    restrictions,
    visible,
    dismiss,
  };
}

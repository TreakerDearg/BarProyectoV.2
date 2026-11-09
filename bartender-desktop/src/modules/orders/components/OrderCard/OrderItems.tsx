/**
 * OrderItems — Lista de ítems de la comanda con separación de estaciones.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Separa visualmente los ítems de Barra (drink) y Cocina (food) con encabezados dedicados.
 */
import { useMemo } from "react";
import type { OrderItem as IOrderItem } from "../../types/order";
import OrderItem from "./OrderItem";
import { Wine, ChefHat, Package } from "lucide-react";

interface Props {
  items: IOrderItem[];
  status: string;
  onSelectItem?: (item: any) => void;
  selectedItemId?: string;
}

export default function OrderItems({
  items,
  status,
  onSelectItem,
  selectedItemId,
}: Props) {
  // Group items by station: Barra vs Cocina vs Otros
  const { drinkItems, foodItems, otherItems } = useMemo(() => {
    const drinks: IOrderItem[] = [];
    const food: IOrderItem[] = [];
    const others: IOrderItem[] = [];

    items.forEach((item) => {
      const type =
        item.type ||
        (typeof item.product === "object" ? (item.product as any)?.type : undefined);

      if (type === "drink") {
        drinks.push(item);
      } else if (type === "food") {
        food.push(item);
      } else {
        others.push(item);
      }
    });

    return { drinkItems: drinks, foodItems: food, otherItems: others };
  }, [items]);

  const hasMixedStations =
    (drinkItems.length > 0 && foodItems.length > 0) ||
    (drinkItems.length > 0 && otherItems.length > 0) ||
    (foodItems.length > 0 && otherItems.length > 0);

  return (
    <div
      className="space-y-3 max-h-[260px] overflow-y-auto pr-1"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(240,180,41,0.3) transparent",
      }}
    >
      {/* ── Estación Barra ── */}
      {drinkItems.length > 0 && (
        <div className="space-y-1.5">
          {hasMixedStations && (
            <div className="flex items-center gap-1.5 px-1 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan border-b border-cyan/20 pb-1">
              <Wine size={12} />
              <span>Barra & Cócteles ({drinkItems.length})</span>
            </div>
          )}
          <div className="space-y-1.5">
            {drinkItems.map((item, idx) => (
              <OrderItem
                key={idx}
                item={item}
                status={status}
                onSelect={onSelectItem}
                isActive={selectedItemId === item._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Estación Cocina ── */}
      {foodItems.length > 0 && (
        <div className="space-y-1.5">
          {hasMixedStations && (
            <div className="flex items-center gap-1.5 px-1 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber border-b border-amber/20 pb-1">
              <ChefHat size={12} />
              <span>Cocina & Platos ({foodItems.length})</span>
            </div>
          )}
          <div className="space-y-1.5">
            {foodItems.map((item, idx) => (
              <OrderItem
                key={idx}
                item={item}
                status={status}
                onSelect={onSelectItem}
                isActive={selectedItemId === item._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Otros / Menús ── */}
      {otherItems.length > 0 && (
        <div className="space-y-1.5">
          {hasMixedStations && (
            <div className="flex items-center gap-1.5 px-1 py-0.5 text-[11px] font-bold uppercase tracking-wider text-text-muted border-b border-border/40 pb-1">
              <Package size={12} />
              <span>Otros / Menú ({otherItems.length})</span>
            </div>
          )}
          <div className="space-y-1.5">
            {otherItems.map((item, idx) => (
              <OrderItem
                key={idx}
                item={item}
                status={status}
                onSelect={onSelectItem}
                isActive={selectedItemId === item._id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import type { ProductBrief } from "@/lib/types/api";
import { Plus, UtensilsCrossed, Wine, Flame } from "lucide-react";
import clsx from "clsx";
import ui from "../../cliente-ui.module.css";

type ProductCardProps = {
  product: ProductBrief;
  cartQty?: number;
  onAdd?: (product: ProductBrief) => void;
};

function typeLabel(type: string | undefined) {
  const normalized = type?.toLowerCase() ?? "";
  if (normalized === "food" || normalized === "comida") return "Plato";
  if (
    normalized === "drink" ||
    normalized === "bebida" ||
    normalized === "cocktail"
  ) {
    return "Bebida";
  }
  return "Especial";
}

export default function ProductCard({
  product,
  cartQty = 0,
  onAdd,
}: ProductCardProps) {
  const ok = product.available !== false;

  const price =
    typeof product.price === "number"
      ? product.price
      : Number(product.price ?? 0);
  const normalizedType = (product.type ?? "").toLowerCase();
  const isDrink =
    normalizedType === "drink" ||
    normalizedType === "bebida" ||
    normalizedType === "cocktail";

  return (
    <article className={clsx(ui.cardBar, !ok && ui.cardBarDisabled)}>
      <div className={ui.cardBarGlow} aria-hidden />
      <div className={ui.cardBarContent}>
        <div className={ui.cardBarHeader}>
          <div className={ui.cardBarType}>
            <span className={clsx(ui.cardBarTypeIcon, isDrink && ui.cardBarTypeDrink)}>
              {isDrink ? (
                <Wine className="h-3.5 w-3.5" />
              ) : (
                <UtensilsCrossed className="h-3.5 w-3.5" />
              )}
            </span>
            <span>{typeLabel(product.type)}</span>
          </div>
          <span className={clsx(ui.cardBarBadge, ok ? ui.cardBarBadgeOk : ui.cardBarBadgeOff)}>
            {ok ? (
              <>
                <Flame className="h-3 w-3" />
                Disponible
              </>
            ) : (
              "Agotado"
            )}
          </span>
        </div>

        <div className={ui.cardBarBody}>
          <h4 className={ui.cardBarTitle}>{product.name}</h4>
          {product.description && (
            <p className={ui.cardBarDesc}>{product.description}</p>
          )}
        </div>

        <div className={ui.cardBarFooter}>
          <p className={ui.cardBarPrice}>
            ${price.toLocaleString("es-AR", {
              maximumFractionDigits: 0,
            })}
          </p>

          <div className={ui.cardBarActions}>
            {cartQty > 0 && (
              <span className={ui.cardBarCartBadge}>
                x{cartQty}
              </span>
            )}
            {onAdd && (
              <button
                type="button"
                onClick={() => onAdd(product)}
                disabled={!ok}
                className={ui.cardBarBtn}
              >
                <Plus className="h-4 w-4" />
                <span>Añadir</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

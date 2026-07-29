import type { ProductBrief } from "@/lib/types/api";
import { Plus, UtensilsCrossed, Wine, Flame, Check, ImageOff, Tag } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import ui from "../../cliente-ui.module.css";

type ProductCardProps = {
  product: ProductBrief;
  cartQty?: number;
  onAdd?: (product: ProductBrief) => void;
};

function typeLabel(type: string | undefined) {
  // Usar el tipo directamente del backend si está normalizado
  if (!type) return "Especial";
  
  const normalized = type.toLowerCase();
  // Capitalizar primera letra
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

export default function ProductCard({
  product,
  cartQty = 0,
  onAdd,
}: ProductCardProps) {
  const ok = product.available !== false;
  const [imageError, setImageError] = useState(false);

  const price =
    typeof product.price === "number"
      ? product.price
      : Number(product.price ?? 0);
  const normalizedType = (product.type ?? "").toLowerCase();
  const isDrink =
    normalizedType === "drink" ||
    normalizedType === "bebida" ||
    normalizedType === "cocktail";

  const handleImageError = () => {
    setImageError(true);
  };

  const hasValidImage = product.image && !imageError;
  
  // Detectar promociones si existen en el backend
  const hasPromotion = (product as any).promotion || (product as any).discount;
  const discountPrice = hasPromotion ? (product as any).discountPrice || (product as any).dynamicPrice : null;

  return (
    <article className={clsx(ui.cardV3, !ok && ui.cardV3Disabled)}>
      <div className={ui.cardV3Glow} aria-hidden />
      
      {/* Image or Placeholder */}
      <div className={ui.cardV3ImageContainer}>
        {hasValidImage ? (
          <img
            src={product.image}
            alt={product.name}
            className={ui.cardV3Image}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className={ui.cardV3ImagePlaceholder}>
            <ImageOff className={ui.cardV3PlaceholderIcon} />
            <span className={ui.cardV3PlaceholderText}>Sin imagen</span>
          </div>
        )}
      </div>

      {/* Type Badge */}
      <div className={ui.cardV3TypeBadge}>
        {isDrink ? (
          <Wine className="h-3 w-3" />
        ) : (
          <UtensilsCrossed className="h-3 w-3" />
        )}
        <span>{typeLabel(product.type)}</span>
      </div>

      {/* Promotion Badge */}
      {hasPromotion && (
        <div className={ui.cardV3PromotionBadge}>
          <Tag className="h-3 w-3" />
          <span>Promoción</span>
        </div>
      )}

      {/* Content */}
      <div className={ui.cardV3Content}>
        <div className={ui.cardV3Header}>
          <h4 className={ui.cardV3Title}>{product.name}</h4>
          <span className={clsx(ui.cardV3Availability, ok ? ui.cardV3Available : ui.cardV3Unavailable)}>
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

        {product.description && (
          <p className={ui.cardV3Desc}>{product.description}</p>
        )}

        <div className={ui.cardV3Footer}>
          <div className={ui.cardV3PriceContainer}>
            {hasPromotion && discountPrice && (
              <span className={ui.cardV3OriginalPrice}>
                ${price.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </span>
            )}
            <p className={clsx(ui.cardV3Price, hasPromotion && ui.cardV3DiscountPrice)}>
              ${(hasPromotion && discountPrice ? discountPrice : price).toLocaleString("es-AR", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => onAdd?.(product)}
            disabled={!ok}
            className={clsx(ui.cardV3QuickAdd, cartQty > 0 && ui.cardV3QuickAddActive)}
            aria-label={cartQty > 0 ? `${cartQty} en carrito` : "Agregar al carrito"}
          >
            {cartQty > 0 ? (
              <>
                <Check className="h-4 w-4" />
                <span className={ui.cardV3QuickAddQty}>{cartQty}</span>
              </>
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

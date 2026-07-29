"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { getPublicRouletteDrinks, spinRoulette } from "@/lib/api/bartender";
import { useClienteStore } from "@/stores/useClienteStore";
import { useRouletteSocket } from "@/hooks/useRouletteSocket";
import type { RouletteDrinkRow } from "@/lib/types/api";
import { Loader2, X, Trophy, Gift } from "lucide-react";
import clsx from "clsx";
import styles from "./Ruleta.module.css";
import { CartDrawer } from "@/components/cliente/CartDrawer";
import { RouletteHero } from "@/components/cliente/RouletteHero/RouletteHero";
import { RouletteWheel } from "@/components/cliente/RouletteWheel/RouletteWheel";
import { RouletteModal } from "@/components/cliente/RouletteModal/RouletteModal";
import { RouletteInfo } from "@/components/cliente/RouletteInfo/RouletteInfo";
import { BentoGrid, BentoItem } from "@/components/cliente/BentoGrid/BentoGrid";

function wheelGradient(drinks: RouletteDrinkRow[]) {
  const total =
    drinks.reduce((s, d) => s + (d.probability ?? 0), 0) || 1;
  let deg = 0;
  const parts: string[] = [];
  for (const d of drinks) {
    const pct = ((d.probability ?? 0) / total) * 100;
    const slice = (pct / 100) * 360;
    const color = d.color?.trim() || "#4a4f5c";
    const a = deg;
    const b = deg + slice;
    parts.push(`${color} ${a}deg ${b}deg`);
    deg = b;
  }
  if (!parts.length) return "conic-gradient(#333 0deg 360deg)";
  return `conic-gradient(from -90deg, ${parts.join(", ")})`;
}

export type RouletteState = "idle" | "spinning" | "winning" | "result" | "error" | "empty";

function RuletaPageContent() {
  const token = useClienteStore((s) => s.token);
  const { notification, showNotification, dismissNotification, isConnected, connectionQuality, reconnect } = useRouletteSocket();
  const [drinks, setDrinks] = useState<RouletteDrinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RouletteDrinkRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [lastWin, setLastWin] = useState<string | undefined>(undefined);
  const [state, setState] = useState<RouletteState>("idle");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getPublicRouletteDrinks()
      .then((data) => {
        if (alive) {
          setDrinks(data);
          setState(data.length === 0 ? "empty" : "idle");
        }
      })
      .catch((e: Error) => {
        if (alive) {
          setError(e.message);
          setState("error");
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const onSpinStart = useCallback(() => {
    if (!token) {
      setError("Iniciá sesión para girar la ruleta");
      return;
    }
    if (drinks.length === 0) {
      setError("No hay tragos disponibles");
      return;
    }
    setSpinning(true);
    setError(null);
    setResult(null);
    setState("spinning");
  }, [token, drinks.length]);

  const onSpinComplete = useCallback(async () => {
    try {
      const { result: r } = await spinRoulette();
      setResult(r as RouletteDrinkRow);
      setLastWin(r.name);
      setState("winning");
      
      // Show modal after celebration
      setTimeout(() => {
        setState("result");
        setIsModalOpen(true);
      }, 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo girar");
      setState("error");
    } finally {
      setSpinning(false);
    }
  }, []);

  const onAddToCart = useCallback(async () => {
    if (!result?.product) return;
    
    setIsAdding(true);
    try {
      // Reutilizar lógica existente del carrito
      const { useClienteStore } = await import("@/stores/useClienteStore");
      const store = useClienteStore.getState();
      
      if (result.product) {
        store.addToCart({
          productId: result.product._id,
          name: result.product.name,
          quantity: 1,
          notes: "",
        });
      }
      
      setIsModalOpen(false);
      setState("idle");
    } catch (e) {
      setError("No se pudo agregar al carrito");
    } finally {
      setIsAdding(false);
    }
  }, [result]);

  const onSpinAgain = useCallback(() => {
    setIsModalOpen(false);
    setResult(null);
    setState("idle");
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>Ruleta Nebula</div>
          <CartDrawer />
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400' : 'bg-red-400'
            } ${connectionQuality === 'poor' ? 'animate-pulse' : ''}`} />
            <span className="text-xs text-zinc-400">
              {isConnected ? 'En línea' : 'Desconectado'}
            </span>
            {!isConnected && (
              <button
                onClick={reconnect}
                className="text-xs text-amber-400 hover:text-amber-300 underline"
              >
                Reconectar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* NOTIFICATION SYSTEM */}
      {showNotification && notification && (
        <div className={styles.notificationOverlay} onClick={dismissNotification}>
          <div className={styles.notificationCard} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={dismissNotification}
              className={styles.notificationClose}
            >
              <X size={16} />
            </button>
            
            <div className={styles.notificationIcon}>
              {notification.meta.pityTriggered ? (
                <Trophy size={32} className={styles.trophyIcon} />
              ) : (
                <Gift size={32} className={styles.giftIcon} />
              )}
            </div>
            
            <div className={styles.notificationContent}>
              <h3 className={styles.notificationTitle}>
                {notification.meta.pityTriggered ? "¡PITY SYSTEM ACTIVADO!" : "¡FELICIDADES!"}
              </h3>
              <p className={styles.notificationMessage}>
                Has ganado: <strong>{notification.result.name}</strong>
              </p>
              <div className={styles.notificationRarity}>
                {notification.result.rarity}
              </div>
              {notification.meta.pityTriggered && (
                <p className={styles.notificationPity}>
                  Sistema Pity activado: {notification.meta.pityTarget} garantizado
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!token && (
        <div className={styles.alertInfo}>
          <Link href="/cliente/cuenta" className={styles.alertInfoLink}>
            Iniciá sesión
          </Link>{" "}
          para probar tu suerte
        </div>
      )}

      {error && <div className={styles.alertError}>{error}</div>}

      {state === "empty" && !error && (
        <div className={styles.empty}>
          <p>No hay tragos configurados en la ruleta</p>
        </div>
      )}

      {state !== "empty" && !error && drinks.length > 0 && (
        <BentoGrid columns={{ default: 1, sm: 2, lg: 3 }} variant="spacious">
          {/* Hero - Full width */}
          <BentoItem span={{ col: 1, row: 1 }} delay={0}>
            <RouletteHero onSpinStart={onSpinStart} disabled={spinning || !token} />
          </BentoItem>

          {/* Roulette Wheel - Center */}
          <BentoItem span={{ col: 1, row: 2 }} delay={1}>
            <div className={styles.wheelBento}>
              <RouletteWheel drinks={drinks} spinning={spinning} onSpinComplete={onSpinComplete} />
            </div>
          </BentoItem>

          {/* Info Panel */}
          <BentoItem span={{ col: 1, row: 1 }} delay={2}>
            <RouletteInfo drinks={drinks} lastWin={lastWin} />
          </BentoItem>
        </BentoGrid>
      )}

      {/* Result Modal */}
      <RouletteModal
        isOpen={isModalOpen}
        result={result}
        onAddToCart={onAddToCart}
        onSpinAgain={onSpinAgain}
        onClose={() => setIsModalOpen(false)}
        isAdding={isAdding}
      />
    </div>
  );
}

export default function RuletaPage() {
  return <RuletaPageContent />;
}

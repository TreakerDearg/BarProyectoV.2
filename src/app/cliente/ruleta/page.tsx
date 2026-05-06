"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPublicRouletteDrinks, spinRoulette } from "@/lib/api/bartender";
import { useClienteStore } from "@/stores/useClienteStore";
import type { RouletteDrinkRow } from "@/lib/types/api";
import { Loader2, Sparkles, PartyPopper, Play } from "lucide-react";
import clsx from "clsx";
import styles from "./Ruleta.module.css";

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

export default function RuletaPage() {
  const token = useClienteStore((s) => s.token);
  const [drinks, setDrinks] = useState<RouletteDrinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RouletteDrinkRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getPublicRouletteDrinks()
      .then((data) => {
        if (alive) setDrinks(data);
      })
      .catch((e: Error) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const gradient = useMemo(() => wheelGradient(drinks), [drinks]);

  async function onSpin() {
    if (!token) {
      setError("Iniciá sesión para girar la ruleta");
      return;
    }
    setSpinning(true);
    setError(null);
    setResult(null);
    try {
      const { result: r } = await spinRoulette();
      setResult(r as RouletteDrinkRow);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo girar");
    } finally {
      setSpinning(false);
    }
  }

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
        <div className={styles.headerIcon}>
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className={styles.headerTitle}>Ruleta Nebula</h1>
        <p className={styles.headerSubtitle}>
          Dejá que el azar elija tu próximo trago. ¿Te animás?
        </p>
      </header>

      {!token && (
        <div className={styles.alertInfo}>
          <Link href="/cliente/cuenta" className={styles.alertInfoLink}>
            Iniciá sesión
          </Link>{" "}
          para probar tu suerte
        </div>
      )}

      {error && <div className={styles.alertError}>{error}</div>}

      {drinks.length === 0 && !error && (
        <div className={styles.empty}>
          <p>No hay tragos configurados en la ruleta</p>
        </div>
      )}

      {drinks.length > 0 && (
        <div className={styles.wheelContainer}>
          <div className={styles.wheelWrapper}>
            <div className={styles.wheel}>
              <div
                className={clsx(styles.wheelInner, spinning && styles.wheelSpinning)}
                style={{ background: gradient }}
              />
            </div>
            <div className={styles.wheelCenter}>
              <Sparkles className={styles.wheelCenterIcon} />
            </div>
            <div className={styles.wheelPointer} />
          </div>

          <div className={styles.content}>
            <button
              type="button"
              disabled={spinning || !token}
              onClick={onSpin}
              className={styles.spinButton}
            >
              {spinning ? (
                <Loader2 className={clsx(styles.spinButtonIcon, styles.spinner)} />
              ) : (
                <>
                  <Play className={styles.spinButtonIcon} />
                  Girar la ruleta
                </>
              )}
            </button>

            {result && (
              <div className={styles.resultPanel}>
                <div className={styles.resultLabel}>
                  <PartyPopper className="h-4 w-4 inline mr-1" />
                  Tu trago
                </div>
                <div className={styles.resultName}>{result.name}</div>
                {result.rarity && (
                  <div className={styles.resultRarity}>
                    {result.rarity}
                  </div>
                )}
              </div>
            )}

            <div className={styles.optionsSection}>
              <div className={styles.optionsTitle}>Opciones</div>
              <div className={styles.optionsList}>
                {drinks.map((d) => (
                  <div key={d._id} className={styles.optionItem}>
                    <span className={styles.optionName}>{d.name}</span>
                    <span className={styles.optionProbability}>
                      {d.probability != null
                        ? `${d.probability.toFixed(1)}%`
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

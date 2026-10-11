"use client";

import { useState, useEffect } from "react";
import {
  Smartphone, Download, CheckCircle2, Sparkles,
  ChefHat, ShoppingBag, CalendarDays, RotateCw,
  ArrowRight, Shield, Zap, Star,
  ChevronDown, ChevronUp, AlertCircle, Gift,
} from "lucide-react";
import styles from "./descargar.module.css";

// ── Constantes ────────────────────────────────────────────────────
const APP_VERSION = "1.1.0";
const APP_SIZE    = "52 MB";

const APK_URL =
  (process.env.NEXT_PUBLIC_APK_URL as string | undefined) ??
  "https://expo.dev/accounts/nebulaclients-team/projects/sistema-nebula/builds";

const IS_DIRECT_APK = APK_URL.endsWith(".apk");

// ── Features ──────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <ChefHat size={22} />,
    label: "Carta Completa",
    desc: "Explorá cócteles, platos y bebidas sin esperar al mozo",
    badge: null,
  },
  {
    icon: <ShoppingBag size={22} />,
    label: "Pedidos en Mesa",
    desc: "Enviá tu comanda directamente desde la mesa",
    badge: null,
  },
  {
    icon: <CalendarDays size={22} />,
    label: "Reservas",
    desc: "Elegí fecha, horario y cantidad de personas",
    badge: null,
  },
  {
    icon: <RotateCw size={22} />,
    label: "Ruleta Nebula",
    desc: "Girá y ganás un trago — experiencia exclusiva de la app",
    badge: "EXCLUSIVO",
  },
  {
    icon: <Gift size={22} />,
    label: "Sistema de Puntos",
    desc: "Acumulá puntos en cada giro y pedido, canjeá recompensas VIP",
    badge: "NUEVO",
  },
  {
    icon: <Zap size={22} />,
    label: "Tiempo Real",
    desc: "Seguí el estado de tu pedido al instante con notificaciones",
    badge: null,
  },
] as const;

// ── Pasos de instalación ──────────────────────────────────────────
const STEPS = [
  {
    n: 1,
    icon: <Download size={18} />,
    title: "Descargá el APK",
    body: "Tocá el botón de descarga. El archivo .apk se descarga directamente en tu Android sin pasar por el Play Store.",
    tip: null,
  },
  {
    n: 2,
    icon: <Shield size={18} />,
    title: "Habilitá la instalación",
    body: 'Android pedirá permiso la primera vez. Andá a Ajustes → Seguridad → "Instalar apps de fuentes desconocidas" y activalo para tu navegador.',
    tip: "En Android 8 o superior el sistema te lleva directo al ajuste al intentar instalar — solo tocá "Ajustes" en el popup.",
  },
  {
    n: 3,
    icon: <Smartphone size={18} />,
    title: "Instalá y abrí",
    body: "Tocá el archivo .apk desde las notificaciones o la carpeta Descargas. Seguí los pasos del instalador y abrí Nebula.",
    tip: null,
  },
  {
    n: 4,
    icon: <Star size={18} />,
    title: "¡Ya estás listo!",
    body: "Iniciá sesión con tu cuenta o pedile al bartender que te registre. La app se conecta automáticamente al sistema del bar.",
    tip: null,
  },
] as const;

// ── Stats ─────────────────────────────────────────────────────────
const STATS = [
  { value: "4.9★", label: "Calificación" },
  { value: APP_SIZE, label: "Tamaño" },
  { value: "Android 8+", label: "Requisito" },
  { value: "Gratis", label: "Precio" },
] as const;

// ── Paso expandible ───────────────────────────────────────────────
function InstallStep({
  step,
  defaultOpen,
}: {
  step: typeof STEPS[number];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <li className={styles.stepItem}>
      <button
        type="button"
        className={styles.stepHeader}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.stepNumber} aria-hidden="true">{step.n}</span>
        <span className={styles.stepIconWrap} aria-hidden="true">{step.icon}</span>
        <span className={styles.stepTitle}>{step.title}</span>
        <span className={styles.stepChevron} aria-hidden="true">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <div className={styles.stepBody}>
          <p className={styles.stepText}>{step.body}</p>
          {step.tip && (
            <div className={styles.stepTip} role="note">
              <AlertCircle size={13} aria-hidden="true" />
              <span>{step.tip}</span>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

// ── Componente principal ──────────────────────────────────────────
export function DescargarClient() {
  const [isAndroid, setIsAndroid] = useState<boolean | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    setIsAndroid(/android/i.test(navigator.userAgent));
  }, []);

  function handleDownload() {
    if (!IS_DIRECT_APK) return;
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
    }, 1400);
  }

  const btnLabel = downloaded
    ? "¡Descarga iniciada!"
    : downloading
    ? "Preparando descarga…"
    : `Descargar APK · v${APP_VERSION}`;

  return (
    <div className={styles.page}>

      {/* ── BANNER: dispositivo detectado ───────────────────── */}
      {isAndroid && (
        <div className={styles.deviceBanner} role="status" aria-live="polite">
          <CheckCircle2 size={15} aria-hidden="true" />
          <span>Dispositivo Android detectado — listo para instalar</span>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="dl-title">

        {/* Ícono de app */}
        <div className={styles.appIconWrap} aria-hidden="true">
          <div className={styles.appIcon}>
            <Sparkles size={40} />
          </div>
          <div className={styles.appIconGlow} />
        </div>

        {/* Texto */}
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>
            <Sparkles size={11} aria-hidden="true" />
            Nebula Bar · App Oficial
          </span>

          <h1 id="dl-title" className={styles.heroTitle}>
            Todo el bar<br />
            <span className={styles.heroAccent}>en tu mano</span>
          </h1>

          <p className={styles.heroSub}>
            Pedidos en mesa, reservas, carta interactiva, ruleta exclusiva y
            sistema de puntos VIP. La experiencia Nebula completa para Android.
          </p>
        </div>

        {/* Stats */}
        <div className={styles.statsRow} aria-label="Datos de la aplicación">
          {STATS.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA principal */}
        <a
          href={APK_URL}
          className={`${styles.downloadBtn} ${downloaded ? styles.downloadBtnDone : ""} ${downloading ? styles.downloadBtnLoading : ""}`}
          target={IS_DIRECT_APK ? "_self" : "_blank"}
          rel="noreferrer"
          aria-label={`Descargar Nebula ${APP_VERSION} para Android`}
          download={IS_DIRECT_APK ? `nebula-bar-${APP_VERSION}.apk` : undefined}
          onClick={IS_DIRECT_APK ? handleDownload : undefined}
        >
          {downloaded
            ? <><CheckCircle2 size={20} aria-hidden="true" /> ¡Descarga iniciada!</>
            : <><Download size={20} aria-hidden="true" /> {btnLabel}</>
          }
        </a>

        <p className={styles.heroMeta}>
          Gratis · Solo Android · {APP_SIZE} · Sin Play Store
        </p>

        {/* Badge de seguridad */}
        <div className={styles.securityBadge}>
          <Shield size={13} aria-hidden="true" />
          <span>Build oficial · Firmado por EAS · Conexión cifrada HTTPS</span>
        </div>

      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className={styles.featuresSection} aria-labelledby="features-title">
        <div className={styles.sectionHeader}>
          <h2 id="features-title" className={styles.sectionTitle}>
            ¿Qué encontrás en la app?
          </h2>
          <p className={styles.sectionSub}>
            Diseñada para la experiencia completa en el local
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.label} className={styles.featureCard}>
              <div className={styles.featureIconWrap} aria-hidden="true">
                {f.icon}
              </div>
              <div className={styles.featureContent}>
                <div className={styles.featureLabelRow}>
                  <span className={styles.featureLabel}>{f.label}</span>
                  {f.badge && (
                    <span className={styles.featureBadge}>{f.badge}</span>
                  )}
                </div>
                <span className={styles.featureDesc}>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PASOS EXPANDIBLES ────────────────────────────────── */}
      <section className={styles.stepsSection} aria-labelledby="steps-title">
        <div className={styles.sectionHeader}>
          <h2 id="steps-title" className={styles.sectionTitle}>
            Cómo instalarla
          </h2>
          <p className={styles.sectionSub}>Tarda menos de 2 minutos</p>
        </div>

        <ol className={styles.stepsList}>
          {STEPS.map((step, i) => (
            <InstallStep key={step.n} step={step} defaultOpen={i === 0} />
          ))}
        </ol>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <div className={styles.ctaFinal}>
        <a
          href={APK_URL}
          className={styles.downloadBtn}
          target={IS_DIRECT_APK ? "_self" : "_blank"}
          rel="noreferrer"
          aria-label="Descargar Nebula para Android"
          download={IS_DIRECT_APK ? `nebula-bar-${APP_VERSION}.apk` : undefined}
        >
          <Download size={20} aria-hidden="true" />
          Descargar APK gratis
        </a>

        <a href="/cliente" className={styles.ctaSecondary}>
          Usar la versión web
          <ArrowRight size={15} aria-hidden="true" />
        </a>

        <p className={styles.ctaNote}>
          ¿Preferís no instalar nada? La versión web en tu navegador tiene
          las mismas funciones de carta y pedidos.
        </p>
      </div>

      {/* ── REQUISITOS ───────────────────────────────────────── */}
      <section className={styles.requirementsSection} aria-labelledby="req-title">
        <h2
          id="req-title"
          className={`${styles.sectionTitle} ${styles.sectionTitleSm}`}
        >
          Requisitos del sistema
        </h2>
        <ul className={styles.reqList}>
          <li>
            <span className={styles.reqLabel}>Sistema operativo</span>
            <span className={styles.reqValue}>Android 8.0 (Oreo) o superior</span>
          </li>
          <li>
            <span className={styles.reqLabel}>Almacenamiento libre</span>
            <span className={styles.reqValue}>{APP_SIZE}</span>
          </li>
          <li>
            <span className={styles.reqLabel}>Conexión</span>
            <span className={styles.reqValue}>WiFi o datos móviles requeridos</span>
          </li>
          <li>
            <span className={styles.reqLabel}>iOS</span>
            <span className={styles.reqValue}>Próximamente · Usá la versión web</span>
          </li>
        </ul>
      </section>

    </div>
  );
}

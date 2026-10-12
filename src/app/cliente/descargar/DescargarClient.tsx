"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Smartphone, Download, CheckCircle2, Sparkles,
  ChefHat, ShoppingBag, CalendarDays, RotateCw,
  ArrowRight, Shield, Zap, Star,
  ChevronDown, ChevronUp, AlertCircle, Gift,
} from "lucide-react";
import styles from "./descargar.module.css";

// ── Constantes ────────────────────────────────────────────────────
// Al publicar una release nueva: actualizá APP_VERSION, APP_SIZE,
// APK_URL y verificá que RELEASES_URL siga siendo válida.
// (GitHub → Releases → clic derecho sobre el .apk → copiar enlace)
const APP_VERSION = "1.1.0";
const APP_SIZE    = "122 MB";

const APK_URL =
  (process.env.NEXT_PUBLIC_APK_URL as string | undefined) ??
  "https://github.com/TreakerDearg/BarProyectoV.2/releases/download/App/nebula-cliente-v1.1.0.apk";

const RELEASES_URL = "https://github.com/TreakerDearg/BarProyectoV.2/releases";

const IS_DIRECT_APK = APK_URL.endsWith(".apk");

// ── Novedades de la versión ───────────────────────────────────────
const NEWS = [
  {
    icon: <Sparkles size={20} />,
    title: "Identidad NEBULA EMBER",
    desc: "Paleta ember sobre noche, tipografía editorial y micro-animaciones en todas las pantallas.",
  },
  {
    icon: <Zap size={20} />,
    title: "Más rápida",
    desc: "Arranque optimizado, listas más fluidas y búsqueda que responde al instante.",
  },
  {
    icon: <CheckCircle2 size={20} />,
    title: "Más accesible",
    desc: "Botones más grandes, mejor contraste y estados claros en cada flujo.",
  },
] as const;

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
    tip: 'En Android 8 o superior el sistema te lleva directo al ajuste al intentar instalar — solo tocá "Ajustes" en el popup.',
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
  { value: `v${APP_VERSION}`, label: "Versión" },
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
// Suscripción vacía y estable: el user-agent no cambia durante la sesión.
const subscribeNoop = () => () => {};

export function DescargarClient() {
  // Snapshot del cliente evaluado post-hidratación: en el servidor devuelve
  // false (sin mismatch de hidratación) y no necesita setState en un efecto.
  const isAndroid = useSyncExternalStore(
    subscribeNoop,
    () => /android/i.test(navigator.userAgent),
    () => false,
  );
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

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
    : "Descargar para Android";

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
      <section className={styles.heroStage} aria-labelledby="dl-title">

        <div className={styles.hero}>
          {/* Ícono de la app + chips flotantes (decorativo) */}
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.appIconGlow} />
            <div className={styles.appIcon}>
              <span className={styles.appIconMark}>N</span>
              <span className={styles.appIconChip}>v{APP_VERSION}</span>
            </div>
            <span className={styles.floatChipA}><RotateCw size={14} /> Ruleta</span>
            <span className={styles.floatChipB}><ChefHat size={14} /> Carta</span>
            <span className={styles.floatChipC}><Gift size={14} /> Puntos VIP</span>
          </div>

          {/* Texto */}
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>
              <Sparkles size={12} aria-hidden="true" />
              Nebula Bar · App oficial para Android
            </span>

            <h1 id="dl-title" className={styles.heroTitle}>
              El bar entero,<br />
              <span className={styles.heroAccent}>en tu mano.</span>
            </h1>

            <p className={styles.heroSub}>
              Pedidos en mesa, reservas, carta interactiva, la Ruleta Nebula y
              puntos VIP. La experiencia completa de Nebula Bar, ahora con la
              identidad <strong>NEBULA EMBER</strong>.
            </p>
          </div>
        </div>

        {/* CTA principal */}
        <div className={styles.ctaBlock}>
          <a
            href={APK_URL}
            className={`${styles.downloadBtn} ${downloaded ? styles.downloadBtnDone : ""} ${downloading ? styles.downloadBtnLoading : ""}`}
            target={IS_DIRECT_APK ? "_self" : "_blank"}
            rel="noreferrer"
            aria-label={`Descargar Nebula ${APP_VERSION} para Android (${APP_SIZE})`}
            download={IS_DIRECT_APK ? `nebula-bar-${APP_VERSION}.apk` : undefined}
            onClick={IS_DIRECT_APK ? handleDownload : undefined}
          >
            {downloaded
              ? <><CheckCircle2 size={20} aria-hidden="true" /> ¡Descarga iniciada!</>
              : <><Download size={20} aria-hidden="true" /> {btnLabel}</>
            }
            {!downloaded && !downloading && (
              <span className={styles.btnSize}>{APP_SIZE}</span>
            )}
          </a>

          <p className={styles.heroMeta}>
            Gratis · Android 8+ · Sin Play Store, instalación directa
          </p>

          <a
            className={styles.versionsLink}
            href={RELEASES_URL}
            target="_blank"
            rel="noreferrer"
          >
            Ver todas las versiones
            <ArrowRight size={13} aria-hidden="true" />
          </a>
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

        {/* Badge de seguridad */}
        <div className={styles.securityBadge}>
          <Shield size={13} aria-hidden="true" />
          <span>Build oficial firmada con EAS · Descarga directa desde GitHub · HTTPS</span>
        </div>

      </section>

      {/* ── NOVEDADES DE LA VERSIÓN ──────────────────────────── */}
      <section className={styles.newsSection} aria-labelledby="news-title">
        <div className={styles.sectionHeader}>
          <h2 id="news-title" className={styles.sectionTitle}>
            Novedades de la {APP_VERSION}
          </h2>
          <p className={styles.sectionSub}>Lo último que llegó a la app</p>
        </div>

        <div className={styles.newsGrid}>
          {NEWS.map((n) => (
            <div key={n.title} className={styles.newsCard}>
              <div className={styles.newsIconWrap} aria-hidden="true">{n.icon}</div>
              <span className={styles.newsTitle}>{n.title}</span>
              <span className={styles.newsDesc}>{n.desc}</span>
            </div>
          ))}
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
                    <span
                      className={`${styles.featureBadge} ${f.badge === "EXCLUSIVO" ? styles.featureBadgeWine : ""}`}
                    >
                      {f.badge}
                    </span>
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
          <span className={styles.btnSize}>{APP_SIZE}</span>
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

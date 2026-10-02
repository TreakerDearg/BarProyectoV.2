"use client";

import { useState } from "react";
import {
  Smartphone, Download, Terminal, CheckCircle2,
  Sparkles, ChefHat, ShoppingBag, CalendarDays,
  ArrowRight, Copy, Check,
} from "lucide-react";
import styles from "./descargar.module.css";

// ── Pasos de instalación ──────────────────────────────────────────
const STEPS = [
  {
    n: 1,
    title: "Descargá el archivo APK",
    body: "Tocá el botón de descarga. Tu navegador descargará el archivo .apk directamente desde los servidores de Expo.",
  },
  {
    n: 2,
    title: "Permitir instalación desde fuentes externas",
    body: 'Si es la primera vez, Android te pedirá habilitar "Instalar apps de fuentes desconocidas" en Ajustes → Seguridad. Es un paso único.',
  },
  {
    n: 3,
    title: "Abrir e instalar el APK",
    body: "Desde el panel de notificaciones o la carpeta de Descargas, tocá el archivo .apk y seguí los pasos del instalador.",
  },
  {
    n: 4,
    title: "¡Listo! Abrí Nebula",
    body: "La app aparecerá en tu pantalla de inicio. Iniciá sesión con tu cuenta o explorá como invitado.",
  },
];

// ── Features que destaca la app ───────────────────────────────────
const FEATURES = [
  { icon: <ChefHat size={20} />,     label: "Carta completa",      desc: "Cócteles, platos y más" },
  { icon: <ShoppingBag size={20} />, label: "Pedidos en mesa",     desc: "Enviá tu comanda al instante" },
  { icon: <CalendarDays size={20} />,label: "Reservas",            desc: "Elegí fecha y horario" },
  { icon: <Sparkles size={20} />,    label: "Ruleta Nebula",       desc: "Sorpresa exclusiva de la app" },
];

// ── Bloque copiable de comando EAS ───────────────────────────────
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.codeBlock}>
      <Terminal size={14} className={styles.codeIcon} aria-hidden="true" />
      <code className={styles.codeText}>{code}</code>
      <button
        type="button"
        className={styles.copyBtn}
        onClick={handleCopy}
        aria-label="Copiar comando"
      >
        {copied
          ? <Check size={13} className={styles.copyIconDone} />
          : <Copy size={13} />}
      </button>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────
export function DescargarClient() {
  // URL del APK compilado en EAS — apunta directamente a los builds del proyecto
  const APK_URL =
    process.env.NEXT_PUBLIC_APK_URL ??
    "https://expo.dev/accounts/nebulaclients-team/projects/sistema-nebula/builds";

  const isDirectLink = APK_URL.endsWith(".apk");

  return (
    <div className={styles.page}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="dl-title">
        <div className={styles.heroIcon} aria-hidden="true">
          <Smartphone size={36} />
        </div>

        <div className={styles.heroText}>
          <span className={styles.eyebrow}>
            <Sparkles size={12} aria-hidden="true" /> Nebula para Android
          </span>
          <h1 id="dl-title" className={styles.heroTitle}>
            La experiencia completa<br />
            <span className={styles.heroAccent}>en tu bolsillo</span>
          </h1>
          <p className={styles.heroSub}>
            Pedidos en mesa, reservas, ruleta y carta interactiva.
            Todo Nebula en una app nativa para Android.
          </p>
        </div>

        {/* CTA principal */}
        <a
          href={APK_URL}
          className={styles.downloadBtn}
          target="_blank"
          rel="noreferrer"
          aria-label="Descargar Nebula para Android"
          download={isDirectLink}
        >
          <Download size={20} aria-hidden="true" />
          Descargar APK para Android
        </a>

        <p className={styles.heroNote}>
          Gratis · Solo Android · Versión 1.0
        </p>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className={styles.featuresSection} aria-labelledby="features-title">
        <h2 id="features-title" className={styles.sectionTitle}>
          ¿Qué encontrás en la app?
        </h2>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.label} className={styles.featureCard}>
              <span className={styles.featureIcon} aria-hidden="true">{f.icon}</span>
              <span className={styles.featureLabel}>{f.label}</span>
              <span className={styles.featureDesc}>{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PASOS DE INSTALACIÓN ─────────────────────────────── */}
      <section className={styles.stepsSection} aria-labelledby="steps-title">
        <h2 id="steps-title" className={styles.sectionTitle}>Cómo instalarla</h2>
        <ol className={styles.stepsList}>
          {STEPS.map((s) => (
            <li key={s.n} className={styles.stepItem}>
              <span className={styles.stepNumber} aria-hidden="true">{s.n}</span>
              <div className={styles.stepContent}>
                <strong className={styles.stepTitle}>{s.title}</strong>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── BUILD PROPIO (para developers) ───────────────────── */}
      <section className={styles.devSection} aria-labelledby="dev-title">
        <div className={styles.devHeader}>
          <Terminal size={18} aria-hidden="true" />
          <h2 id="dev-title" className={styles.sectionTitle}>Compilar desde el código fuente</h2>
        </div>
        <p className={styles.devBody}>
          Si tenés acceso al código fuente podés compilar el APK directamente
          desde tu entorno con <strong>EAS Build</strong>:
        </p>
        <div className={styles.devSteps}>
          <div>
            <span className={styles.devStepLabel}>1. Instalar EAS CLI</span>
            <CodeBlock code="npm install -g eas-cli" />
          </div>
          <div>
            <span className={styles.devStepLabel}>2. Iniciar sesión en Expo</span>
            <CodeBlock code="eas login" />
          </div>
          <div>
            <span className={styles.devStepLabel}>3. Compilar APK (perfil preview)</span>
            <CodeBlock code="cd mobile-client && eas build -p android --profile preview" />
          </div>
        </div>
        <p className={styles.devNote}>
          El build tarda entre 10 y 20 minutos en los servidores de Expo.
          Al finalizar recibís un link de descarga directo.
        </p>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <div className={styles.ctaFinal}>
        <a
          href={APK_URL}
          className={styles.downloadBtn}
          target="_blank"
          rel="noreferrer"
          download={isDirectLink}
          aria-label="Descargar Nebula para Android"
        >
          <Download size={20} aria-hidden="true" />
          Descargar APK
        </a>
        <a href="/cliente" className={styles.ctaSecondary}>
          Volver a la carta web
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>

    </div>
  );
}

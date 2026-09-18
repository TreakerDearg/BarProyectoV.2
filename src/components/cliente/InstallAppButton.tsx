"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./InstallAppButton.module.css";

const APP_URL = "https://bar-proyecto-v-2-xst7.vercel.app/cliente/app";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const standalone = mediaQuery.matches ||
      ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));

    setIsStandalone(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  if (isStandalone || isDismissed) return null;

  const handleInstall = async () => {
    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      setInstallEvent(null);
      if (choice.outcome === "accepted") {
        window.setTimeout(() => window.location.assign(APP_URL), 350);
      }
      return;
    }

    if (isIos) {
      setShowIosHelp(true);
      return;
    }

    window.location.assign(APP_URL);
  };

  if (!installEvent && !isIos) return null;

  return (
    <>
      <button type="button" className={styles.button} onClick={handleInstall}>
        <Download size={17} aria-hidden="true" />
        <span>Instalar app</span>
      </button>
      <button
        type="button"
        className={styles.dismiss}
        onClick={() => setIsDismissed(true)}
        aria-label="Ocultar botón de instalación"
      >
        <X size={14} aria-hidden="true" />
      </button>

      {showIosHelp && (
        <div className={styles.overlay} role="presentation" onClick={() => setShowIosHelp(false)}>
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.close}
              onClick={() => setShowIosHelp(false)}
              aria-label="Cerrar instrucciones"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <div className={styles.dialogIcon} aria-hidden="true"><Share size={20} /></div>
            <p className={styles.eyebrow}>Instalación en iPhone</p>
            <h2 id="install-title">Lleva Nebula contigo</h2>
            <p className={styles.description}>
              Abre el menú Compartir de Safari y selecciona “Agregar a pantalla de inicio”.
            </p>
            <button type="button" className={styles.confirm} onClick={() => setShowIosHelp(false)}>
              Entendido
            </button>
          </section>
        </div>
      )}
    </>
  );
}

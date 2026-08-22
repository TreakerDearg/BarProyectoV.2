"use client";

import { useEffect, useRef, memo } from "react";
import ui from "../../../app/cliente/cliente-ui.module.css";

// Usa ref en lugar de state para evitar re-renders en cada mousemove.
// El transform se aplica directamente al DOM mediante ref.style.
function BackgroundLayer() {
  const ambient1Ref = useRef<HTMLDivElement>(null);
  const ambient2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // No activar en dispositivos táctiles (sin mouse real)
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      if (ambient1Ref.current) {
        ambient1Ref.current.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
      }
      if (ambient2Ref.current) {
        ambient2Ref.current.style.transform = `translate(${x * -0.3}px, ${y * -0.3}px)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={ui.backgroundLayer}>
      <div className={ui.backgroundLayerBase} />
      <div ref={ambient1Ref} className={ui.backgroundLayerAmbient1} />
      <div ref={ambient2Ref} className={ui.backgroundLayerAmbient2} />
      <div className={ui.backgroundLayerShape1} />
      <div className={ui.backgroundLayerShape2} />
      <div className={ui.backgroundLayerShape3} />
      <div className={ui.backgroundLayerPattern} />
      <div className={ui.backgroundLayerNoise} />
    </div>
  );
}

export default memo(BackgroundLayer);

"use client";

import { useEffect, useState } from "react";
import { memo } from "react";
import ui from "../../../app/cliente/cliente-ui.module.css";

function BackgroundLayer() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={ui.backgroundLayer}>
      {/* Base gradient */}
      <div className={ui.backgroundLayerBase} />

      {/* Ambient lighting - top right */}
      <div
        className={ui.backgroundLayerAmbient1}
        style={{
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
        }}
      />

      {/* Ambient lighting - bottom left */}
      <div
        className={ui.backgroundLayerAmbient2}
        style={{
          transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`,
        }}
      />

      {/* Organic shapes */}
      <div className={ui.backgroundLayerShape1} />
      <div className={ui.backgroundLayerShape2} />
      <div className={ui.backgroundLayerShape3} />

      {/* Subtle pattern */}
      <div className={ui.backgroundLayerPattern} />

      {/* Noise texture overlay */}
      <div className={ui.backgroundLayerNoise} />
    </div>
  );
}

export default memo(BackgroundLayer);

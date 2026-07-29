"use client";

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";

function AdvancedBackground() {
  const [mounted, setMounted] = useState(false);
  const [floatingLights, setFloatingLights] = useState<Array<{
    width: number;
    height: number;
    left: string;
    top: string;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    setMounted(true);
    setFloatingLights(
      [...Array(12)].map(() => ({
        width: Math.random() * 6 + 2,
        height: Math.random() * 6 + 2,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 2,
        duration: Math.random() * 6 + 6,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Aurora Effect - Purple */}
      <motion.div
        className="absolute top-0 left-1/4 w-[60vw] h-[50vw] max-w-[900px] max-h-[700px] bg-[var(--landing-accent-purple)]/15 rounded-full blur-[180px]"
        animate={{
          x: [0, 150, 0],
          y: [0, -80, 0],
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Aurora Effect - Gold */}
      <motion.div
        className="absolute top-0 right-1/4 w-[50vw] h-[45vw] max-w-[700px] max-h-[600px] bg-[var(--landing-accent-gold)]/12 rounded-full blur-[150px]"
        animate={{
          x: [0, -120, 0],
          y: [0, 100, 0],
          scale: [1, 1.25, 1],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Aurora Effect - Red */}
      <motion.div
        className="absolute bottom-0 left-1/3 w-[55vw] h-[48vw] max-w-[800px] max-h-[650px] bg-[var(--landing-accent-red)]/10 rounded-full blur-[160px]"
        animate={{
          x: [0, 100, 0],
          y: [0, -60, 0],
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.18, 0.1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Aurora Effect - Blue */}
      <motion.div
        className="absolute bottom-1/4 right-1/5 w-[40vw] h-[35vw] max-w-[600px] max-h-[500px] bg-[var(--landing-accent-blue)]/10 rounded-full blur-[140px]"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.15, 1],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Lights */}
      {mounted && floatingLights.map((light, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[var(--landing-accent-gold)]/25 blur-sm"
          style={{
            width: light.width,
            height: light.height,
            left: light.left,
            top: light.top,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{
            duration: light.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: light.delay,
          }}
        />
      ))}

      {/* Mesh Gradient Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,163,64,0.12), transparent),
            radial-gradient(ellipse 60% 40% at 100% 0%, rgba(120, 50, 200, 0.08), transparent),
            radial-gradient(ellipse 40% 30% at 0% 20%, rgba(200,50,40,0.06), transparent),
            radial-gradient(ellipse 50% 35% at 50% 100%, rgba(50,130,200,0.05), transparent)
          `,
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
    </div>
  );
}

export default memo(AdvancedBackground);

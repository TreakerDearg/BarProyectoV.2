import { useCallback, useRef, useState } from "react";
import type { RouletteRarity } from "../types/roulette";

/**
 * useRouletteAudio
 * Web Audio API synthesizer for the roulette system.
 * AudioContext is created lazily on first play() call to comply with
 * browser autoplay policies (requires a user gesture).
 */
export function useRouletteAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  // Keep ref in sync so callbacks always see current value
  const setMutedBoth = (val: boolean) => {
    isMutedRef.current = val;
    setIsMuted(val);
  };

  /* ── Lazy AudioContext ───────────────────────────────────────── */
  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {/* ignore */});
    }
    return ctxRef.current;
  }, []);

  /* ── playTick ────────────────────────────────────────────────── */
  /**
   * Plays a brief tick sound.
   * @param speed 0-1 — scales gain amplitude (faster → louder)
   */
  const playTick = useCallback(
    (speed: number) => {
      if (isMutedRef.current) return;

      try {
        const ctx = getCtx();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);

        const amplitude = 0.05 + speed * 0.15; // 0.05 – 0.20
        gain.gain.setValueAtTime(amplitude, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
      } catch {
        // AudioContext may not be available in all environments — fail silently
      }
    },
    [getCtx]
  );

  /* ── playImpact ──────────────────────────────────────────────── */
  /**
   * Plays a needle-landing impact: low sawtooth + white noise burst.
   */
  const playImpact = useCallback(() => {
    if (isMutedRef.current) return;

    try {
      const ctx = getCtx();
      const now = ctx.currentTime;

      // Sawtooth thud at 60Hz
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(60, now);
      oscGain.gain.setValueAtTime(0.3, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);

      // White noise burst
      const bufferSize = ctx.sampleRate * 0.05; // 50ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      source.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      source.start(now);
      source.stop(now + 0.05);
    } catch {
      // fail silently
    }
  }, [getCtx]);

  /* ── playFanfare ─────────────────────────────────────────────── */
  /**
   * Plays a fanfare scaled by rarity.
   * COMMON  → 2 notes, 300ms
   * RARE    → 3 notes, 500ms
   * EPIC    → 4 notes + sub, 700ms
   * LEGENDARY → 5-note arpeggio + bell partial + reverb, 1.2s
   */
  const playFanfare = useCallback(
    (rarity: RouletteRarity) => {
      if (isMutedRef.current) return;

      try {
        const ctx = getCtx();
        const now = ctx.currentTime;

        const playNote = (
          freq: number,
          startOffset: number,
          duration: number,
          gain: number,
          type: OscillatorType = "sine"
        ) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();

          osc.type = type;
          osc.frequency.setValueAtTime(freq, now + startOffset);

          g.gain.setValueAtTime(0, now + startOffset);
          g.gain.linearRampToValueAtTime(gain, now + startOffset + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);

          osc.connect(g);
          g.connect(ctx.destination);

          osc.start(now + startOffset);
          osc.stop(now + startOffset + duration + 0.05);
        };

        if (rarity === "COMMON") {
          // C5, E5
          playNote(523.25, 0,    0.18, 0.18);
          playNote(659.25, 0.12, 0.20, 0.18);
        }

        if (rarity === "RARE") {
          // C5, E5, G5
          playNote(523.25, 0,    0.20, 0.20);
          playNote(659.25, 0.14, 0.20, 0.20);
          playNote(783.99, 0.28, 0.25, 0.20);
        }

        if (rarity === "EPIC") {
          // C4 sub, then E5, G5, B5
          playNote(261.63, 0,    0.30, 0.20, "sawtooth"); // sub
          playNote(659.25, 0.08, 0.22, 0.22);
          playNote(783.99, 0.22, 0.22, 0.22);
          playNote(987.77, 0.36, 0.30, 0.22);
        }

        if (rarity === "LEGENDARY") {
          // 5-note arpeggio: C5, E5, G5, B5, C6
          playNote(523.25, 0,    0.25, 0.20);
          playNote(659.25, 0.12, 0.25, 0.20);
          playNote(783.99, 0.24, 0.25, 0.20);
          playNote(987.77, 0.36, 0.25, 0.20);
          playNote(1046.5, 0.48, 0.50, 0.25);

          // Bell partial (triangle at high freq)
          playNote(1760,   0.48, 0.70, 0.10, "triangle");

          // Reverb via convolver
          try {
            const reverbLen = ctx.sampleRate * 1.2;
            const reverbBuf = ctx.createBuffer(2, reverbLen, ctx.sampleRate);
            for (let ch = 0; ch < 2; ch++) {
              const d = reverbBuf.getChannelData(ch);
              for (let i = 0; i < reverbLen; i++) {
                d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2);
              }
            }
            const convolver = ctx.createConvolver();
            convolver.buffer = reverbBuf;

            const reverbOsc = ctx.createOscillator();
            const reverbGain = ctx.createGain();
            reverbOsc.type = "sine";
            reverbOsc.frequency.setValueAtTime(1046.5, now + 0.48);
            reverbGain.gain.setValueAtTime(0.06, now + 0.48);
            reverbGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
            reverbOsc.connect(convolver);
            convolver.connect(reverbGain);
            reverbGain.connect(ctx.destination);
            reverbOsc.start(now + 0.48);
            reverbOsc.stop(now + 1.2);
          } catch {
            // convolver might fail in some contexts
          }
        }
      } catch {
        // fail silently
      }
    },
    [getCtx]
  );

  /* ── toggleMute ──────────────────────────────────────────────── */
  const toggleMute = useCallback(() => {
    setMutedBoth(!isMutedRef.current);
  }, []);

  return {
    playTick,
    playImpact,
    playFanfare,
    isMuted,
    toggleMute,
  };
}

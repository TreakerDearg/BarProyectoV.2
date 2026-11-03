// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Roulette shared types
// ─────────────────────────────────────────────────────────────────────────────

export type SpinState = 'idle' | 'spinning' | 'revealing' | 'result';

export interface SpinHistoryItem {
  id:        string;
  name:      string;
  rarity:    string;
  timestamp: Date;
}

export interface PityStats {
  spinsSinceRare:      number;
  spinsSinceEpic:      number;
  spinsSinceLegendary: number;
}

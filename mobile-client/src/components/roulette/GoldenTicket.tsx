// ─────────────────────────────────────────────────────────────────────────────
// GoldenTicket — VIP ticket overlay with QR code and countdown timer
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// ── Rarity badge colors ───────────────────────────────────────────────────
const RARITY_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  COMMON:    { bg: 'rgba(155,143,125,0.18)', text: '#9b8f7d', label: '⚪ COMMON'    },
  RARE:      { bg: 'rgba(56,189,248,0.18)',  text: '#38BDF8', label: '🔵 RARE'       },
  EPIC:      { bg: 'rgba(168,85,247,0.18)',  text: '#a855f7', label: '🟣 EPIC'       },
  LEGENDARY: { bg: 'rgba(212,163,64,0.18)',  text: '#D4A340', label: '⭐ LEGENDARY'  },
};

// ── Format milliseconds as mm:ss ─────────────────────────────────────────
function fmtMs(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const mins     = Math.floor(totalSec / 60);
  const secs     = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ── Props ─────────────────────────────────────────────────────────────────
interface GoldenTicketProps {
  ticket:    string;
  expiresAt: number;   // Unix timestamp (ms)
  drinkName: string;
  rarity:    string;
  onClose:   () => void;
}

// ── Component ─────────────────────────────────────────────────────────────
export const GoldenTicket: React.FC<GoldenTicketProps> = ({
  ticket,
  expiresAt,
  drinkName,
  rarity,
  onClose,
}) => {
  const [remainingMs, setRemainingMs] = useState<number>(() => expiresAt - Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const ms = expiresAt - Date.now();
      setRemainingMs(ms);
      if (ms <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [expiresAt]);

  const expired = remainingMs <= 0;
  const badge   = RARITY_BADGE[rarity] ?? RARITY_BADGE.COMMON;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Rarity badge */}
          <View style={[styles.rarityBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.rarityText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>

          {/* Drink name */}
          <Text style={styles.drinkName}>{drinkName}</Text>

          {/* Sub-label */}
          <Text style={styles.subLabel}>TICKET VIP NEBULA</Text>

          {/* QR Code */}
          <View style={[styles.qrContainer, expired && styles.qrExpired]}>
            <QRCode
              value={ticket}
              size={200}
              color="#D4A340"
              backgroundColor="#0F0F14"
            />
          </View>

          {/* Countdown */}
          {!expired ? (
            <Text style={styles.countdown}>
              Válido por {fmtMs(remainingMs)}
            </Text>
          ) : (
            <Text style={styles.countdownExpired}>TICKET EXPIRADO</Text>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Instruction */}
          <Text style={styles.instruction}>
            Presentá este código al bartender para canjear tu bebida.
          </Text>

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar ticket">
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default GoldenTicket;

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent:  'center',
    alignItems:      'center',
    padding:         24,
  },
  card: {
    width:           '100%',
    maxWidth:        360,
    backgroundColor: '#0F0F14',
    borderWidth:     2,
    borderColor:     '#D4A340',
    borderRadius:    24,
    padding:         24,
    alignItems:      'center',
    gap:             12,
  },

  // Rarity badge
  rarityBadge: {
    borderRadius:    100,
    paddingHorizontal: 14,
    paddingVertical:   5,
    marginBottom:    4,
  },
  rarityText: {
    fontSize:      13,
    fontWeight:    '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Drink name
  drinkName: {
    fontSize:   26,
    fontWeight: '700',
    color:      '#D4A340',
    textAlign:  'center',
    letterSpacing: -0.3,
  },
  subLabel: {
    fontSize:      11,
    fontWeight:    '600',
    color:         'rgba(212,163,64,0.6)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop:     -4,
  },

  // QR
  qrContainer: {
    padding:      12,
    borderRadius: 12,
    borderWidth:  1,
    borderColor:  'rgba(212,163,64,0.25)',
    marginVertical: 4,
  },
  qrExpired: {
    opacity: 0.3,
  },

  // Countdown
  countdown: {
    fontSize:   15,
    color:      '#D4A340',
    fontWeight: '600',
  },
  countdownExpired: {
    fontSize:   15,
    color:      '#ef4444',
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Divider
  divider: {
    width:           '100%',
    height:          1,
    backgroundColor: 'rgba(212,163,64,0.15)',
    marginVertical:  4,
  },

  // Instruction
  instruction: {
    fontSize:  13,
    color:     'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },

  // Close button
  closeBtn: {
    marginTop:       4,
    backgroundColor: 'rgba(212,163,64,0.12)',
    borderWidth:     1,
    borderColor:     'rgba(212,163,64,0.35)',
    borderRadius:    100,
    paddingHorizontal: 32,
    paddingVertical:   10,
  },
  closeBtnText: {
    color:      '#D4A340',
    fontWeight: '600',
    fontSize:   15,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// GoldenTicket — ticket VIP (overlay) con QR y cuenta regresiva
// Contexto VIP/LEGENDARY: el oro está reservado para este artefacto.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Colors, NocturneColors } from '../../theme/colors';

// Efecto neutro de render (shimmer blanco), no es color de identidad
const SHIMMER_COLOR = 'rgba(255,255,255,0.06)';

// ── Colores de rareza (LEGENDARY conserva oro reservado) ─────────────────
const RARITY_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  COMMON:    { bg: NocturneColors.surfaceContainerHigh, text: Colors.outline,                    label: '⚪ COMMON'    },
  RARE:      { bg: NocturneColors.infoMuted,            text: Colors.info,                       label: '🔵 RARE'       },
  EPIC:      { bg: NocturneColors.wineMuted,            text: NocturneColors.onSecondaryContainer, label: '🟣 EPIC'     },
  LEGENDARY: { bg: NocturneColors.vipGoldMuted,         text: NocturneColors.vipGold,            label: '⭐ LEGENDARY'  },
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
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Slide-up entry animation ──────────────────────────────────────────
  const slideAnim   = useRef(new Animated.Value(100)).current;
  const shimmerAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 100, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 400, duration: 2500, useNativeDriver: true })
    ).start();
  }, []);

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
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
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
              color={NocturneColors.vipGoldDark}
              backgroundColor={NocturneColors.surfaceContainerLowest}
            />
          </View>

          {/* Countdown */}
          {!expired ? (
            <Text style={[styles.countdown, remainingMs < 300000 && styles.countdownCritical]}>
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

          {/* Shimmer overlay */}
          <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerAnim }] }]} />

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar ticket">
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default GoldenTicket;

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: NocturneColors.overlayDark,
    justifyContent:  'center',
    alignItems:      'center',
    padding:         24,
  },
  card: {
    width:           '100%',
    maxWidth:        360,
    backgroundColor: NocturneColors.surfaceContainerLowest,
    borderWidth:     2,
    borderColor:     NocturneColors.vipGoldDark,
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
    color:      NocturneColors.vipGold,
    textAlign:  'center',
    letterSpacing: -0.3,
  },
  subLabel: {
    fontSize:      11,
    fontWeight:    '600',
    color:         NocturneColors.vipGoldDark,
    opacity:       0.7,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop:     -4,
  },

  // QR
  qrContainer: {
    padding:      12,
    borderRadius: 12,
    borderWidth:  1,
    borderColor:  NocturneColors.vipGoldGlow,
    marginVertical: 4,
  },
  qrExpired: {
    opacity: 0.3,
  },

  // Countdown
  countdown: {
    fontSize:   15,
    color:      NocturneColors.vipGoldDark,
    fontWeight: '600',
  },
  countdownCritical: {
    color: Colors.error,
  },
  countdownExpired: {
    fontSize:   15,
    color:      Colors.error,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Divider
  divider: {
    width:           '100%',
    height:          1,
    backgroundColor: NocturneColors.vipGoldMuted,
    marginVertical:  4,
  },

  // Instruction
  instruction: {
    fontSize:  13,
    color:     Colors.outline,
    textAlign: 'center',
  },

  // Close button
  closeBtn: {
    marginTop:       4,
    backgroundColor: NocturneColors.vipGoldMuted,
    borderWidth:     1,
    borderColor:     NocturneColors.vipGoldGlowStrong,
    borderRadius:    100,
    paddingHorizontal: 32,
    paddingVertical:   10,
  },
  closeBtnText: {
    color:      NocturneColors.vipGoldDark,
    fontWeight: '600',
    fontSize:   15,
  },

  // Shimmer
  shimmer: {
    position:        'absolute',
    top:             0,
    bottom:          0,
    width:           80,
    backgroundColor: SHIMMER_COLOR,
  },
});

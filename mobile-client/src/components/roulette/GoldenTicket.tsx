// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — GoldenTicket (v2)
// Ticket VIP con QR y cuenta regresiva. Sin emojis.
// Sin reanimated — usa Animated de RN.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Animated, Easing,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ticket } from 'lucide-react-native';

import { Colors, NocturneColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { RarityIcon } from '../shared/RarityIcon';

const SHIMMER_COLOR = 'rgba(255,255,255,0.06)';

const RARITY_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  COMMON:    { bg: NocturneColors.surfaceContainerHigh, text: Colors.outline,                      label: 'COMMON'    },
  RARE:      { bg: NocturneColors.infoMuted,            text: Colors.info,                         label: 'RARE'      },
  EPIC:      { bg: NocturneColors.wineMuted,            text: NocturneColors.onSecondaryContainer, label: 'EPIC'      },
  LEGENDARY: { bg: NocturneColors.vipGoldMuted,         text: NocturneColors.vipGold,              label: 'LEGENDARY' },
};

function fmtMs(ms: number): string {
  if (ms <= 0) return '00:00';
  const secs = Math.floor(ms / 1000);
  return `${String(Math.floor(secs / 60)).padStart(2,'0')}:${String(secs % 60).padStart(2,'0')}`;
}

interface GoldenTicketProps {
  ticket:    string;
  expiresAt: number;
  drinkName: string;
  rarity:    string;
  onClose:   () => void;
}

export const GoldenTicket: React.FC<GoldenTicketProps> = ({
  ticket, expiresAt, drinkName, rarity, onClose,
}) => {
  const [remainingMs, setRemainingMs] = useState(() => expiresAt - Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Slide-up entry
  const slideY      = useRef(new Animated.Value(120)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const shimmerX    = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY,      { toValue: 0,   friction: 7, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1,   duration: 250, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.timing(shimmerX, { toValue: 400, duration: 2500, easing: Easing.linear, useNativeDriver: true }),
    ).start();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const ms = expiresAt - Date.now();
      setRemainingMs(ms);
      if (ms <= 0 && intervalRef.current) clearInterval(intervalRef.current);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [expiresAt]);

  const expired = remainingMs <= 0;
  const badge   = RARITY_BADGE[rarity] ?? RARITY_BADGE.COMMON;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.cardWrapper, { opacity: cardOpacity, transform: [{ translateY: slideY }] }]}>
          <View style={styles.card}>
            <Ticket size={28} color={NocturneColors.vipGoldDark} />

            <View style={[styles.rarityBadge, { backgroundColor: badge.bg }]}>
              <RarityIcon rarity={rarity} size={13} color={badge.text} />
              <Text style={[styles.rarityText, { color: badge.text }]}>{badge.label}</Text>
            </View>

            <Text style={styles.drinkName}>{drinkName}</Text>
            <Text style={styles.subLabel}>TICKET VIP NEBULA</Text>

            <View style={[styles.qrContainer, expired && styles.qrExpired]}>
              <QRCode value={ticket} size={200} color={NocturneColors.vipGoldDark} backgroundColor={NocturneColors.surfaceContainerLowest} />
            </View>

            {!expired
              ? <Text style={[styles.countdown, remainingMs < 300000 && styles.countdownCritical]}>Válido por {fmtMs(remainingMs)}</Text>
              : <Text style={styles.countdownExpired}>TICKET EXPIRADO</Text>
            }

            <View style={styles.divider} />
            <Text style={styles.instruction}>Presentá este código al bartender para canjear tu bebida.</Text>

            <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]} />

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default GoldenTicket;

const styles = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: NocturneColors.overlayDark, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  cardWrapper: { width: '100%' },
  card:        { width: '100%', maxWidth: 360, alignSelf: 'center', backgroundColor: NocturneColors.surfaceContainerLowest, borderWidth: 2, borderColor: NocturneColors.vipGoldDark, borderRadius: Radius.xxl, padding: Spacing.lg, alignItems: 'center', gap: Spacing.smMd, overflow: 'hidden' },
  rarityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 5 },
  rarityText:  { ...Typography.labelSm, textTransform: 'uppercase' as const, letterSpacing: 1 },
  drinkName:   { ...Typography.headlineLg, color: NocturneColors.vipGold, textAlign: 'center' },
  subLabel:    { ...Typography.labelSm, color: NocturneColors.vipGoldDark, opacity: 0.7, letterSpacing: 3 },
  qrContainer: { padding: Spacing.smMd, borderRadius: Radius.lg, borderWidth: 1, borderColor: NocturneColors.vipGoldGlow, marginVertical: Spacing.xs },
  qrExpired:   { opacity: 0.3 },
  countdown:   { ...Typography.titleMd, color: NocturneColors.vipGoldDark },
  countdownCritical: { color: Colors.error },
  countdownExpired:  { ...Typography.labelLg, color: Colors.error, letterSpacing: 1 },
  divider:     { width: '100%', height: 1, backgroundColor: NocturneColors.vipGoldMuted, marginVertical: Spacing.xs },
  instruction: { ...Typography.bodySm, color: Colors.outline, textAlign: 'center' },
  closeBtn:    { marginTop: Spacing.xs, backgroundColor: NocturneColors.vipGoldMuted, borderWidth: 1, borderColor: NocturneColors.vipGoldGlowStrong, borderRadius: Radius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.smMd },
  closeBtnText: { ...Typography.labelLg, color: NocturneColors.vipGoldDark },
  shimmer:     { position: 'absolute', top: 0, bottom: 0, width: 80, backgroundColor: SHIMMER_COLOR, left: 0 },
});

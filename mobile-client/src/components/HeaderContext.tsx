// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — HeaderContext (Nocturne Gastronomy)
// Header con estado de mesa y acceso al scanner QR.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { QrCode, CheckCircle2 } from 'lucide-react-native';
import { Colors }     from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { useSessionStore } from '../stores/useSessionStore';

interface HeaderContextProps {
  onOpenScanner: () => void;
}

export function HeaderContext({ onOpenScanner }: HeaderContextProps) {
  const { tableNumber, tableCode } = useSessionStore();

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brandTitle}>NEBULA</Text>
        <View style={styles.contextBadge}>
          <View style={[
            styles.pulseDot,
            tableNumber ? styles.pulseDotActive : null,
          ]} />
          <Text style={styles.contextText}>
            {tableNumber
              ? `Mesa #${tableNumber} · Código ${tableCode}`
              : 'Retiro en Barra'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.qrButton, tableNumber ? styles.qrButtonActive : null]}
        onPress={onOpenScanner}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={tableNumber ? `Mesa ${tableNumber} conectada. Tocar para cambiar.` : 'Escanear código de mesa'}
      >
        {tableNumber
          ? <CheckCircle2 size={16} color={Colors.success} />
          : <QrCode       size={16} color={Colors.primary}  />}
        <Text style={[styles.qrButtonText, tableNumber ? styles.qrButtonTextActive : null]}>
          {tableNumber ? 'Mesa Conectada' : 'Escanear Mesa'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: Spacing.gutter,
    paddingVertical:   Spacing.smMd,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 226, 236, 0.06)',
  },
  brandTitle: {
    ...Typography.headlineSm,
    color:         Colors.primary,
    letterSpacing: 2,
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
    marginTop:     3,
  },
  pulseDot: {
    width:           8,
    height:          8,
    borderRadius:    Radius.full,
    backgroundColor: Colors.outline,
  },
  pulseDotActive: {
    backgroundColor: Colors.success,
  },
  contextText: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  qrButton: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical:   8,
    borderRadius:    Radius.full,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.08)',
  },
  qrButtonActive: {
    backgroundColor: 'rgba(52, 185, 100, 0.08)',
    borderColor:     'rgba(52, 185, 100, 0.25)',
  },
  qrButtonText: {
    ...Typography.labelMd,
    color: Colors.primary,
  },
  qrButtonTextActive: {
    color: Colors.success,
  },
});

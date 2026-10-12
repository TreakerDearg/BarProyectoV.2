// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — FulfillmentSheet
// Bottom sheet "¿Cómo recibís tu pedido?": mesa conectada, conexión por QR
// o retiro en barra. Fuente de verdad: useSessionStore (serviceMode + mesa).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View, Text, Modal, TouchableOpacity, Pressable, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QrCode, ShoppingBag, Check, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, NocturneColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Elevation }  from '../../theme/elevation';

import { useSessionStore } from '../../stores/useSessionStore';
import { SERVICE_MODE_META } from '../../utils/status';

interface FulfillmentSheetProps {
  visible: boolean;
  onClose: () => void;
  /** El padre decide cómo montar el scanner QR (Modal en pantalla). */
  onOpenScanner: () => void;
}

interface OptionRowProps {
  icon:      React.ReactNode;
  iconBg:    string;
  title:     string;
  subtitle:  string;
  selected?: boolean;
  onPress:   () => void;
}

function OptionRow({ icon, iconBg, title, subtitle, selected, onPress }: OptionRowProps) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.optionIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSub} numberOfLines={2}>{subtitle}</Text>
      </View>
      {selected ? (
        <View style={styles.optionCheck}>
          <Check size={14} color={Colors.onPrimary} />
        </View>
      ) : (
        <ChevronRight size={16} color={Colors.outline} />
      )}
    </TouchableOpacity>
  );
}

export function FulfillmentSheet({ visible, onClose, onOpenScanner }: FulfillmentSheetProps) {
  const insets = useSafeAreaInsets();
  const { serviceMode, tableNumber, tableCode, setServiceMode } = useSessionStore();

  const lightHaptic = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  };

  const hasTable = tableNumber != null;

  const selectTable = () => {
    lightHaptic();
    setServiceMode('table');
    onClose();
  };

  const selectBar = () => {
    lightHaptic();
    setServiceMode('bar');
    onClose();
  };

  const connectTable = () => {
    lightHaptic();
    onClose();
    // El sheet cierra antes de abrir el scanner (evita transiciones encimadas)
    setTimeout(onOpenScanner, 220);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg }]}
          onPress={() => {}}
        >
          <View style={styles.grabber} />

          <Text style={styles.title}>¿Cómo recibís tu pedido?</Text>
          <Text style={styles.subtitle}>
            Elegí dónde te lo llevamos. Podés cambiarlo cuando quieras desde Inicio.
          </Text>

          {/* ── Mesa conectada o conexión por QR ──────────── */}
          {hasTable ? (
            <OptionRow
              icon={<QrCode size={18} color={SERVICE_MODE_META.table.color} />}
              iconBg={SERVICE_MODE_META.table.bg}
              title={`Mesa #${tableNumber}`}
              subtitle={tableCode ? `Código ${tableCode} · Ya conectada` : 'Ya estás conectado a esta mesa'}
              selected={serviceMode === 'table'}
              onPress={selectTable}
            />
          ) : (
            <OptionRow
              icon={<QrCode size={18} color={SERVICE_MODE_META.table.color} />}
              iconBg={SERVICE_MODE_META.table.bg}
              title="Conectar mi mesa"
              subtitle="Escaneá el QR de la mesa o ingresá el código de 3 dígitos"
              onPress={connectTable}
            />
          )}

          {/* ── Retiro en barra ───────────────────────────── */}
          <OptionRow
            icon={<ShoppingBag size={18} color={SERVICE_MODE_META.bar.color} />}
            iconBg={SERVICE_MODE_META.bar.bg}
            title={SERVICE_MODE_META.bar.label}
            subtitle="Hacés el pedido desde la app y lo retirás en la barra"
            selected={serviceMode === 'bar'}
            onPress={selectBar}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surfaceContainer,
    borderTopLeftRadius:  Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.gutter,
    paddingTop:        Spacing.smMd,
    gap:               Spacing.smMd,
    ...(Elevation.card as object),
  },
  grabber: {
    alignSelf:       'center',
    width:           40,
    height:          4,
    borderRadius:    Radius.full,
    backgroundColor: Colors.outlineVariant,
    marginBottom:    Spacing.sm,
  },
  title: { ...Typography.headlineLg, color: Colors.onSurface },
  subtitle: {
    ...Typography.bodyMd,
    color:         Colors.onSurfaceVariant,
    marginBottom:  Spacing.xs,
  },

  // ── Option rows ─────────────────────────────────────────────────
  option: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.smMd,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
    padding:         Spacing.smMd,
  },
  optionSelected: {
    backgroundColor: Colors.goldMuted,
    borderColor:     Colors.primary,
  },
  optionIcon: {
    width:           36,
    height:          36,
    borderRadius:    Radius.md,
    justifyContent:  'center',
    alignItems:      'center',
  },
  optionText: { flex: 1, gap: 2 },
  optionTitle: { ...Typography.titleMd, color: Colors.onSurface },
  optionSub:   { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  optionCheck: {
    width:           22,
    height:          22,
    borderRadius:    Radius.full,
    backgroundColor: Colors.primaryContainer,
    justifyContent:  'center',
    alignItems:      'center',
  },
});

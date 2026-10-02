// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — ReservasScreen
// Formulario único con scroll:
//   1. Date picker nativo
//   2. Stepper de personas
//   3. Chips de slots horarios (fetch a backend)
//   4. Datos del cliente (pre-relleno si hay sesión)
//   5. Confirmar → éxito inline
//   6. Lista de "Mis reservas" (solo si hay token)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  CalendarDays, Users, Clock, CheckCircle2,
  ChevronDown, Minus, Plus, AlertCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { Colors }     from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation }  from '../theme/elevation';

import { useAuthStore } from '../stores/useAuthStore';
import { checkAvailability, createReservation, getMyReservationsFromApi } from '../api/reservationApi';
import { NInput }  from '../components/shared/NInput';
import { NButton } from '../components/shared/NButton';
import { NSkeleton } from '../components/shared/NSkeleton';

import type { TimeSlotDTO, ReservationDTO } from '../types/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });
}

function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatReservationDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) +
         ' · ' +
         d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const STATUS_LABEL: Record<string, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmada',
  seated:    'En mesa',
  completed: 'Completada',
  cancelled: 'Cancelada',
  'no-show': 'No asistió',
};

const STATUS_COLOR: Record<string, string> = {
  pending:   Colors.warning,
  confirmed: Colors.success,
  seated:    Colors.primary,
  completed: Colors.info,
  cancelled: Colors.error,
  'no-show': Colors.outline,
};

const MIN_DATE = new Date();
MIN_DATE.setHours(0, 0, 0, 0);

const MAX_DATE = new Date();
MAX_DATE.setMonth(MAX_DATE.getMonth() + 3);

// ── Componente principal ──────────────────────────────────────────────────────

export default function ReservasScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { user, token } = useAuthStore();

  // ── Form state ────────────────────────────────────────────────
  const [selectedDate,     setSelectedDate]     = useState<Date | null>(null);
  const [showDatePicker,   setShowDatePicker]   = useState(false);
  const [guests,           setGuests]           = useState(2);
  const [slots,            setSlots]            = useState<TimeSlotDTO[]>([]);
  const [selectedSlot,     setSelectedSlot]     = useState<TimeSlotDTO | null>(null);
  const [loadingSlots,     setLoadingSlots]     = useState(false);
  const [customerName,     setCustomerName]     = useState(user?.name ?? '');
  const [customerPhone,    setCustomerPhone]    = useState(user?.phone ?? '');
  const [customerEmail,    setCustomerEmail]    = useState(user?.email ?? '');
  const [notes,            setNotes]            = useState('');
  const [submitting,       setSubmitting]       = useState(false);
  const [successReservation, setSuccessReservation] = useState<ReservationDTO | null>(null);
  const [formError,        setFormError]        = useState<string | null>(null);

  // ── My reservations ───────────────────────────────────────────
  const [myReservations,   setMyReservations]   = useState<ReservationDTO[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // ── Scroll ref para hacer scroll al éxito ─────────────────────
  const scrollRef = useRef<ScrollView>(null);

  // ── Pre-rellenar datos si cambia la sesión ────────────────────
  useEffect(() => {
    if (user) {
      setCustomerName(user.name ?? '');
      setCustomerPhone(user.phone ?? '');
      setCustomerEmail(user.email ?? '');
    }
  }, [user]);

  // ── Cargar mis reservas ───────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setLoadingReservations(true);
    getMyReservationsFromApi({ upcoming: false, limit: 5 })
      .then(setMyReservations)
      .catch(() => {})
      .finally(() => setLoadingReservations(false));
  }, [token, successReservation]);

  // ── Fetch slots al cambiar fecha o personas ───────────────────
  useEffect(() => {
    if (!selectedDate) return;
    setSelectedSlot(null);
    setSlots([]);
    setLoadingSlots(true);

    checkAvailability(formatDate(selectedDate), guests)
      .then((res) => setSlots(res.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, guests]);

  // ── Date picker handler ───────────────────────────────────────
  // SDK 57: `onChange` está deprecado. Usamos `onValueChange` (iOS)
  // y `onConfirm`/`onDismiss` (Android) según la plataforma.
  const handleDateConfirm = useCallback((date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    setSuccessReservation(null);
    setFormError(null);
    try { Haptics.selectionAsync(); } catch {}
  }, []);

  const handleDateDismiss = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  // Wrapper unificado para compatibilidad — solo usado en iOS inline
  const handleDateChange = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      if (date) handleDateConfirm(date);
      else handleDateDismiss();
    },
    [handleDateConfirm, handleDateDismiss]
  );

  // ── Validación y submit ───────────────────────────────────────
  const validate = (): string | null => {
    if (!selectedDate)  return 'Seleccioná una fecha.';
    if (!selectedSlot)  return 'Elegí un horario disponible.';
    if (guests < 1)     return 'Al menos 1 persona.';
    if (customerName.trim().length < 2) return 'Ingresá tu nombre completo.';
    if (customerPhone.trim().length < 7) return 'Ingresá un teléfono válido.';
    return null;
  };

  const handleSubmit = async () => {
    setFormError(null);
    const err = validate();
    if (err) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      setFormError(err);
      return;
    }

    setSubmitting(true);
    try {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
      const reservation = await createReservation({
        date:          formatDate(selectedDate!),
        startTime:     selectedSlot!.startTime,
        endTime:       selectedSlot!.endTime,
        guests,
        customerName:  customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        notes:         notes.trim() || undefined,
      });
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setSuccessReservation(reservation);

      // Limpiar formulario
      setSelectedDate(null);
      setSelectedSlot(null);
      setSlots([]);
      setNotes('');

      // Scroll al tope para ver el banner de éxito
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
    } catch (err: any) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      const msg = err?.response?.data?.message ?? err?.message ?? 'No se pudo crear la reserva.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessReservation(null);
    setFormError(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
    setNotes('');
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: tabBarHeight + Spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ──────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.screenLabel}>RESERVAS</Text>
            <Text style={styles.screenTitle}>Reservá tu mesa</Text>
          </View>

          {/* ── Banner de éxito ─────────────────────────── */}
          {successReservation && (
            <View style={styles.successBanner}>
              <CheckCircle2 size={24} color={Colors.success} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.successTitle}>¡Reserva confirmada!</Text>
                <Text style={styles.successSub}>
                  {successReservation.guests} persona{successReservation.guests !== 1 ? 's' : ''} ·{' '}
                  {formatReservationDate(successReservation.startTime)}
                </Text>
                {successReservation.tableNumber && (
                  <Text style={styles.successSub}>
                    Mesa #{successReservation.tableNumber}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={handleReset} style={styles.successResetBtn}>
                <Text style={styles.successResetText}>Nueva</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ FORMULARIO ══════════════════════════════════ */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Nueva reserva</Text>

            {/* ── 1. Fecha ──────────────────────────────── */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Fecha</Text>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <CalendarDays size={18} color={Colors.primary} />
                <Text style={[
                  styles.datePickerText,
                  !selectedDate && styles.datePickerPlaceholder,
                ]}>
                  {selectedDate
                    ? formatDateDisplay(selectedDate)
                    : 'Elegí una fecha'}
                </Text>
                <ChevronDown size={16} color={Colors.outline} />
              </TouchableOpacity>

              {/* Date picker nativo — Android: modal automático, iOS: inline */}
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={MIN_DATE}
                  maximumDate={MAX_DATE}
                  locale="es-AR"
                  themeVariant="dark"
                  accentColor={Colors.primary}
                  onChange={handleDateChange}
                />
              )}

              {/* iOS: botón para cerrar el picker */}
              {showDatePicker && Platform.OS === 'ios' && (
                <NButton
                  label="Confirmar fecha"
                  onPress={() => setShowDatePicker(false)}
                  variant="ghost"
                  size="sm"
                  fullWidth
                />
              )}
            </View>

            {/* ── 2. Personas ───────────────────────────── */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Personas</Text>
              <View style={styles.stepperRow}>
                <View style={styles.stepperIcon}>
                  <Users size={18} color={Colors.primary} />
                </View>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => {
                      if (guests > 1) {
                        try { Haptics.selectionAsync(); } catch {}
                        setGuests((g) => g - 1);
                      }
                    }}
                    disabled={guests <= 1}
                  >
                    <Minus size={16} color={guests > 1 ? Colors.onSurface : Colors.outline} />
                  </TouchableOpacity>
                  <Text style={styles.stepCount}>{guests}</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => {
                      if (guests < 20) {
                        try { Haptics.selectionAsync(); } catch {}
                        setGuests((g) => g + 1);
                      }
                    }}
                    disabled={guests >= 20}
                  >
                    <Plus size={16} color={guests < 20 ? Colors.onSurface : Colors.outline} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.guestsLabel}>
                  persona{guests !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* ── 3. Horario ────────────────────────────── */}
            {selectedDate && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  <Clock size={13} color={Colors.onSurfaceVariant} /> Horario disponible
                </Text>

                {loadingSlots ? (
                  <View style={styles.slotsLoading}>
                    <NSkeleton height={36} radius={Radius.full} width="30%" />
                    <NSkeleton height={36} radius={Radius.full} width="30%" />
                    <NSkeleton height={36} radius={Radius.full} width="30%" />
                  </View>
                ) : slots.length === 0 ? (
                  <View style={styles.noSlotsBox}>
                    <AlertCircle size={16} color={Colors.warning} />
                    <Text style={styles.noSlotsText}>
                      No hay horarios disponibles para esta fecha y cantidad de personas.
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.slotsScroll}
                  >
                    {slots.map((slot, idx) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      const isAvailable = slot.available;
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.slotChip,
                            isSelected  && styles.slotChipSelected,
                            !isAvailable && styles.slotChipDisabled,
                          ]}
                          onPress={() => {
                            if (!isAvailable) return;
                            try { Haptics.selectionAsync(); } catch {}
                            setSelectedSlot(slot);
                          }}
                          disabled={!isAvailable}
                          activeOpacity={0.8}
                        >
                          <Text style={[
                            styles.slotText,
                            isSelected   && styles.slotTextSelected,
                            !isAvailable && styles.slotTextDisabled,
                          ]}>
                            {formatSlotTime(slot.startTime)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}

            {/* ── 4. Datos del cliente ──────────────────── */}
            {selectedSlot && (
              <>
                <View style={styles.sectionDivider}>
                  <Text style={styles.sectionDividerText}>Tus datos</Text>
                </View>

                <NInput
                  label="Nombre completo"
                  placeholder="Tu nombre y apellido"
                  value={customerName}
                  onChangeText={setCustomerName}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                  maxLength={60}
                />

                <NInput
                  label="Teléfono"
                  placeholder="+54 9 11 0000-0000"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  returnKeyType="next"
                  maxLength={30}
                />

                <NInput
                  label="Email (opcional)"
                  placeholder="tu@email.com"
                  value={customerEmail}
                  onChangeText={setCustomerEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  maxLength={80}
                />

                <NInput
                  label="Notas especiales (opcional)"
                  placeholder="Cumpleaños, alergias, preferencias de zona..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                />
              </>
            )}

            {/* ── Error ─────────────────────────────────── */}
            {formError && (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color={Colors.error} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            {/* ── Resumen y CTA ─────────────────────────── */}
            {selectedSlot && (
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fecha</Text>
                  <Text style={styles.summaryValue}>
                    {selectedDate ? formatDateDisplay(selectedDate) : '—'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Horario</Text>
                  <Text style={styles.summaryValue}>
                    {formatSlotTime(selectedSlot.startTime)} – {formatSlotTime(selectedSlot.endTime)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Personas</Text>
                  <Text style={styles.summaryValue}>{guests}</Text>
                </View>
              </View>
            )}

            <NButton
              label={
                !selectedDate   ? 'Elegí una fecha para continuar' :
                !selectedSlot   ? 'Elegí un horario para continuar' :
                submitting      ? 'Confirmando...' :
                'Confirmar reserva'
              }
              onPress={handleSubmit}
              loading={submitting}
              disabled={!selectedDate || !selectedSlot}
              fullWidth
              size="lg"
            />
          </View>

          {/* ══ MIS RESERVAS (solo si hay sesión) ═════════ */}
          {token && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mis reservas</Text>

              {loadingReservations ? (
                <View style={{ gap: Spacing.sm }}>
                  {[0, 1].map((i) => (
                    <NSkeleton key={i} height={72} radius={Radius.lg} />
                  ))}
                </View>
              ) : myReservations.length === 0 ? (
                <View style={styles.emptyReservations}>
                  <CalendarDays size={24} color={Colors.outline} />
                  <Text style={styles.emptyText}>No tenés reservas registradas.</Text>
                </View>
              ) : (
                <View style={styles.reservationsList}>
                  {myReservations.map((res) => {
                    const accentColor = STATUS_COLOR[res.status] ?? Colors.outline;
                    return (
                      <View
                        key={res._id}
                        style={[styles.reservationCard, { borderLeftColor: accentColor }]}
                      >
                        <View style={styles.reservationTop}>
                          <Text style={styles.reservationDate}>
                            {formatReservationDate(res.startTime)}
                          </Text>
                          <View style={[
                            styles.reservationBadge,
                            { borderColor: `${accentColor}40`, backgroundColor: `${accentColor}15` },
                          ]}>
                            <Text style={[styles.reservationBadgeText, { color: accentColor }]}>
                              {STATUS_LABEL[res.status] ?? res.status}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.reservationMeta}>
                          <View style={styles.reservationMetaItem}>
                            <Users size={12} color={Colors.onSurfaceVariant} />
                            <Text style={styles.reservationMetaText}>
                              {res.guests} persona{res.guests !== 1 ? 's' : ''}
                            </Text>
                          </View>
                          {res.tableNumber && (
                            <View style={styles.reservationMetaItem}>
                              <Text style={styles.reservationMetaText}>
                                Mesa #{res.tableNumber}
                              </Text>
                            </View>
                          )}
                        </View>
                        {res.notes && (
                          <Text style={styles.reservationNotes} numberOfLines={1}>
                            {res.notes}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: Colors.background },
  flex:  { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.gutter,
    paddingTop:        Spacing.md,
    gap:               Spacing.lg,
  },

  // ── Header ─────────────────────────────────────────────────────
  header: { gap: 4 },
  screenLabel: { ...Typography.labelSm, color: Colors.primary },
  screenTitle: { ...Typography.displaySm, color: Colors.onSurface },

  // ── Success banner ─────────────────────────────────────────────
  successBanner: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             Spacing.smMd,
    backgroundColor: 'rgba(52, 185, 100, 0.10)',
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    borderWidth:     1,
    borderColor:     'rgba(52, 185, 100, 0.30)',
  },
  successTitle: { ...Typography.headlineSm, color: Colors.success },
  successSub:   { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  successResetBtn: {
    backgroundColor: 'rgba(52, 185, 100, 0.15)',
    borderRadius:    Radius.sm,
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderWidth:     1,
    borderColor:     'rgba(52, 185, 100, 0.30)',
  },
  successResetText: { ...Typography.labelMd, color: Colors.success },

  // ── Form card ──────────────────────────────────────────────────
  formCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.xl,
    padding:         Spacing.lg,
    gap:             Spacing.md,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.08)',
    ...(Elevation.card as object),
  },
  formTitle: { ...Typography.headlineSm, color: Colors.onSurface },

  // ── Fields ─────────────────────────────────────────────────────
  field:      { gap: Spacing.sm },
  fieldLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant },

  // Date picker button
  datePickerBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.smMd,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.10)',
    gap:             Spacing.sm,
  },
  datePickerText: {
    flex:       1,
    ...Typography.bodyMd,
    color:      Colors.onSurface,
  },
  datePickerPlaceholder: { color: Colors.outline },

  // Personas stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.smMd,
  },
  stepperIcon: {
    width:           40,
    height:          40,
    borderRadius:    Radius.md,
    backgroundColor: Colors.goldMuted,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  stepper: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.md,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.10)',
    paddingHorizontal: 4,
  },
  stepBtn:   { padding: 10 },
  stepCount: { ...Typography.headlineSm, color: Colors.onSurface, paddingHorizontal: 12, minWidth: 40, textAlign: 'center' },
  guestsLabel: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },

  // Slots
  slotsLoading: {
    flexDirection: 'row',
    gap:           Spacing.sm,
  },
  noSlotsBox: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: 'rgba(224, 120, 40, 0.08)',
    borderRadius:    Radius.md,
    padding:         Spacing.smMd,
    borderWidth:     1,
    borderColor:     'rgba(224, 120, 40, 0.25)',
  },
  noSlotsText: { ...Typography.bodySm, color: Colors.warning, flex: 1 },
  slotsScroll: { gap: Spacing.sm, paddingVertical: 2 },
  slotChip: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical:   9,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.10)',
  },
  slotChipSelected: {
    backgroundColor: Colors.goldMuted,
    borderColor:     Colors.primary,
  },
  slotChipDisabled: { opacity: 0.4 },
  slotText:         { ...Typography.labelMd, color: Colors.onSurface },
  slotTextSelected: { color: Colors.primary, fontWeight: '700' as const },
  slotTextDisabled: { color: Colors.outline },

  // Sección divider
  sectionDivider: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  sectionDividerText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },

  // Error banner
  errorBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: 'rgba(255, 180, 171, 0.08)',
    borderRadius:    Radius.md,
    padding:         Spacing.smMd,
    borderWidth:     1,
    borderColor:     'rgba(255, 180, 171, 0.25)',
  },
  errorText: { ...Typography.bodySm, color: Colors.error, flex: 1 },

  // Summary
  summaryBox: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.md,
    padding:         Spacing.md,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  summaryRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  summaryLabel: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  summaryValue: { ...Typography.labelLg, color: Colors.onSurface },

  // ── Mis reservas ────────────────────────────────────────────────
  section: { gap: Spacing.sm },
  sectionTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  emptyReservations: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
    paddingVertical: Spacing.md,
  },
  emptyText: { ...Typography.bodyMd, color: Colors.outline },
  reservationsList: { gap: Spacing.sm },
  reservationCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.06)',
    borderLeftWidth: 3,
    gap:             6,
  },
  reservationTop: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            Spacing.sm,
  },
  reservationDate: { ...Typography.labelLg, color: Colors.onSurface, flex: 1 },
  reservationBadge: {
    borderRadius:    Radius.full,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:     1,
  },
  reservationBadgeText: { ...Typography.labelSm, textTransform: 'none' as const },
  reservationMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
  },
  reservationMetaItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  reservationMetaText: { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  reservationNotes: {
    ...Typography.bodySm,
    color:      Colors.outline,
    fontStyle:  'italic',
  },
});

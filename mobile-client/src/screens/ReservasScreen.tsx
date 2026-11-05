// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — ReservasScreen (redesign v2)
// Flujo guiado de 3 pasos: Fecha+Personas → Horario → Datos → Confirmar
// DateTimePicker SDK 58 API (onValueChange/onDismiss).
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { type DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import {
  CalendarDays, Users, Clock, CheckCircle2,
  ChevronDown, ChevronRight, Minus, Plus,
  AlertCircle, User, Phone, Mail, StickyNote,
  Home, Trees, Wine,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation }  from '../theme/elevation';
import { Gradients }  from '../theme/gradients';
import { usePressScale } from '../hooks/usePressScale';

import { useAuthStore } from '../stores/useAuthStore';
import { checkAvailability, createReservation, getMyReservationsFromApi } from '../api/reservationApi';
import { NInput }  from '../components/shared/NInput';
import { NButton } from '../components/shared/NButton';
import { NSkeleton } from '../components/shared/NSkeleton';

import type { RootTabParamList } from '../navigation/types';
import type { TimeSlotDTO, ReservationDTO } from '../types/api';

type ReservasNav = BottomTabNavigationProp<RootTabParamList, 'Reservas'>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
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

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ['Fecha', 'Horario', 'Datos'] as const;

// ── Zonas del restaurante ──────────────────────────────────────────────────────
const ZONES = [
  { id: 'indoor'  as const, label: 'Interior',  Icon: Home   },
  { id: 'outdoor' as const, label: 'Exterior',  Icon: Trees  },
  { id: 'bar'     as const, label: 'Barra',     Icon: Wine   },
];

const ZONE_LABELS: Record<string, string> = {
  indoor:  'Interior',
  outdoor: 'Exterior',
  bar:     'Barra',
};

// ── Restricciones dietarias ───────────────────────────────────────────────────
const DIETARY_OPTIONS = [
  'Vegetariano', 'Vegano', 'Sin gluten', 'Sin TACC',
  'Sin frutos secos', 'Sin lácteos',
];

// ── Componente principal ──────────────────────────────────────────────────────
export default function ReservasScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation   = useNavigation<ReservasNav>();
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
  const [preferredZone,     setPreferredZone]     = useState<'indoor' | 'outdoor' | 'bar' | null>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [submitting,       setSubmitting]       = useState(false);
  const [successReservation, setSuccessReservation] = useState<ReservationDTO | null>(null);
  const [formError,        setFormError]        = useState<string | null>(null);

  // ── My reservations ───────────────────────────────────────────
  const [myReservations,      setMyReservations]      = useState<ReservationDTO[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // @ts-ignore — RN 0.88 changed ScrollView ref type; scrollTo works at runtime
  const scrollRef = useRef<any>(null);

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
      .then((r) => setMyReservations(Array.isArray(r) ? r : []))
      .catch(() => setMyReservations([]))
      .finally(() => setLoadingReservations(false));
  }, [token, successReservation]);

  // ── Fetch slots al cambiar fecha o personas ───────────────────
  useEffect(() => {
    if (!selectedDate) return;
    setSelectedSlot(null);
    setSlots([]);
    setLoadingSlots(true);

    checkAvailability(formatDate(selectedDate), guests)
      .then((res) => setSlots(Array.isArray(res?.slots) ? res.slots : []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, guests]);

  // ── Step actual ────────────────────────────────────────────────
  const currentStep: number = !selectedDate ? 0 : !selectedSlot ? 1 : 2;

  // ── DateTimePicker handlers (SDK 58 API) ──────────────────────
  const handleDateValueChange = useCallback(
    (_event: DateTimePickerChangeEvent, date: Date) => {
      setSelectedDate(date);
      setSuccessReservation(null);
      setFormError(null);
      try { Haptics.selectionAsync(); } catch {}
    },
    []
  );

  const handleDateDismiss = useCallback(() => {
    setShowDatePicker(false);
  }, []);

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
        guestDietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
      });
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setSuccessReservation(reservation);

      // Limpiar
      setSelectedDate(null);
      setSelectedSlot(null);
      setSlots([]);
      setNotes('');
      setPreferredZone(null);
      setDietaryRestrictions([]);

      setTimeout(() => {
        // @ts-ignore — RN 0.88 ref type quirk
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
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
    setPreferredZone(null);
    setDietaryRestrictions([]);
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
          {/* ── Hero ──────────────────────────────────────── */}
          <View style={styles.hero}>
            <LinearGradient
              {...Gradients.cardSheen}
              style={styles.heroFill}
              pointerEvents="none"
            />
            <View style={styles.heroWatermark} pointerEvents="none">
              <CalendarDays size={120} color={NocturneColors.emberGlow} strokeWidth={1} />
            </View>
            <LinearGradient
              {...Gradients.heroOverlay}
              style={styles.heroBottomFade}
              pointerEvents="none"
            />
            <View style={styles.heroContent}>
              <Text style={styles.screenLabel}>RESERVAS</Text>
              <Text style={styles.screenTitle}>Reservá tu mesa</Text>
              <Text style={styles.heroSub}>
                Elegí fecha, horario y cantidad de personas
              </Text>
            </View>
          </View>

          {/* ── Step indicator ────────────────────────────── */}
          <View style={styles.stepsRow}>
            {STEPS.map((step, i) => (
              <View key={step} style={styles.stepItem}>
                <View style={[
                  styles.stepDot,
                  i <= currentStep && styles.stepDotActive,
                ]}>
                  <Text style={[
                    styles.stepDotText,
                    i <= currentStep && styles.stepDotTextActive,
                  ]}>{i + 1}</Text>
                </View>
                <Text style={[
                  styles.stepLabel,
                  i <= currentStep && styles.stepLabelActive,
                ]}>{step}</Text>
                {i < STEPS.length - 1 && (
                  <View style={[
                    styles.stepConnector,
                    i < currentStep && styles.stepConnectorActive,
                  ]} />
                )}
              </View>
            ))}
          </View>

          {/* ── Banner de éxito ──────────────────────────── */}
          {successReservation && (
            <View style={styles.successBanner}>
              <CheckCircle2 size={28} color={Colors.success} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.successTitle}>¡Reserva confirmada!</Text>
                <Text style={styles.successSub}>
                  {successReservation.guests} persona{successReservation.guests !== 1 ? 's' : ''} ·{' '}
                  {formatReservationDate(successReservation.startTime)}
                </Text>
                {successReservation.tableNumber && (
                  <Text style={styles.successSub}>
                    Mesa #{successReservation.tableNumber}
                    {successReservation.table?.location
                      ? ` · ${ZONE_LABELS[successReservation.table.location] ?? successReservation.table.location}`
                      : ''}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={handleReset} style={styles.successResetBtn} accessibilityRole="button" accessibilityLabel="Crear una nueva reserva">
                <Text style={styles.successResetText}>Nueva</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ FORMULARIO ══════════════════════════════════ */}
          <View style={styles.formCard}>
            {/* ── Step 1: Fecha + Personas ─────────────────── */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Fecha</Text>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={selectedDate ? `Cambiar fecha, ${formatDateDisplay(selectedDate)}` : 'Elegir fecha de reserva'}
              >
                <CalendarDays size={18} color={Colors.primary} />
                <Text style={[
                  styles.datePickerText,
                  !selectedDate && styles.datePickerPlaceholder,
                ]}>
                  {selectedDate ? formatDateDisplay(selectedDate) : 'Elegí una fecha'}
                </Text>
                <ChevronDown size={16} color={Colors.outline} />
              </TouchableOpacity>

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
                  // SDK 58: onChange deprecado — usar onValueChange + onDismiss
                  onValueChange={handleDateValueChange}
                  onDismiss={handleDateDismiss}
                />
              )}

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
                    accessibilityRole="button"
                    accessibilityLabel="Reducir cantidad de personas"
                    accessibilityState={{ disabled: guests <= 1 }}
                  >
                    <Minus size={18} color={guests > 1 ? Colors.onSurface : Colors.outline} />
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
                    accessibilityRole="button"
                    accessibilityLabel="Aumentar cantidad de personas"
                    accessibilityState={{ disabled: guests >= 20 }}
                  >
                    <Plus size={18} color={guests < 20 ? Colors.onSurface : Colors.outline} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.guestsLabel}>persona{guests !== 1 ? 's' : ''}</Text>
              </View>
            </View>

            {/* ── Zona preferida ────────────────────────────── */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Zona preferida <Text style={styles.fieldOptional}>(opcional)</Text>
              </Text>
              <View style={styles.zoneRow}>
                {ZONES.map((zone) => {
                  const isSelected = preferredZone === zone.id;
                  const ZoneIcon = zone.Icon;
                  return (
                    <TouchableOpacity
                      key={zone.id}
                      style={[
                        styles.zoneChip,
                        isSelected && styles.zoneChipSelected,
                      ]}
                      onPress={() => {
                        try { Haptics.selectionAsync(); } catch {}
                        setPreferredZone(isSelected ? null : zone.id);
                      }}
                      activeOpacity={0.8}
                      accessibilityRole="radio"
                      accessibilityLabel={`Zona ${zone.label}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <ZoneIcon size={16} color={isSelected ? Colors.primary : Colors.onSurfaceVariant} />
                      <Text style={[
                        styles.zoneChipText,
                        isSelected && styles.zoneChipTextSelected,
                      ]}>
                        {zone.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Step 2: Horario ───────────────────────────── */}
            {selectedDate && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  Horario disponible
                </Text>

                {loadingSlots ? (
                  <View style={styles.slotsLoading}>
                    <NSkeleton height={40} radius={Radius.full} width="30%" />
                    <NSkeleton height={40} radius={Radius.full} width="30%" />
                    <NSkeleton height={40} radius={Radius.full} width="30%" />
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
                          accessibilityRole="radio"
                          accessibilityLabel={`${formatSlotTime(slot.startTime)}${isAvailable ? '' : ', no disponible'}`}
                          accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
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

            {/* ── Step 3: Datos del cliente ────────────────── */}
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

                {/* ── Restricciones dietarias ──────────────── */}
                <View style={styles.dietarySection}>
                  <Text style={styles.fieldLabel}>
                    Restricciones dietarias <Text style={styles.fieldOptional}>(opcional)</Text>
                  </Text>
                  <View style={styles.dietaryChips}>
                    {DIETARY_OPTIONS.map((diet) => {
                      const isSelected = dietaryRestrictions.includes(diet);
                      return (
                        <TouchableOpacity
                          key={diet}
                          style={[
                            styles.dietaryChip,
                            isSelected && styles.dietaryChipSelected,
                          ]}
                          onPress={() => {
                            try { Haptics.selectionAsync(); } catch {}
                            setDietaryRestrictions((prev) =>
                              isSelected
                                ? prev.filter((d) => d !== diet)
                                : [...prev, diet]
                            );
                          }}
                          activeOpacity={0.8}
                          accessibilityRole="checkbox"
                          accessibilityLabel={diet}
                          accessibilityState={{ checked: isSelected }}
                        >
                          <Text style={[
                            styles.dietaryChipText,
                            isSelected && styles.dietaryChipTextSelected,
                          ]}>
                            {diet}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            {/* ── Error ─────────────────────────────────────── */}
            {formError && (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <AlertCircle size={16} color={Colors.error} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            {/* ── Resumen ───────────────────────────────────── */}
            {selectedSlot && (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Resumen</Text>
                <View style={styles.summaryRow}>
                  <CalendarDays size={14} color={Colors.onSurfaceVariant} />
                  <Text style={styles.summaryLabel}>Fecha</Text>
                  <Text style={styles.summaryValue}>
                    {selectedDate ? formatDateDisplay(selectedDate) : '—'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Clock size={14} color={Colors.onSurfaceVariant} />
                  <Text style={styles.summaryLabel}>Horario</Text>
                  <Text style={styles.summaryValue}>
                    {formatSlotTime(selectedSlot.startTime)} – {formatSlotTime(selectedSlot.endTime)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Users size={14} color={Colors.onSurfaceVariant} />
                  <Text style={styles.summaryLabel}>Personas</Text>
                  <Text style={styles.summaryValue}>{guests}</Text>
                </View>
                {preferredZone && (
                  <View style={styles.summaryRow}>
                    {(() => {
                      const ZIcon = ZONES.find((z) => z.id === preferredZone)?.Icon ?? Home;
                      return <ZIcon size={14} color={Colors.onSurfaceVariant} />;
                    })()}
                    <Text style={styles.summaryLabel}>Zona</Text>
                    <Text style={styles.summaryValue}>{ZONE_LABELS[preferredZone]}</Text>
                  </View>
                )}
                {dietaryRestrictions.length > 0 && (
                  <View style={styles.summaryRowDietary}>
                    <Text style={styles.summaryLabel}>Restricciones</Text>
                    <Text style={styles.summaryValue} numberOfLines={2}>
                      {dietaryRestrictions.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* ── CTA ──────────────────────────────────────── */}
            <NButton
              label={
                !selectedDate  ? 'Elegí una fecha para continuar' :
                !selectedSlot  ? 'Elegí un horario para continuar' :
                submitting     ? 'Confirmando...' :
                'Confirmar reserva'
              }
              onPress={handleSubmit}
              loading={submitting}
              disabled={!selectedDate || !selectedSlot}
              fullWidth
              size="lg"
            />
          </View>

          {/* ══ MIS RESERVAS ═════════════════════════════════ */}
          {token && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mis reservas</Text>
                {myReservations.length > 0 && (
                  <Text style={styles.sectionCount}>{myReservations.length}</Text>
                )}
              </View>

              {loadingReservations ? (
                <View style={{ gap: Spacing.sm }}>
                  {[0, 1].map((i) => (
                    <NSkeleton key={i} height={80} radius={Radius.lg} />
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
                                {res.table?.location
                                  ? ` · ${ZONE_LABELS[res.table.location] ?? res.table.location}`
                                  : ''}
                              </Text>
                            </View>
                          )}
                        </View>
                        {res.guestDietaryRestrictions && res.guestDietaryRestrictions.length > 0 && (
                          <Text style={styles.reservationNotes} numberOfLines={1}>
                            {res.guestDietaryRestrictions.join(', ')}
                          </Text>
                        )}
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

  // ── Hero ───────────────────────────────────────────────────────
  hero: {
    height:           148,
    marginHorizontal: -Spacing.gutter,
    marginTop:        -Spacing.md,
    overflow:         'hidden',
    justifyContent:   'flex-end',
    backgroundColor:  NocturneColors.surfaceContainerLowest,
  },
  heroFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroWatermark: { position: 'absolute', top: -16, right: -20 },
  heroBottomFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' },
  heroContent: { paddingHorizontal: Spacing.gutter, paddingBottom: Spacing.md, gap: 2 },
  screenLabel: { ...Typography.labelSm, color: Colors.primary },
  screenTitle: { ...Typography.displayLg, color: Colors.onSurface },
  heroSub: { ...Typography.bodySm, color: Colors.onSurfaceVariant },

  // ── Step indicator ─────────────────────────────────────────────
  stepsRow: {
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  stepItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.xs,
  },
  stepDot: {
    width:           28,
    height:          28,
    borderRadius:    Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth:     2,
    borderColor:     NocturneColors.borderSubtle,
    justifyContent:  'center',
    alignItems:      'center',
  },
  stepDotActive: {
    backgroundColor: NocturneColors.emberMuted,
    borderColor:     Colors.primary,
  },
  stepDotText: {
    ...Typography.labelMd,
    color: Colors.outline,
  },
  stepDotTextActive: { color: Colors.primary },
  stepLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
    textTransform: 'none' as const,
    flexShrink: 1,
  },
  stepLabelActive: { color: Colors.onSurface },
  stepConnector: {
    flex:          1,
    height:        2,
    backgroundColor: NocturneColors.borderSubtle,
    marginHorizontal: Spacing.xs,
  },
  stepConnectorActive: { backgroundColor: Colors.primary },

  // ── Success banner ────────────────────────────────────────────
  successBanner: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             Spacing.smMd,
    backgroundColor: NocturneColors.successMuted,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    borderWidth:     1,
    borderColor:     NocturneColors.successBorder,
  },
  successTitle: { ...Typography.headlineSm, color: Colors.success },
  successSub:   { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  successResetBtn: {
    backgroundColor: NocturneColors.successMuted,
    borderRadius:    Radius.sm,
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderWidth:     1,
    borderColor:     NocturneColors.successBorder,
  },
  successResetText: { ...Typography.labelMd, color: Colors.success },

  // ── Form card ──────────────────────────────────────────────────
  formCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.xl,
    padding:         Spacing.lg,
    gap:             Spacing.md,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
    ...(Elevation.card as object),
  },

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
    borderColor:     NocturneColors.borderSubtle,
    gap:             Spacing.sm,
  },
  datePickerText: {
    flex:       1,
    ...Typography.bodyMd,
    color:      Colors.onSurface,
  },
  datePickerPlaceholder: { color: Colors.outline },

  // Stepper
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.smMd },
  stepperIcon: {
    width:           44,
    height:          44,
    borderRadius:    Radius.md,
    backgroundColor: NocturneColors.emberMuted,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     NocturneColors.emberBorder,
  },
  stepper: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.md,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
    paddingHorizontal: 4,
  },
  stepBtn:   { padding: 13 },
  stepCount: { ...Typography.headlineSm, color: Colors.onSurface, paddingHorizontal: 12, minWidth: 40, textAlign: 'center' },
  guestsLabel: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },

  // ── Zone selector ──────────────────────────────────────────────
  zoneRow: { flexDirection: 'row', gap: Spacing.sm },
  zoneChip: {
    flex:             1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             6,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.md,
    paddingVertical:   12,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  zoneChipSelected: {
    backgroundColor: NocturneColors.emberMuted,
    borderColor:     Colors.primary,
  },
  zoneChipText: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  zoneChipTextSelected: { color: Colors.primary },

  // ── Dietary restrictions ───────────────────────────────────────
  dietarySection: { gap: Spacing.sm },
  dietaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  dietaryChip: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.full,
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  dietaryChipSelected: {
    backgroundColor: NocturneColors.emberMuted,
    borderColor:     Colors.primary,
  },
  dietaryChipText: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  dietaryChipTextSelected: { color: Colors.primary },

  // ── Field optional label ──────────────────────────────────────
  fieldOptional: { ...Typography.bodySm, color: Colors.outline, textTransform: 'none' as const },

  // ── Summary dietary row ────────────────────────────────────────
  summaryRowDietary: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    gap:            Spacing.sm,
  },

  // Slots
  slotsLoading: { flexDirection: 'row', gap: Spacing.sm },
  noSlotsBox: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: NocturneColors.warningMuted,
    borderRadius:    Radius.md,
    padding:         Spacing.smMd,
    borderWidth:     1,
    borderColor:     NocturneColors.warningBorder,
  },
  noSlotsText: { ...Typography.bodySm, color: Colors.warning, flex: 1 },
  slotsScroll: { gap: Spacing.sm, paddingVertical: 2 },
  slotChip: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical:   12,
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
  },
  slotChipSelected: {
    backgroundColor: NocturneColors.emberMuted,
    borderColor:     Colors.primary,
  },
  slotChipDisabled: { opacity: 0.4 },
  slotText:         { ...Typography.labelLg, color: Colors.onSurface },
  slotTextSelected: { color: Colors.primary, fontWeight: '700' as const },
  slotTextDisabled: { color: Colors.outline },

  // Divider
  sectionDivider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionDividerText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },

  // Error
  errorBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: NocturneColors.errorMuted,
    borderRadius:    Radius.md,
    padding:         Spacing.smMd,
    borderWidth:     1,
    borderColor:     NocturneColors.errorBorder,
  },
  errorText: { ...Typography.bodySm, color: Colors.error, flex: 1 },

  // Summary
  summaryBox: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.md,
    padding:         Spacing.md,
    gap:             Spacing.sm,
    borderWidth:     1,
    borderColor:     NocturneColors.emberBorder,
  },
  summaryTitle: { ...Typography.labelSm, color: Colors.primary, marginBottom: 2 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryLabel: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, flex: 1 },
  summaryValue: { ...Typography.labelLg, color: Colors.onSurface },

  // ── Mis reservas ───────────────────────────────────────────────
  section: { gap: Spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  sectionCount: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
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
    borderColor:     NocturneColors.borderSubtle,
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
  reservationMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  reservationMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reservationMetaText: { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  reservationNotes: { ...Typography.bodySm, color: Colors.outline, fontStyle: 'italic' },
});

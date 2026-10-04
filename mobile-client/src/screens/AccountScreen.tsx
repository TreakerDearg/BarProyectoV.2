// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — AccountScreen (completo — Task 8)
// Historial real, favoritos sincronizados, edición de perfil,
// cambio de contraseña, reserva próxima, pedido activo en tiempo real.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState, useEffect, useCallback, useRef, memo,
} from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LogOut, ChefHat, ShoppingBag, CalendarDays, Sparkles,
  Heart, ClipboardList, Pencil, Save, X as XIcon,
  Lock, Eye, EyeOff, AlertTriangle, CheckCircle2,
  ChevronRight, Phone, Loader2, RefreshCw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation }        from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Colors }     from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation }  from '../theme/elevation';

import { useAuthStore }      from '../stores/useAuthStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { usePointsStore }    from '../stores/usePointsStore';
import {
  getMyOrderHistory,
  getMyReservations,
  updateMyProfile,
  changeMyPassword,
  type OrderHistoryItem,
  type ReservationSummary,
} from '../api/authApi';
import { socketService }     from '../socket/socketService';

import { NInput }   from '../components/shared/NInput';
import { NButton }  from '../components/shared/NButton';
import { NSkeleton } from '../components/shared/NSkeleton';
import { LoyaltyCard }     from '../components/shared/LoyaltyCard';
import RewardsCatalog      from '../components/shared/RewardsCatalog';

import type { RootTabParamList } from '../navigation/types';

type AccountNav = BottomTabNavigationProp<RootTabParamList, 'Cuenta'>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return `$${n.toLocaleString('es-AR')}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: '2-digit' });
}
function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending:       'Pendiente',
  'in-progress': 'Preparando',
  completed:     'Completado',
  cancelled:     'Cancelado',
};
const ORDER_STATUS_COLOR: Record<string, string> = {
  pending:       Colors.warning,
  'in-progress': Colors.primary,
  completed:     Colors.success,
  cancelled:     Colors.error,
};
const RESERVATION_STATUS_LABEL: Record<string, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmada',
  seated:    'En mesa',
  completed: 'Completada',
  cancelled: 'Cancelada',
  'no-show': 'No asistió',
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

// ─── ProfilePanel ────────────────────────────────────────────────────────────
const ProfilePanel = memo(function ProfilePanel() {
  const { user, token, setAuth } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name,    setName]    = useState(user?.name ?? '');
  const [phone,   setPhone]   = useState(user?.phone ?? '');

  const handleSave = async () => {
    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    setSaving(true); setError(null);
    try {
      const updated = await updateMyProfile({ name: name.trim(), phone: phone.trim() || undefined });
      await setAuth(token!, updated);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setEditing(false); }, 1500);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setName(user?.name ?? '');
    setPhone(user?.phone ?? '');
    setError(null);
  };

  return (
    <View style={pStyles.card}>
      <View style={pStyles.header}>
        <Text style={pStyles.sectionLabel}>Perfil</Text>
        {!editing && (
          <TouchableOpacity onPress={() => setEditing(true)} style={pStyles.editBtn} activeOpacity={0.75}>
            <Pencil size={13} color={Colors.primary} />
            <Text style={pStyles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      {!editing ? (
        <>
          <View style={pStyles.row}>
            <Text style={pStyles.key}>Nombre</Text>
            <Text style={pStyles.val}>{user?.name}</Text>
          </View>
          <View style={pStyles.divider} />
          <View style={pStyles.row}>
            <Text style={pStyles.key}>Email</Text>
            <Text style={pStyles.val}>{user?.email}</Text>
          </View>
          {user?.phone && (
            <>
              <View style={pStyles.divider} />
              <View style={pStyles.row}>
                <Text style={pStyles.key}>Teléfono</Text>
                <Text style={pStyles.val}>{user.phone}</Text>
              </View>
            </>
          )}
        </>
      ) : (
        <View style={pStyles.form}>
          <NInput
            label="Nombre"
            placeholder="Tu nombre completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={50}
          />
          <NInput
            label="Teléfono (opcional)"
            placeholder="+54 9 11 0000-0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={30}
          />
          {error && (
            <View style={pStyles.errorRow}>
              <AlertTriangle size={13} color={Colors.error} />
              <Text style={pStyles.errorText}>{error}</Text>
            </View>
          )}
          {success && (
            <View style={pStyles.successRow}>
              <CheckCircle2 size={13} color={Colors.success} />
              <Text style={pStyles.successText}>Guardado</Text>
            </View>
          )}
          <View style={pStyles.actions}>
            <NButton label="Cancelar" onPress={handleCancel} variant="ghost" size="sm" style={{ flex: 1 }} />
            <NButton label="Guardar"  onPress={handleSave}   loading={saving} size="sm" style={{ flex: 1 }} />
          </View>
        </View>
      )}
    </View>
  );
});

// ─── PasswordPanel ────────────────────────────────────────────────────────────
const PasswordPanel = memo(function PasswordPanel() {
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [curr,    setCurr]    = useState('');
  const [next,    setNext]    = useState('');

  const handleSave = async () => {
    if (next.length < 6) { setError('La nueva contraseña debe tener al menos 6 caracteres.'); return; }
    if (!curr)           { setError('Ingresá tu contraseña actual.'); return; }
    setSaving(true); setError(null);
    try {
      await changeMyPassword({ currentPassword: curr, newPassword: next });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setOpen(false); setCurr(''); setNext(''); }, 2000);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error al cambiar contraseña.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={pStyles.card}>
      <View style={pStyles.header}>
        <View style={pStyles.lockRow}>
          <Lock size={13} color={Colors.onSurfaceVariant} />
          <Text style={pStyles.sectionLabel}>Seguridad</Text>
        </View>
      </View>

      {!open ? (
        <TouchableOpacity style={pStyles.changePassBtn} onPress={() => setOpen(true)} activeOpacity={0.75}>
          <Text style={pStyles.changePassText}>Cambiar contraseña</Text>
          <ChevronRight size={16} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      ) : (
        <View style={pStyles.form}>
          <NInput
            label="Contraseña actual"
            placeholder="••••••••"
            value={curr}
            onChangeText={setCurr}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
          />
          <NInput
            label="Nueva contraseña"
            placeholder="Mínimo 6 caracteres"
            value={next}
            onChangeText={setNext}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />
          {error   && <View style={pStyles.errorRow}><AlertTriangle size={13} color={Colors.error} /><Text style={pStyles.errorText}>{error}</Text></View>}
          {success && <View style={pStyles.successRow}><CheckCircle2 size={13} color={Colors.success} /><Text style={pStyles.successText}>Contraseña actualizada</Text></View>}
          <View style={pStyles.actions}>
            <NButton label="Cancelar" onPress={() => { setOpen(false); setCurr(''); setNext(''); setError(null); }} variant="ghost" size="sm" style={{ flex: 1 }} />
            <NButton label="Guardar" onPress={handleSave} loading={saving} size="sm" style={{ flex: 1 }} />
          </View>
        </View>
      )}
    </View>
  );
});

const pStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.xl,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.08)',
    overflow:        'hidden',
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        Spacing.md,
    paddingBottom:  Spacing.sm,
  },
  sectionLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.goldBorder,
  },
  editBtnText: { ...Typography.labelSm, color: Colors.primary, textTransform: 'none' as const },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.smMd },
  key: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  val: { ...Typography.bodyMd, color: Colors.onSurface, flex: 1, textAlign: 'right', marginLeft: Spacing.md },
  divider: { height: 1, backgroundColor: 'rgba(224,226,236,0.06)', marginHorizontal: Spacing.md },
  form: { padding: Spacing.md, gap: Spacing.sm },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { ...Typography.bodySm, color: Colors.error, flex: 1 },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  successText: { ...Typography.bodySm, color: Colors.success },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  changePassBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  changePassText: { ...Typography.bodyMd, color: Colors.onSurface },
});

// ── AccountScreen principal ───────────────────────────────────────────────────
export default function AccountScreen() {
  const navigation   = useNavigation<AccountNav>();
  const tabBarHeight = useBottomTabBarHeight();
  const { user, token, logout } = useAuthStore();
  const { favorites, loadFromBackend } = useFavoritesStore();
  const { balance: pointsBalance, totalEarned: pointsTotalEarned, movements: pointsMovements } = usePointsStore();
  const [showCatalog, setShowCatalog] = useState(false);

  // ── Historial ─────────────────────────────────────────────────
  const [orderHistory,     setOrderHistory]     = useState<OrderHistoryItem[]>([]);
  const [loadingHistory,   setLoadingHistory]   = useState(false);
  const [nextReservation,  setNextReservation]  = useState<ReservationSummary | null>(null);
  const [loadingReservation, setLoadingReservation] = useState(false);

  // ── Pedido activo en tiempo real ──────────────────────────────
  const [activeOrderStatus, setActiveOrderStatus] = useState<string | null>(null);
  const activeOrderIdRef = useRef<string | null>(null);

  // ── Iniciales ─────────────────────────────────────────────────
  const initials = (user?.name ?? '?')
    .split(' ').slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  // ── Carga inicial ─────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const history = await getMyOrderHistory(8);
      setOrderHistory(history);
      const active = history.find(
        (o) => o.status === 'pending' || o.status === 'in-progress'
      );
      if (active) {
        activeOrderIdRef.current = active._id;
        setActiveOrderStatus(active.status);
      }
    } catch {}
    finally { setLoadingHistory(false); }
  }, [token]);

  const fetchNextReservation = useCallback(async () => {
    if (!token) return;
    setLoadingReservation(true);
    try {
      const reservations = await getMyReservations({ upcoming: true, limit: 1 });
      if (reservations.length > 0) setNextReservation(reservations[0]);
    } catch {}
    finally { setLoadingReservation(false); }
  }, [token]);

  useEffect(() => {
    fetchHistory();
    fetchNextReservation();
    loadFromBackend();
    usePointsStore.getState().loadPoints();
  }, [token]);

  // ── Socket: pedido activo en tiempo real ──────────────────────
  useEffect(() => {
    if (!token || !user?.id) return;
    const unsub = socketService.onOrderUpdate((data) => {
      const orderId = data?.id ?? data?._id;
      if (orderId && orderId === activeOrderIdRef.current) {
        setActiveOrderStatus(data.status);
      }
    });
    return () => unsub();
  }, [token, user?.id]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleLogout = async () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    Alert.alert(
      'Cerrar sesión',
      '¿Confirmás que querés cerrar tu sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => { await logout(); },
        },
      ]
    );
  };

  const goToFavorites = () => navigation.navigate('Carta');
  const goToReservas  = () => navigation.navigate('Reservas');
  const goToPedidos   = () => navigation.navigate('Pedidos');

  // ── Quick actions ─────────────────────────────────────────────
  const QUICK_LINKS = [
    { label: 'Carta',    icon: <ChefHat    size={22} color={Colors.primary} />, bg: Colors.goldMuted,                  onPress: () => navigation.navigate('Carta')    },
    { label: 'Pedidos',  icon: <ShoppingBag size={22} color={Colors.success} />, bg: 'rgba(52,185,100,0.08)',            onPress: goToPedidos  },
    { label: 'Reservas', icon: <CalendarDays size={22} color={Colors.info} />,    bg: 'rgba(56,189,248,0.08)',            onPress: goToReservas },
    { label: 'Favoritos',icon: <Heart       size={22} color={Colors.error}  />,    bg: 'rgba(255,180,171,0.08)',           onPress: goToFavorites },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: tabBarHeight + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.screenLabel}>MI CUENTA</Text>
          <TouchableOpacity onPress={fetchHistory} style={styles.refreshBtn} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <RefreshCw size={16} color={Colors.outline} />
          </TouchableOpacity>
        </View>

        {/* ── Hero: avatar + nombre ────────────────────────── */}
        <View style={styles.heroContainer}>
          {/* Background layers */}
          <View style={styles.heroBg} />
          <View style={styles.heroOrb} />
          {/* Hero row */}
          <View style={styles.hero}>
            <View style={styles.avatarWrap}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroGreeting}>
                Hola, <Text style={styles.heroName}>{user?.name?.split(' ')[0]}</Text>
              </Text>
              <Text style={styles.heroEmail}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user?.role === 'client' ? 'Cliente' : user?.role ?? 'Cliente'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── LoyaltyCard ──────────────────────────────────── */}
        <LoyaltyCard
          balance={pointsBalance}
          totalEarned={pointsTotalEarned}
          userId={user?.id ?? ''}
        />

        {/* ── Mis Recompensas button ────────────────────────── */}
        <TouchableOpacity
          style={styles.rewardsBtn}
          onPress={() => setShowCatalog(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Abrir catálogo de recompensas"
        >
          <Sparkles size={18} color={Colors.primary} />
          <Text style={styles.rewardsBtnText}>🎁 Mis Recompensas</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>

        {/* ── Mini movements log (last 3) ───────────────────── */}
        {pointsMovements.length > 0 && (
          <View style={styles.movementsSection}>
            <Text style={styles.movementsTitle}>Últimos movimientos</Text>
            {pointsMovements.slice(0, 3).map((m, i) => (
              <View key={i} style={styles.movementRow}>
                <Text style={styles.movementEmoji}>
                  {m.amount > 0 ? '💰' : '🔴'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.movementDesc} numberOfLines={1}>{m.description}</Text>
                  <Text style={styles.movementDate}>
                    {new Date(m.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <Text style={[styles.movementAmount, { color: m.amount > 0 ? Colors.success : Colors.error }]}>
                  {m.amount > 0 ? `+${m.amount}` : `${m.amount}`} pts
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Pedido activo (tiempo real) ───────────────────── */}
        {activeOrderStatus && (
          <TouchableOpacity
            style={[
              styles.liveOrderBanner,
              activeOrderStatus === 'in-progress' && styles.liveOrderBannerPrep,
              activeOrderStatus === 'completed'   && styles.liveOrderBannerDone,
            ]}
            onPress={goToPedidos}
            activeOpacity={0.85}
          >
            <View style={styles.liveOrderDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.liveOrderLabel}>Pedido en curso</Text>
              <Text style={styles.liveOrderStatus}>
                {ORDER_STATUS_LABEL[activeOrderStatus] ?? activeOrderStatus}
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.primary} />
          </TouchableOpacity>
        )}

        {/* ── Próxima reserva ───────────────────────────────── */}
        {nextReservation && (
          <TouchableOpacity
            style={styles.reservationBanner}
            onPress={goToReservas}
            activeOpacity={0.85}
          >
            <CalendarDays size={18} color={Colors.info} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reservationLabel}>Próxima reserva</Text>
              <Text style={styles.reservationDetail}>
                {fmtDateTime(nextReservation.startTime)} · {nextReservation.guests} persona{nextReservation.guests !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={[styles.reservationStatusBadge, {
              borderColor: `${RESERVATION_STATUS_LABEL[nextReservation.status] ? Colors.success : Colors.warning}40`,
              backgroundColor: `${RESERVATION_STATUS_LABEL[nextReservation.status] ? Colors.success : Colors.warning}15`,
            }]}>
              <Text style={[styles.reservationStatusText, { color: nextReservation.status === 'confirmed' ? Colors.success : Colors.warning }]}>
                {RESERVATION_STATUS_LABEL[nextReservation.status] ?? nextReservation.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Accesos rápidos ───────────────────────────────── */}
        <View style={styles.quickGrid}>
          {QUICK_LINKS.map((q) => (
            <TouchableOpacity
              key={q.label}
              style={[styles.quickCard, { backgroundColor: q.bg }]}
              onPress={q.onPress}
              activeOpacity={0.75}
            >
              {q.icon}
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Historial de pedidos ──────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de pedidos</Text>

          {loadingHistory ? (
            <View style={{ gap: Spacing.sm }}>
              {[0, 1, 2].map((i) => <NSkeleton key={i} height={60} radius={Radius.lg} />)}
            </View>
          ) : orderHistory.length === 0 ? (
            <View style={styles.emptyRow}>
              <ClipboardList size={22} color={Colors.outline} />
              <Text style={styles.emptyText}>No tenés pedidos registrados todavía.</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {orderHistory.map((order) => {
                const color = ORDER_STATUS_COLOR[order.status] ?? Colors.outline;
                return (
                  <View key={order._id} style={[styles.historyCard, { borderLeftColor: color }]}>
                    <View style={styles.historyTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyItems}>
                          {order.itemCount} ítem{order.itemCount !== 1 ? 's' : ''}
                          {order.tableNumber ? ` · Mesa #${order.tableNumber}` : ''}
                        </Text>
                        <Text style={styles.historyDate}>{fmtDate(order.createdAt)}</Text>
                      </View>
                      <View>
                        <View style={[styles.statusBadge, { borderColor: `${color}40`, backgroundColor: `${color}15` }]}>
                          <Text style={[styles.statusBadgeText, { color }]}>
                            {ORDER_STATUS_LABEL[order.status] ?? order.status}
                          </Text>
                        </View>
                        <Text style={styles.historyTotal}>{fmtPrice(order.total)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Favoritos (preview 3) ────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Favoritos</Text>
            <TouchableOpacity onPress={goToFavorites} style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {favorites.length === 0 ? (
            <View style={styles.emptyRow}>
              <Heart size={22} color={Colors.outline} />
              <Text style={styles.emptyText}>
                Marcá productos con el corazón para guardarlos aquí.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.favPreviewCard}
              onPress={goToFavorites}
              activeOpacity={0.8}
            >
              <Heart size={18} color={Colors.error} fill={Colors.error} />
              <Text style={styles.favPreviewText}>
                {favorites.length} producto{favorites.length !== 1 ? 's' : ''} guardados
              </Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Perfil editable ───────────────────────────────── */}
        <ProfilePanel />

        {/* ── Seguridad ─────────────────────────────────────── */}
        <PasswordPanel />

        {/* ── Logout ────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <LogOut size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── RewardsCatalog modal ──────────────────────────── */}
      <RewardsCatalog
        visible={showCatalog}
        onClose={() => setShowCatalog(false)}
      />
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: Spacing.gutter,
    paddingTop:        Spacing.md,
    gap:               Spacing.lg,
  },

  // ── Header ─────────────────────────────────────────────────────
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  screenLabel: { ...Typography.labelSm, color: Colors.primary },
  refreshBtn:  { padding: 4 },

  // ── Hero ───────────────────────────────────────────────────────
  heroContainer: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius:    Radius.xl,
    borderWidth:     1,
    borderColor:     'rgba(224,226,236,0.08)',
    overflow:        'hidden',
    padding:         Spacing.md,
  },
  heroBg: {
    position:        'absolute',
    top:             0,
    bottom:          0,
    left:            0,
    right:           0,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  heroOrb: {
    position:        'absolute',
    left:            -24,
    top:             -24,
    width:           160,
    height:          160,
    borderRadius:    80,
    backgroundColor: Colors.goldMuted,
  },
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarWrap: {
    width: 64, height: 64, borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.goldBorder, overflow: 'hidden',
  },
  avatarImg:  { width: '100%', height: '100%' },
  avatarText: { ...Typography.headlineSm, color: Colors.onPrimary, fontWeight: '700' as const },
  heroInfo:   { flex: 1, gap: 3 },
  heroGreeting: { ...Typography.headlineSm, color: Colors.onSurface },
  heroName:   { color: Colors.primary },
  heroEmail:  { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.goldMuted, borderRadius: Radius.xs,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.goldBorder,
  },
  roleText: { ...Typography.labelSm, color: Colors.primary, textTransform: 'none' as const },

  // ── Live order banner ──────────────────────────────────────────
  liveOrderBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(243,190,89,0.08)',
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(243,190,89,0.25)',
  },
  liveOrderBannerPrep: { backgroundColor: 'rgba(224,120,40,0.08)', borderColor: 'rgba(224,120,40,0.25)' },
  liveOrderBannerDone: { backgroundColor: 'rgba(52,185,100,0.08)', borderColor: 'rgba(52,185,100,0.25)' },
  liveOrderDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  liveOrderLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant, textTransform: 'none' as const },
  liveOrderStatus: { ...Typography.titleMd, color: Colors.onSurface },

  // ── Reservation banner ─────────────────────────────────────────
  reservationBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(56,189,248,0.08)',
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(56,189,248,0.20)',
  },
  reservationLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant, textTransform: 'none' as const },
  reservationDetail: { ...Typography.bodyMd, color: Colors.onSurface },
  reservationStatusBadge: {
    borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1,
  },
  reservationStatusText: { ...Typography.labelSm, textTransform: 'none' as const },

  // ── Quick grid ─────────────────────────────────────────────────
  quickGrid: {
    flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm,
  },
  quickCard: {
    flex: 1, aspectRatio: 1,
    borderRadius: Radius.lg, justifyContent: 'center', alignItems: 'center',
    gap: 6, borderWidth: 1, borderColor: 'rgba(224,226,236,0.06)',
  },
  quickLabel: { ...Typography.labelSm, color: Colors.onSurface, textTransform: 'none' as const, textAlign: 'center' },

  // ── Section ────────────────────────────────────────────────────
  section: { gap: Spacing.sm },
  sectionTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAllBtn:  {},
  seeAllText: { ...Typography.labelMd, color: Colors.primary },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  emptyText: { ...Typography.bodyMd, color: Colors.outline, flex: 1 },

  // ── History ────────────────────────────────────────────────────
  historyList: { gap: Spacing.sm },
  historyCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(224,226,236,0.06)',
    borderLeftWidth: 3,
  },
  historyTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  historyItems: { ...Typography.labelLg, color: Colors.onSurface },
  historyDate:  { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  historyTotal: { ...Typography.labelLg, color: Colors.primary, textAlign: 'right', marginTop: 4 },
  statusBadge: {
    alignSelf: 'flex-end',
    borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1,
  },
  statusBadgeText: { ...Typography.labelSm, textTransform: 'none' as const },

  // ── Favorites preview ──────────────────────────────────────────
  favPreviewCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(224,226,236,0.06)',
  },
  favPreviewText: { ...Typography.bodyMd, color: Colors.onSurface, flex: 1 },

  // ── Logout ─────────────────────────────────────────────────────
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.25)',
    backgroundColor: 'rgba(255,180,171,0.05)',
  },
  logoutText: { ...Typography.labelLg, color: Colors.error },

  // ── Rewards button ──────────────────────────────────────────────
  rewardsBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: Colors.goldMuted,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  rewardsBtnText: {
    ...Typography.labelLg,
    color: Colors.primary,
    flex:  1,
  },

  // ── Movements log ────────────────────────────────────────────────
  movementsSection: {
    gap: Spacing.xs,
  },
  movementsTitle: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  movementRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.md,
    padding:         Spacing.smMd,
    borderWidth:     1,
    borderColor:     'rgba(224,226,236,0.05)',
  },
  movementEmoji: {
    fontSize:   16,
    lineHeight: 20,
  },
  movementDesc: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
  },
  movementDate: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  movementAmount: {
    ...Typography.labelMd,
    fontWeight: '700' as const,
  },
});

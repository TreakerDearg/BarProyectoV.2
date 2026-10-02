// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — AuthScreen
// Login y Register con diseño Nocturne Gastronomy.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors }     from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { useAuthStore } from '../stores/useAuthStore';
import { NInput }  from '../components/shared/NInput';
import { NButton } from '../components/shared/NButton';

type Tab = 'login' | 'register';

export default function AuthScreen() {
  const [tab, setTab] = useState<Tab>('login');

  // ── Fields ────────────────────────────────────────────────────
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [localErr, setLocalErr] = useState<string | null>(null);

  // ── Store ─────────────────────────────────────────────────────
  const { login, register, isLoading, error, clearError } = useAuthStore();

  // ── Refs para pasar foco entre inputs ─────────────────────────
  const emailRef    = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // ── Animation refs ────────────────────────────────────────────
  const heroOpacity      = useRef(new Animated.Value(0)).current;
  const heroScale        = useRef(new Animated.Value(0.85)).current;
  const cardOpacity      = useRef(new Animated.Value(0)).current;
  const cardTranslateY   = useRef(new Animated.Value(30)).current;
  const tabIndicatorX    = useRef(new Animated.Value(0)).current;
  const tabContainerWidth = useRef<number>(0);

  // ── Entrance animation ─────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity,    { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(heroScale,      { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(cardOpacity,    { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(cardTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────
  const switchTab = (t: Tab) => {
    setTab(t);
    setLocalErr(null);
    clearError();
    setName(''); setEmail(''); setPassword('');
    Animated.spring(tabIndicatorX, {
      toValue: t === 'login' ? 0 : tabContainerWidth.current / 2,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();
  };

  const validate = (): string | null => {
    if (tab === 'register' && name.trim().length < 2)
      return 'El nombre debe tener al menos 2 caracteres.';
    if (!email.includes('@'))
      return 'Ingresá un email válido.';
    if (password.length < 6)
      return 'La contraseña debe tener al menos 6 caracteres.';
    return null;
  };

  const handleSubmit = async () => {
    setLocalErr(null);
    const validErr = validate();
    if (validErr) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      setLocalErr(validErr);
      return;
    }
    try {
      if (tab === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({ name: name.trim(), email: email.trim(), password });
      }
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    } catch {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
    }
  };

  const displayError = localErr ?? error;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo & Brand (animated) ───────────────────── */}
          <Animated.View
            style={[
              styles.brand,
              { opacity: heroOpacity, transform: [{ scale: heroScale }] },
            ]}
          >
            {/* Gold orb behind icon */}
            <View style={styles.brandOrb} />
            <View style={styles.brandMark}>
              <Sparkles size={28} color={Colors.primary} />
            </View>
            <Text style={styles.brandName}>NEBULA</Text>
            <Text style={styles.brandSub}>Food & Beverage</Text>
          </Animated.View>

          {/* ── Card container (animated) ─────────────────── */}
          <Animated.View
            style={[
              styles.card,
              { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] },
            ]}
          >
            {/* Tab selector */}
            <View
              style={styles.tabRow}
              onLayout={(e) => {
                tabContainerWidth.current = e.nativeEvent.layout.width;
              }}
            >
              {/* Animated pill indicator */}
              <Animated.View
                style={[
                  styles.tabPill,
                  { transform: [{ translateX: tabIndicatorX }] },
                ]}
              />
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => switchTab('login')}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabLabel, tab === 'login' && styles.tabLabelActive]}>
                  Iniciar sesión
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => switchTab('register')}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabLabel, tab === 'register' && styles.tabLabelActive]}>
                  Crear cuenta
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Form ────────────────────────────────────── */}
            <View style={styles.form}>

              {tab === 'register' && (
                <NInput
                  label="Nombre"
                  placeholder="Tu nombre completo"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  maxLength={50}
                />
              )}

              <NInput
                label="Email"
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                inputRef={emailRef as React.RefObject<TextInput>}
              />

              <NInput
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                inputRef={passwordRef as React.RefObject<TextInput>}
              />

              {displayError && (
                <View style={styles.errorBanner}>
                  <AlertCircle size={16} color={Colors.error} />
                  <Text style={styles.errorText}>{displayError}</Text>
                </View>
              )}

              <NButton
                label={tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                onPress={handleSubmit}
                loading={isLoading}
                fullWidth
                size="lg"
              />
            </View>

            {/* Divider + switch */}
            <View style={styles.switchRow}>
              <View style={styles.divider} />
              <Text style={styles.switchText}>
                {tab === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}
              </Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => switchTab(tab === 'login' ? 'register' : 'login')}
              activeOpacity={0.75}
            >
              <Text style={styles.switchBtnText}>
                {tab === 'login' ? 'Crear cuenta nueva' : 'Iniciar sesión'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer note */}
          <Text style={styles.footerNote}>
            Al continuar aceptás los términos del servicio de Nebula.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: Colors.background },
  flex:  { flex: 1 },
  scroll: {
    flexGrow:       1,
    justifyContent: 'center',
    padding:        Spacing.gutter,
    paddingBottom:  Spacing.xl,
    gap:            Spacing.lg,
  },

  // ── Brand ──────────────────────────────────────────────────────
  brand: {
    alignItems: 'center',
    gap:        Spacing.xs,
    marginBottom: Spacing.sm,
  },
  brandOrb: {
    position:        'absolute',
    top:             -8,
    width:           110,
    height:          110,
    borderRadius:    55,
    backgroundColor: Colors.goldMuted,
  },
  brandMark: {
    width:           56,
    height:          56,
    borderRadius:    Radius.xl,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
    justifyContent:  'center',
    alignItems:      'center',
    marginBottom:    Spacing.sm,
  },
  brandName: {
    ...Typography.displaySm,
    color:         Colors.primary,
    letterSpacing: 4,
  },
  brandSub: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },

  // ── Card ───────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.xl,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.08)',
    padding:         Spacing.lg,
    gap:             Spacing.md,
  },

  // ── Tabs ───────────────────────────────────────────────────────
  tabRow: {
    flexDirection:    'row',
    backgroundColor:  Colors.surfaceContainerLow,
    borderRadius:     Radius.md,
    padding:          3,
    position:         'relative',
  },
  tabPill: {
    position:        'absolute',
    left:            3,
    top:             3,
    bottom:          3,
    width:           '50%',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius:    Radius.md - 2,
  },
  tabBtn: {
    flex:            1,
    paddingVertical: 10,
    alignItems:      'center',
    borderRadius:    Radius.md - 2,
  },
  tabLabel: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
  tabLabelActive: {
    color: Colors.onSurface,
    ...Typography.labelLg,
  },

  // ── Form ───────────────────────────────────────────────────────
  form: {
    gap: Spacing.md,
  },

  // ── Error banner ───────────────────────────────────────────────
  errorBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: 'rgba(255, 180, 171, 0.10)',
    borderWidth:     1,
    borderColor:     'rgba(255, 180, 171, 0.30)',
    borderRadius:    Radius.md,
    padding:         Spacing.smMd,
  },
  errorText: {
    ...Typography.bodySm,
    color: Colors.error,
    flex:  1,
  },

  // ── Switch row ────────────────────────────────────────────────
  switchRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
    marginTop:     Spacing.xs,
  },
  divider: {
    flex:            1,
    height:          1,
    backgroundColor: Colors.outlineVariant,
  },
  switchText: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  switchBtnText: {
    ...Typography.labelLg,
    color: Colors.primary,
  },

  // ── Footer ────────────────────────────────────────────────────
  footerNote: {
    ...Typography.labelSm,
    color:     Colors.outline,
    textAlign: 'center',
  },
});

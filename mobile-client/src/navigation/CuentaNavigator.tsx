// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — CuentaNavigator
// Muestra AuthScreen o AccountScreen según si hay sesión activa.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import AuthScreen    from '../screens/AuthScreen';
import AccountScreen from '../screens/AccountScreen';

export default function CuentaNavigator() {
  const token = useAuthStore((s) => s.token);
  return token ? <AccountScreen /> : <AuthScreen />;
}

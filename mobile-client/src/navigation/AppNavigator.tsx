// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — AppNavigator
// Bottom Tab Navigator de 5 tabs con estilo Nocturne Gastronomy.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  UtensilsCrossed,
  ShoppingBag,
  CalendarDays,
  UserCircle,
} from 'lucide-react-native';

import { Colors }   from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing }  from '../theme/spacing';

import HomeScreen    from '../screens/HomeScreen';
import CartaScreen   from '../screens/CartaScreen';
import PedidoScreen  from '../screens/PedidoScreen';
import ReservasScreen from '../screens/ReservasScreen';
import CuentaNavigator from './CuentaNavigator';

import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

// ── Configuración de cada tab ─────────────────────────────────────────────────
const TAB_CONFIG = [
  {
    name: 'Inicio'   as const,
    component: HomeScreen,
    icon: Home,
    label: 'Inicio',
  },
  {
    name: 'Carta'    as const,
    component: CartaScreen,
    icon: UtensilsCrossed,
    label: 'Carta',
  },
  {
    name: 'Pedidos'  as const,
    component: PedidoScreen,
    icon: ShoppingBag,
    label: 'Pedidos',
  },
  {
    name: 'Reservas' as const,
    component: ReservasScreen,
    icon: CalendarDays,
    label: 'Reservas',
  },
  {
    name: 'Cuenta'   as const,
    component: CuentaNavigator,
    icon: UserCircle,
    label: 'Cuenta',
  },
] as const;

// ── Componente ────────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => {
        const config = TAB_CONFIG.find((t) => t.name === route.name);
        const IconComponent = config?.icon ?? Home;

        return {
          headerShown: false,
          // Fondo de cada pantalla — evita flash blanco entre navegaciones
          sceneStyle: { backgroundColor: Colors.background },

          // ── Tab bar style ────────────────────────────────────────
          tabBarStyle: {
            backgroundColor:  Colors.background,           // #10131a
            borderTopColor:   'rgba(224, 226, 236, 0.08)', // sutil, sin dominancia
            borderTopWidth:   1,
            height:           Spacing.tabBarHeight + insets.bottom,
            paddingBottom:    Platform.OS === 'android' ? 8 : insets.bottom > 0 ? insets.bottom : 8,
            paddingTop:       8,
            // sin shadow en Android, borde minimalista como el diseño
            elevation:        0,
          },

          // ── Label ────────────────────────────────────────────────
          tabBarLabelStyle: {
            ...Typography.labelMd,
            marginTop: -2,
          },

          // ── Colores activo/inactivo ───────────────────────────────
          tabBarActiveTintColor:   Colors.primary,          // #f3be59 gold
          tabBarInactiveTintColor: Colors.onSurfaceVariant, // #d3c5b1

          // ── Ripple Android ───────────────────────────────────────
          tabBarItemStyle: {
            paddingVertical: 4,
          },

          tabBarHideOnKeyboard: true,

          // ── Icono dinámico con indicador ─────────────────────────
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: 'center', gap: 2 }}>
              <IconComponent
                size={22}
                color={color}
                strokeWidth={focused ? 2.2 : 1.8}
              />
              {focused && (
                <View style={{ width: 20, height: 4, borderRadius: 2, backgroundColor: Colors.primaryContainer }} />
              )}
            </View>
          ),

          tabBarLabel: config?.label ?? route.name,
        };
      }}
    >
      {TAB_CONFIG.map(({ name, component }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
        />
      ))}
    </Tab.Navigator>
  );
}

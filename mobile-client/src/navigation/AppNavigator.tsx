// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — AppNavigator
// Bottom Tab Navigator de 5 tabs con estilo Nocturne Gastronomy.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Platform, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  UtensilsCrossed,
  ShoppingBag,
  CalendarDays,
  UserCircle,
} from 'lucide-react-native';

import { Colors }    from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing }   from '../theme/spacing';
import { useCartStore } from '../stores/useCartStore';

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
    isBadge: false,
  },
  {
    name: 'Carta'    as const,
    component: CartaScreen,
    icon: UtensilsCrossed,
    label: 'Carta',
    isBadge: false,
  },
  {
    name: 'Pedidos'  as const,
    component: PedidoScreen,
    icon: ShoppingBag,
    label: 'Pedidos',
    isBadge: true,
  },
  {
    name: 'Reservas' as const,
    component: ReservasScreen,
    icon: CalendarDays,
    label: 'Reservas',
    isBadge: false,
  },
  {
    name: 'Cuenta'   as const,
    component: CuentaNavigator,
    icon: UserCircle,
    label: 'Cuenta',
    isBadge: false,
  },
] as const;

// ── Componente ────────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore((s) => s.cart.length);

  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => {
        const config = TAB_CONFIG.find((t) => t.name === route.name);
        const IconComponent = config?.icon ?? Home;
        const showBadge = config?.isBadge && cartCount > 0;

        return {
          headerShown: false,
          // Fondo de cada pantalla — evita flash blanco entre navegaciones
          sceneStyle: { backgroundColor: Colors.background },

          // ── Tab bar style ────────────────────────────────────────
          tabBarStyle: {
            backgroundColor:  Colors.surfaceElevated,
            borderTopColor:   Colors.goldBorder,
            borderTopWidth:   1,
            height:           Spacing.tabBarHeightNew + insets.bottom,
            paddingBottom:    Platform.OS === 'android' ? 8 : insets.bottom > 0 ? insets.bottom : 8,
            paddingTop:       8,
            elevation:        16,
            shadowColor:      '#000',
            shadowOffset:     { width: 0, height: -2 },
            shadowOpacity:    0.3,
            shadowRadius:     8,
          },

          // ── Label ────────────────────────────────────────────────
          tabBarLabelStyle: {
            fontSize:      10,
            letterSpacing: 0.3,
            marginTop:     1,
          },

          // ── Colores activo/inactivo ───────────────────────────────
          tabBarActiveTintColor:   Colors.primary,
          tabBarInactiveTintColor: Colors.onSurfaceVariant,

          // ── Ripple Android ───────────────────────────────────────
          tabBarItemStyle: {
            paddingVertical: 4,
          },

          tabBarHideOnKeyboard: true,

          // ── Icono dinámico con indicador y badge ─────────────────
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: 'center', gap: 2 }}>
              <View style={{ position: 'relative' }}>
                <IconComponent
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
                {showBadge && (
                  <View
                    style={{
                      position:        'absolute',
                      top:             -4,
                      right:           -6,
                      width:           16,
                      height:          16,
                      borderRadius:    8,
                      backgroundColor: Colors.badgeRed,
                      justifyContent:  'center',
                      alignItems:      'center',
                    }}
                  >
                    <Text
                      style={{
                        color:      '#fff',
                        fontSize:   9,
                        fontWeight: '700' as const,
                        lineHeight: 11,
                      }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </Text>
                  </View>
                )}
              </View>
              {focused && (
                <View style={{ width: 40, height: 3, borderRadius: 2, backgroundColor: Colors.primaryContainer }} />
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

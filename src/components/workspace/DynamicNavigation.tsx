"use client";

import { useWorkspaceNavigation } from '@/lib/workspace/hooks/useWorkspace';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { 
  Home, Menu, ShoppingBag, Calendar, RotateCw, User, 
  Grid, Clock, CreditCard, LayoutDashboard, Users, Shield,
  Package, TrendingUp, FileText, Settings, BarChart, 
  Building, DollarSign, Crown
} from 'lucide-react';

/**
 * Mapeo de iconos a componentes Lucide
 */
const iconMap: Record<string, any> = {
  home: Home,
  menu: Menu,
  'shopping-bag': ShoppingBag,
  calendar: Calendar,
  'rotate-cw': RotateCw,
  user: User,
  grid: Grid,
  clock: Clock,
  'credit-card': CreditCard,
  'layout-dashboard': LayoutDashboard,
  users: Users,
  shield: Shield,
  package: Package,
  'trending-up': TrendingUp,
  'file-text': FileText,
  settings: Settings,
  'bar-chart': BarChart,
  building: Building,
  'dollar-sign': DollarSign,
  'user-crown': Crown,
};

/**
 * Componente de navegación dinámica
 */
export function DynamicNavigation({ platform = 'web' }: { platform?: string }) {
  const { navigation, shortcuts, loading, error } = useWorkspaceNavigation(platform);
  const pathname = usePathname();

  if (loading) {
    return <NavigationSkeleton />;
  }

  if (error) {
    return <NavigationError error={error} />;
  }

  if (!navigation || navigation.length === 0) {
    return <NavigationEmpty />;
  }

  return (
    <nav className="flex flex-col gap-1">
      {navigation.map((item: any) => {
        const Icon = item.icon ? iconMap[item.icon] : null;
        const isActive = pathname === item.path;

        if (item.hidden) return null;
        if (item.divider) return <div key={item.id} className="border-t border-gray-700 my-2" />;

        return (
          <Link
            key={item.id}
            href={item.path || '#'}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              'text-sm font-medium',
              isActive
                ? 'bg-amber-500/20 text-amber-500'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white',
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={(e: React.MouseEvent) => item.disabled && e.preventDefault()}
          >
            {Icon && <Icon className="w-5 h-5" />}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}

      {/* Accesos rápidos */}
      {shortcuts && shortcuts.length > 0 && (
        <>
          <div className="border-t border-gray-700 my-2" />
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Accesos Rápidos
          </div>
          {shortcuts.map((shortcut: any) => {
            const Icon = shortcut.icon ? iconMap[shortcut.icon] : null;

            return (
              <Link
                key={shortcut.id}
                href={shortcut.path || '#'}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span>{shortcut.label}</span>
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}

/**
 * Skeleton de carga
 */
function NavigationSkeleton() {
  return (
    <nav className="flex flex-col gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
          <div className="flex-1 h-4 bg-gray-700 rounded animate-pulse" />
        </div>
      ))}
    </nav>
  );
}

/**
 * Error de navegación
 */
function NavigationError({ error }: { error: string }) {
  return (
    <div className="p-4 text-sm text-red-400">
      Error al cargar navegación: {error}
    </div>
  );
}

/**
 * Navegación vacía
 */
function NavigationEmpty() {
  return (
    <div className="p-4 text-sm text-gray-500">
      No hay elementos de navegación disponibles
    </div>
  );
}

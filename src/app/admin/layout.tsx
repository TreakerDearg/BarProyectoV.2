import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, Percent, Package, MenuSquare, 
  ShoppingBag, Coffee, Beaker, Calendar, Dices, 
  Grid2X2, Settings, LogOut 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Empleados', href: '/admin/employees', icon: Users },
  { name: 'Mesas', href: '/admin/tables', icon: Grid2X2 },
  { name: 'Órdenes', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Menús', href: '/admin/menus', icon: MenuSquare },
  { name: 'Productos', href: '/admin/products', icon: Coffee },
  { name: 'Recetas', href: '/admin/recipes', icon: Beaker },
  { name: 'Inventario', href: '/admin/inventory', icon: Package },
  { name: 'Reservas', href: '/admin/reservations', icon: Calendar },
  { name: 'Descuentos', href: '/admin/discounts', icon: Percent },
  { name: 'Ruleta', href: '/admin/roulette', icon: Dices },
  { name: 'Ajustes', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-zinc-950 border-r border-white/5">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight text-amber-500">OBSIDIAN</h2>
          <p className="text-xs text-zinc-500 tracking-widest mt-1 uppercase">Command Center</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors group"
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-900/50 relative">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />
        
        <header className="h-16 flex items-center px-8 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md z-10">
          <h1 className="text-lg font-medium text-zinc-200">Panel de Administración</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 z-10 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}

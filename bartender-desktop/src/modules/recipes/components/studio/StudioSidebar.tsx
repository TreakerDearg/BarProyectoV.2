/**
 * StudioSidebar — Navegación lateral del Recipe Studio
 * Fiel a la plantilla: Dashboard · Recetas · Variantes · Ingredientes · Categorías · Técnicas · Inventario · Reportes
 */
import {
  LayoutDashboard, BookOpen, Layers, FlaskConical,
  Tag, Paintbrush2, Package, BarChart2, Wand2,
} from 'lucide-react';

export type StudioView =
  | 'dashboard'
  | 'recipes'
  | 'variants'
  | 'ingredients'
  | 'categories'
  | 'techniques'
  | 'inventory'
  | 'reports';

interface NavItem { id: StudioView; label: string; icon: React.ReactNode }

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Dashboard',    icon: <LayoutDashboard size={15} /> },
  { id: 'recipes',     label: 'Recetas',       icon: <BookOpen        size={15} /> },
  { id: 'variants',    label: 'Variantes',     icon: <Layers          size={15} /> },
  { id: 'ingredients', label: 'Ingredientes',  icon: <FlaskConical    size={15} /> },
  { id: 'categories',  label: 'Categorías',    icon: <Tag             size={15} /> },
  { id: 'techniques',  label: 'Técnicas',      icon: <Paintbrush2     size={15} /> },
  { id: 'inventory',   label: 'Inventario',    icon: <Package         size={15} /> },
  { id: 'reports',     label: 'Reportes',      icon: <BarChart2       size={15} /> },
];

interface Props {
  activeView: StudioView;
  onNavigate: (v: StudioView) => void;
}

export function StudioSidebar({ activeView, onNavigate }: Props) {
  return (
    <aside className="w-44 flex-shrink-0 border-r border-white/6 bg-[#0A0A0D]/80 flex flex-col py-3 overflow-y-auto">
      <nav className="space-y-0.5 px-2.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all text-left ${
                active
                  ? 'bg-gold/12 border border-gold/22 text-gold'
                  : 'text-muted hover:text-ivory hover:bg-white/4 border border-transparent'
              }`}
            >
              <span className={active ? 'text-gold' : 'text-muted/60'}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Branding al fondo */}
      <div className="px-2.5 pb-2 mt-3 border-t border-white/6 pt-3">
        <div className="px-3 py-2.5 rounded-xl bg-white/3 border border-white/6">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-4 h-4 rounded bg-gold/20 flex items-center justify-center">
              <Wand2 size={10} className="text-gold" />
            </div>
            <span className="text-[11px] font-bold text-ivory">Nebula</span>
          </div>
          <p className="text-[10px] text-muted/60">Bar & Restaurant</p>
        </div>
      </div>
    </aside>
  );
}

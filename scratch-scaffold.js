const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src', 'app', 'admin');

const modules = [
  'dashboard',
  'employees',
  'discounts',
  'inventory',
  'menus',
  'orders',
  'products',
  'recipes',
  'reservations',
  'roulette',
  'tables',
  'settings'
];

const layoutContent = "import React from 'react';\n" +
"import Link from 'next/link';\n" +
"import { \n" +
"  LayoutDashboard, Users, Percent, Package, MenuSquare, \n" +
"  ShoppingBag, Coffee, Beaker, Calendar, Dices, \n" +
"  Grid2X2, Settings, LogOut \n" +
"} from 'lucide-react';\n" +
"\n" +
"const navItems = [\n" +
"  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },\n" +
"  { name: 'Empleados', href: '/admin/employees', icon: Users },\n" +
"  { name: 'Mesas', href: '/admin/tables', icon: Grid2X2 },\n" +
"  { name: 'Órdenes', href: '/admin/orders', icon: ShoppingBag },\n" +
"  { name: 'Menús', href: '/admin/menus', icon: MenuSquare },\n" +
"  { name: 'Productos', href: '/admin/products', icon: Coffee },\n" +
"  { name: 'Recetas', href: '/admin/recipes', icon: Beaker },\n" +
"  { name: 'Inventario', href: '/admin/inventory', icon: Package },\n" +
"  { name: 'Reservas', href: '/admin/reservations', icon: Calendar },\n" +
"  { name: 'Descuentos', href: '/admin/discounts', icon: Percent },\n" +
"  { name: 'Ruleta', href: '/admin/roulette', icon: Dices },\n" +
"  { name: 'Ajustes', href: '/admin/settings', icon: Settings },\n" +
"];\n" +
"\n" +
"export default function AdminLayout({ children }: { children: React.ReactNode }) {\n" +
"  return (\n" +
"    <div className=\"flex h-screen bg-black text-white overflow-hidden font-sans\">\n" +
"      {/* Sidebar */}\n" +
"      <aside className=\"w-64 flex flex-col bg-zinc-950 border-r border-white/5\">\n" +
"        <div className=\"p-6\">\n" +
"          <h2 className=\"text-2xl font-bold tracking-tight text-amber-500\">OBSIDIAN</h2>\n" +
"          <p className=\"text-xs text-zinc-500 tracking-widest mt-1 uppercase\">Command Center</p>\n" +
"        </div>\n" +
"        \n" +
"        <nav className=\"flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar\">\n" +
"          {navItems.map((item) => {\n" +
"            const Icon = item.icon;\n" +
"            return (\n" +
"              <Link\n" +
"                key={item.name}\n" +
"                href={item.href}\n" +
"                className=\"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors group\"\n" +
"              >\n" +
"                <Icon className=\"w-5 h-5 transition-transform group-hover:scale-110\" />\n" +
"                {item.name}\n" +
"              </Link>\n" +
"            );\n" +
"          })}\n" +
"        </nav>\n" +
"        \n" +
"        <div className=\"p-4 border-t border-white/5\">\n" +
"          <button className=\"flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors\">\n" +
"            <LogOut className=\"w-5 h-5\" />\n" +
"            Cerrar Sesión\n" +
"          </button>\n" +
"        </div>\n" +
"      </aside>\n" +
"\n" +
"      {/* Main content */}\n" +
"      <main className=\"flex-1 flex flex-col overflow-hidden bg-zinc-900/50 relative\">\n" +
"        {/* Glow effect */}\n" +
"        <div className=\"absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full\" />\n" +
"        \n" +
"        <header className=\"h-16 flex items-center px-8 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md z-10\">\n" +
"          <h1 className=\"text-lg font-medium text-zinc-200\">Panel de Administración</h1>\n" +
"        </header>\n" +
"        \n" +
"        <div className=\"flex-1 overflow-y-auto p-8 z-10 custom-scrollbar\">\n" +
"          {children}\n" +
"        </div>\n" +
"      </main>\n" +
"    </div>\n" +
"  );\n" +
"}\n";

fs.writeFileSync(path.join(basePath, 'layout.tsx'), layoutContent);

const dashboardPage = "import { redirect } from 'next/navigation';\n" +
"export default function AdminIndex() {\n" +
"  redirect('/admin/dashboard');\n" +
"}\n";

fs.writeFileSync(path.join(basePath, 'page.tsx'), dashboardPage);

modules.forEach(mod => {
  const modPath = path.join(basePath, mod);
  fs.mkdirSync(modPath, { recursive: true });
  
  const title = mod.charAt(0).toUpperCase() + mod.slice(1);
  const pageContent = "import React from 'react';\n\n" +
"export const metadata = {\n" +
"  title: '" + title + " | Obsidian Admin',\n" +
"};\n\n" +
"export default function " + title + "Page() {\n" +
"  return (\n" +
"    <div className=\"space-y-6\">\n" +
"      <div className=\"flex items-center justify-between\">\n" +
"        <div>\n" +
"          <h1 className=\"text-3xl font-bold tracking-tight text-white\">" + title + "</h1>\n" +
"          <p className=\"text-zinc-400 mt-1\">Gestión del módulo de " + title.toLowerCase() + ".</p>\n" +
"        </div>\n" +
"        <button className=\"px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors\">\n" +
"          Nuevo Registro\n" +
"        </button>\n" +
"      </div>\n" +
"      \n" +
"      <div className=\"p-8 rounded-xl border border-white/5 bg-zinc-950/50 backdrop-blur-sm min-h-[400px] flex items-center justify-center\">\n" +
"        <div className=\"text-center\">\n" +
"          <div className=\"w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4\">\n" +
"            <span className=\"text-2xl text-amber-500\">⚡</span>\n" +
"          </div>\n" +
"          <h3 className=\"text-lg font-medium text-white mb-2\">Módulo en Construcción</h3>\n" +
"          <p className=\"text-zinc-500 max-w-sm mx-auto\">\n" +
"            El módulo de " + title.toLowerCase() + " está siendo implementado con la API del backend.\n" +
"          </p>\n" +
"        </div>\n" +
"      </div>\n" +
"    </div>\n" +
"  );\n" +
"}\n";

  fs.writeFileSync(path.join(modPath, 'page.tsx'), pageContent);
});

console.log("Admin scaffolded successfully.");

import React from 'react';
import {
  StudioHeader,
  QuickActions,
  StudioSidebar,
  RecipeStats,
  RecentRecipes,
  CollectionGrid,
  ActivityTimeline,
  WarningPanel,
  SuggestionPanel,
  EmptyState,
} from './index';
import styles from './Dashboard.module.css';

interface DashboardProps {
  recipes?: any[];
  collections?: any[];
  onNavigate?: (section: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  recipes = [],
  collections = [],
  onNavigate,
}) => {
  const [activeSection, setActiveSection] = React.useState('dashboard');

  const sidebarItems = [
    {
      id: 'dashboard',
      icon: <span>📊</span>,
      label: 'Dashboard',
      description: 'Vista general del estudio',
      onClick: () => setActiveSection('dashboard'),
    },
    {
      id: 'library',
      icon: <span>📚</span>,
      label: 'Library',
      description: 'Biblioteca de recetas',
      onClick: () => onNavigate?.('library'),
    },
    {
      id: 'builder',
      icon: <span>🛠️</span>,
      label: 'Builder',
      description: 'Constructor de recetas',
      onClick: () => onNavigate?.('builder'),
    },
    {
      id: 'variants',
      icon: <span>🔀</span>,
      label: 'Variants',
      description: 'Gestión de variantes',
      status: 'coming-soon' as const,
      onClick: () => {},
    },
    {
      id: 'techniques',
      icon: <span>🎨</span>,
      label: 'Techniques',
      description: 'Técnicas y métodos',
      onClick: () => onNavigate?.('techniques'),
    },
    {
      id: 'decorations',
      icon: <span>✨</span>,
      label: 'Decorations',
      description: 'Decoraciones y garnish',
      onClick: () => onNavigate?.('decorations'),
 count: 24,
    },
    {
      id: 'collections',
      icon: <span>📁</span>,
      label: 'Collections',
      description: 'Colecciones organizadas',
      onClick: () => onNavigate?.('collections'),
      count: collections.length,
    },
    {
      id: 'analytics',
      icon: <span>📈</span>,
      label: 'Analytics',
      description: 'Análisis y métricas',
      status: 'beta' as const,
      onClick: () => onNavigate?.('analytics'),
    },
    {
      id: 'timeline',
      icon: <span>📅</span>,
      label: 'Timeline',
      description: 'Historial de cambios',
      onClick: () => onNavigate?.('timeline'),
    },
    {
      id: 'warnings',
      icon: <span>⚠️</span>,
      label: 'Warnings',
      description: 'Alertas y problemas',
      onClick: () => onNavigate?.('warnings'),
    },
    {
      id: 'suggestions',
      icon: <span>💡</span>,
      label: 'Suggestions',
      description: 'Sugerencias inteligentes',
      onClick: () => onNavigate?.('suggestions'),
    },
    {
      id: 'trash',
      icon: <span>🗑️</span>,
      label: 'Trash',
      description: 'Elementos eliminados',
      onClick: () => onNavigate?.('trash'),
    },
  ];

  const quickActions = [
    {
      id: 'new-recipe',
      icon: <span>🍸</span>,
      label: 'Nueva receta',
      description: 'Crear una receta desde cero',
      onClick: () => onNavigate?.('builder'),
      color: 'violet' as const,
    },
    {
      id: 'new-collection',
      icon: <span>📁</span>,
      label: 'Nueva colección',
      description: 'Organizar recetas en grupos',
      onClick: () => {},
      color: 'indigo' as const,
    },
    {
      id: 'new-variant',
      icon: <span>🔀</span>,
      label: 'Nueva variante',
      description: 'Crear variante de receta',
      onClick: () => {},
      color: 'cyan' as const,
    },
    {
      id: 'open-library',
      icon: <span>📚</span>,
      label: 'Abrir biblioteca',
      description: 'Explorar todas las recetas',
      onClick: () => onNavigate?.('library'),
      color: 'emerald' as const,
    },
    {
      id: 'open-builder',
      icon: <span>🛠️</span>,
      label: 'Abrir Builder',
      description: 'Editar receta existente',
      onClick: () => onNavigate?.('builder'),
      color: 'amber' as const,
    },
    {
      id: 'analytics',
      icon: <span>📊</span>,
      label: 'Analytics',
      description: 'Ver análisis detallados',
      onClick: () => onNavigate?.('analytics'),
      color: 'pink' as const,
    },
  ];

  const stats = [
    {
      id: 'total-recipes',
      label: 'Total recetas',
      value: recipes.length,
      icon: <span>🍸</span>,
      trend: { value: 12, direction: 'up' as const },
      color: 'violet' as const,
    },
    {
      id: 'variants',
      label: 'Variantes',
      value: 8,
      icon: <span>🔀</span>,
      trend: { value: 5, direction: 'up' as const },
      color: 'indigo' as const,
    },
    {
      id: 'collections',
      label: 'Colecciones',
      value: collections.length,
      icon: <span>📁</span>,
      trend: { value: 2, direction: 'neutral' as const },
      color: 'cyan' as const,
    },
    {
      id: 'ingredients',
      label: 'Ingredientes',
      value: 156,
      icon: <span>🥗</span>,
      trend: { value: 8, direction: 'up' as const },
      color: 'emerald' as const,
    },
    {
      id: 'avg-cost',
      label: 'Costo promedio',
      value: '$2.45',
      icon: <span>💰</span>,
      trend: { value: 3, direction: 'down' as const },
      color: 'amber' as const,
    },
    {
      id: 'avg-health',
      label: 'Health promedio',
      value: '78',
      icon: <span>❤️</span>,
      trend: { value: 5, direction: 'up' as const },
      color: 'pink' as const,
    },
  ];

  const warnings = [
    {
      id: 'low-stock',
      type: 'low-stock' as const,
      title: 'Stock bajo',
      description: '3 ingredientes con stock crítico',
      severity: 'high' as const,
      icon: <span>📦</span>,
    },
    {
      id: 'no-image',
      type: 'no-image' as const,
      title: 'Sin imagen',
      description: '5 recetas sin fotografía',
      severity: 'medium' as const,
      icon: <span>📷</span>,
    },
    {
      id: 'low-margin',
      type: 'low-margin' as const,
      title: 'Margen bajo',
      description: '2 recetas con margen < 20%',
      severity: 'medium' as const,
      icon: <span>📊</span>,
    },
    {
      id: 'no-recipe',
      type: 'no-recipe' as const,
      title: 'Sin receta',
      description: '1 producto sin receta asociada',
      severity: 'low' as const,
      icon: <span>🍸</span>,
    },
  ];

  const suggestions = [
    {
      id: 'create-variant',
      type: 'create-variant' as const,
      title: 'Crear variante',
      description: 'Margarita tiene potencial para variante sin alcohol',
      icon: <span>🔀</span>,
      actionLabel: 'Crear',
    },
    {
      id: 'update-cost',
      type: 'update-cost' as const,
      title: 'Actualizar costo',
      description: 'Costo de gin actualizado en inventario',
      icon: <span>💰</span>,
      actionLabel: 'Actualizar',
    },
    {
      id: 'add-decoration',
      type: 'add-decoration' as const,
      title: 'Agregar decoración',
      description: 'Old Fashioned podría usar twist de naranja',
      icon: <span>✨</span>,
      actionLabel: 'Agregar',
    },
    {
      id: 'optimize-recipe',
      type: 'optimize-recipe' as const,
      title: 'Optimizar receta',
      description: 'Mojito puede simplificar pasos de preparación',
      icon: <span>⚡</span>,
      actionLabel: 'Optimizar',
    },
  ];

  const activities = [
    {
      id: 'activity-1',
      type: 'recipe-created' as const,
      title: 'Nueva receta creada',
      description: 'Mojito Clásico agregada a la biblioteca',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      icon: <span>🍸</span>,
    },
    {
      id: 'activity-2',
      type: 'cost-updated' as const,
      title: 'Costo actualizado',
      description: 'Precio de gin actualizado en inventario',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      icon: <span>💰</span>,
    },
    {
      id: 'activity-3',
      type: 'ingredient-added' as const,
      title: 'Ingrediente agregado',
      description: 'Menta fresca añadida a inventario',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      icon: <span>🥗</span>,
    },
    {
      id: 'activity-4',
      type: 'variant-created' as const,
      title: 'Variante creada',
      description: 'Mojito Sin Alcohol creada desde Mojito Clásico',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      icon: <span>🔀</span>,
    },
    {
      id: 'activity-5',
      type: 'version-published' as const,
      title: 'Versión publicada',
      description: 'Margarita v2.0 publicada con nuevos ingredientes',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      icon: <span>📝</span>,
    },
  ];

  const hasRecipes = recipes.length > 0;

  return (
    <div className={styles.dashboard}>
      <StudioHeader
        onNewRecipe={() => onNavigate?.('builder')}
        onImport={() => {}}
        onSearch={() => {}}
      />

      <QuickActions actions={quickActions} />

      <div className={styles.dashboardLayout}>
        <StudioSidebar items={sidebarItems} activeItem={activeSection} />

        <div className={styles.dashboardContent}>
          {!hasRecipes ? (
            <EmptyState
              title="Tu estudio está listo"
              description="Comienza creando tu primera receta para empezar a construir tu colección gastronómica."
              actionLabel="Crear receta"
              onAction={() => onNavigate?.('builder')}
              illustration="recipes"
            />
          ) : (
            <>
              <RecipeStats stats={stats} />

              <div className={styles.dashboardGrid}>
                <div className={styles.mainColumn}>
                  <RecentRecipes
                    recipes={recipes.slice(0, 6)}
                    onRecipeClick={() => onNavigate?.('studio')}
                  />
                  <CollectionGrid
                    collections={collections.slice(0, 6)}
                    onCollectionClick={() => {}}
                  />
                </div>

                <div className={styles.sideColumn}>
                  <ActivityTimeline activities={activities} />
                  <WarningPanel warnings={warnings} onWarningClick={() => {}} />
                  <SuggestionPanel suggestions={suggestions} onSuggestionClick={() => {}} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

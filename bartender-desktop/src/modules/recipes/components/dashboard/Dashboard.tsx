import React, { useState, useEffect } from 'react';
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
import api from '../../../../services/api';

interface DashboardProps {
  recipes?: any[];
  collections?: any[];
  onNavigate?: (section: string) => void;
}

interface DashboardStats {
  stats: {
    totalRecipes: number;
    primaryRecipes: number;
    variantRecipes: number;
    drinkRecipes: number;
    foodRecipes: number;
    avgCost: number;
    avgMargin: number;
    categoryCounts: Record<string, number>;
  };
  recentActivity: {
    recentRecipesCount: number;
    recentRecipes: Array<{
      _id: string;
      name: string;
      createdAt: string;
      type: string;
    }>;
  };
  warnings: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    severity: string;
    count: number;
    items: any[];
  }>;
  suggestions: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    recipeId?: string;
    recipeName?: string;
  }>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  recipes = [],
  collections = [],
  onNavigate,
}) => {
  const [activeSection, setActiveSection] = React.useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar datos del backend
        const [statsResponse, warningsResponse, recentResponse, suggestionsResponse] = await Promise.all([
          api.get('/recipes/dashboard/stats'),
          api.get('/recipes/dashboard/warnings'),
          api.get('/recipes/dashboard/recent?limit=10'),
          api.get('/recipes/dashboard/suggestions'),
        ]);

        setDashboardData({
          stats: statsResponse, // El interceptor ya devuelve response.data
          warnings: warningsResponse,
          suggestions: suggestionsResponse,
          recentActivity: {
            recentRecipesCount: recentResponse.length,
            recentRecipes: recentResponse,
          },
        });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Error cargando datos del dashboard');
        // Usar datos de props como fallback
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Transformar datos del backend al formato esperado por los componentes
  const stats = dashboardData ? [
    {
      id: 'total-recipes',
      label: 'Total recetas',
      value: dashboardData.stats.totalRecipes,
      icon: <span>🍸</span>,
      trend: { value: 12, direction: 'up' as const },
      color: 'violet' as const,
    },
    {
      id: 'variants',
      label: 'Variantes',
      value: dashboardData.stats.variantRecipes,
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
      value: dashboardData.stats.categoryCounts ? Object.values(dashboardData.stats.categoryCounts).reduce((a, b) => a + b, 0) : 0,
      icon: <span>🥗</span>,
      trend: { value: 8, direction: 'up' as const },
      color: 'emerald' as const,
    },
    {
      id: 'avg-cost',
      label: 'Costo promedio',
      value: dashboardData.stats.avgCost != null ? `$${dashboardData.stats.avgCost.toFixed(2)}` : '$0.00',
      icon: <span>💰</span>,
      trend: { value: 3, direction: 'down' as const },
      color: 'amber' as const,
    },
    {
      id: 'avg-margin',
      label: 'Margen promedio',
      value: dashboardData.stats.avgMargin != null ? `${dashboardData.stats.avgMargin.toFixed(0)}%` : '0%',
      icon: <span>❤️</span>,
      trend: { value: 5, direction: 'up' as const },
      color: 'pink' as const,
    },
  ] : [];

  const warnings = dashboardData?.warnings || [];
  const recentRecipes = dashboardData?.recentActivity?.recentRecipes || [];

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

  const suggestions = dashboardData?.suggestions || [
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

  const activities = recentRecipes.map(recipe => ({
    id: recipe._id,
    type: 'recipe-created' as const,
    title: 'Nueva receta creada',
    description: `${recipe.name} agregada a la biblioteca`,
    timestamp: recipe.createdAt,
    icon: <span>🍸</span>,
  }));

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
              {stats.length > 0 ? (
                <RecipeStats stats={stats} />
              ) : (
                <div className={styles.emptyState}>No hay estadísticas disponibles</div>
              )}
              
              <div className={styles.dashboardGrid}>
                <div className={styles.mainColumn}>
                  {recentRecipes.length > 0 ? (
                    <RecentRecipes
                      recipes={recentRecipes.slice(0, 6)}
                      onRecipeClick={() => onNavigate?.('studio')}
                    />
                  ) : (
                    <div className={styles.emptyState}>No hay recetas recientes</div>
                  )}
                  
                  {collections.length > 0 ? (
                    <CollectionGrid
                      collections={collections.slice(0, 6)}
                      onCollectionClick={() => {}}
                    />
                  ) : (
                    <div className={styles.emptyState}>No hay colecciones</div>
                  )}
                </div>

                <div className={styles.sideColumn}>
                  <ActivityTimeline activities={recentRecipes.map(r => ({
                    id: r._id,
                    title: `Receta "${r.name}"`,
                    type: 'recipe_created',
                    date: r.createdAt,
                    description: `Nueva receta de tipo ${r.type}`,
                  }))} />
                  <WarningPanel warnings={warnings} onWarningClick={() => {}} />
                  <SuggestionPanel suggestions={[]} onSuggestionClick={() => {}} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

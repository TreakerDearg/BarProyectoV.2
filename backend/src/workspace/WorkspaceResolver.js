/**
 * WORKSPACE RESOLVER
 * Coordinador principal que resuelve el Workspace completo
 * Integra todos los resolvers para generar la experiencia dinámica
 */

import { createWorkspaceDefinition, PlatformType } from './types/WorkspaceDefinition.js';
import { resolveNavigation, resolveQuickActions } from './resolvers/NavigationResolver.js';
import { resolveDashboard, resolveLandingPage } from './resolvers/DashboardResolver.js';
import { resolveFeatures } from './resolvers/FeatureResolver.js';
import { resolveWidgets } from './resolvers/WidgetResolver.js';
import { resolveLayout, resolveDensity, resolvePanelSize } from './resolvers/LayoutResolver.js';

/**
 * Resuelve el Workspace completo basado en identidad del usuario
 * @param {Object} identityResponse - Respuesta de Bartender Identity
 * @param {Object} context - Contexto adicional (plataforma, configuración personal, etc.)
 * @returns {Object} Workspace Definition completo
 */
export const resolveWorkspace = (identityResponse, context = {}) => {
  const {
    user,
    role,
    permissions,
    identityStatus,
    shift,
  } = identityResponse;
  
  const {
    platform = PlatformType.WEB,
    customization = {},
    branchId = null,
  } = context;
  
  // 1. Resolver layout
  const layout = resolveLayout(platform, role);
  const density = resolveDensity(platform);
  const panelSize = resolvePanelSize(platform, role);
  
  // 2. Resolver navegación
  const navigation = resolveNavigation(role, permissions, platform);
  const quickActions = resolveQuickActions(role, permissions);
  
  // 3. Resolver dashboard y widgets
  const dashboard = resolveDashboard(role, permissions, shift);
  const widgets = dashboard.widgets;
  const landingPage = resolveLandingPage(role, identityStatus, shift);
  
  // 4. Resolver funcionalidades
  const features = resolveFeatures(role, permissions);
  
  // 5. Resolver tema (priorizar personalización)
  const theme = customization.theme || 'default';
  const language = customization.language || 'es';
  
  // 6. Crear Workspace Definition
  const workspace = createWorkspaceDefinition({
    userId: user.id,
    role,
    platform,
    
    // Layout
    layout: layout.type,
    layoutConfig: {
      ...layout.config,
      density,
      panelSize,
    },
    
    // Navegación
    navigation,
    
    // Widgets
    widgets,
    
    // Funcionalidades
    features,
    
    // Accesos rápidos
    shortcuts: quickActions,
    
    // Permisos
    permissions,
    
    // Tema
    theme,
    
    // Página inicial
    landingPage,
    
    // Configuración de personalización
    customization: {
      theme: customization.theme || null,
      language: customization.language || null,
      density: customization.density || null,
      panelSize: customization.panelSize || null,
      favoriteWidgets: customization.favoriteWidgets || [],
      customOrder: customization.customOrder || {},
    },
    
    // Metadata
    metadata: {
      identityStatus,
      shift,
      branchId,
      generatedAt: new Date().toISOString(),
    },
  });
  
  return workspace;
};

/**
 * Resuelve el Workspace para un usuario específico
 * @param {Object} user - Usuario del modelo User
 * @param {Object} context - Contexto adicional
 * @returns {Object} Workspace Definition
 */
export const resolveWorkspaceForUser = async (user, context = {}) => {
  // Importar executeIdentityDecision dinámicamente para evitar dependencia circular
  const { executeIdentityDecision } = await import('../identity/decision/IdentityDecisionEngine.js');
  
  // Ejecutar Identity Decision Engine
  const identityResponse = await executeIdentityDecision(user, context);
  
  // Resolver Workspace
  const workspace = resolveWorkspace(identityResponse, context);
  
  return workspace;
};

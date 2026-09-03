/**
 * Permission Utilities for Dashboard
 * Handles role-based and permission-based access control
 */

export type UserRole = 'admin' | 'bartender' | 'waiter' | 'cashier' | 'kitchen' | 'manager';

export interface UserPermissions {
  // Dashboard permissions
  canViewDashboard?: boolean;
  canViewSales?: boolean;
  canViewInventory?: boolean;
  canViewStaff?: boolean;
  canViewAnalytics?: boolean;
  
  // Operation permissions
  canCreateOrders?: boolean;
  canEditOrders?: boolean;
  canDeleteOrders?: boolean;
  canApplyDiscounts?: boolean;
  canManageReservations?: boolean;
  
  // Inventory permissions
  canViewInventory?: boolean;
  canEditInventory?: boolean;
  canManageStock?: boolean;
  
  // Staff permissions
  canViewStaff?: boolean;
  canManageStaff?: boolean;
  canViewAttendance?: boolean;
  canManageAttendance?: boolean;
}

export interface DashboardPermissions {
  canViewSalesData: boolean;
  canViewInventoryData: boolean;
  canViewStaffData: boolean;
  canViewDetailedAnalytics: boolean;
  canViewFinancialData: boolean;
  canViewCostData: boolean;
  canPerformActions: boolean;
}

/**
 * Default role-based permissions
 */
const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canViewDashboard: true,
    canViewSales: true,
    canViewInventory: true,
    canViewStaff: true,
    canViewAnalytics: true,
    canCreateOrders: true,
    canEditOrders: true,
    canDeleteOrders: true,
    canApplyDiscounts: true,
    canManageReservations: true,
    canEditInventory: true,
    canManageStock: true,
    canManageStaff: true,
    canViewAttendance: true,
    canManageAttendance: true,
  },
  manager: {
    canViewDashboard: true,
    canViewSales: true,
    canViewInventory: true,
    canViewStaff: true,
    canViewAnalytics: true,
    canCreateOrders: true,
    canEditOrders: true,
    canApplyDiscounts: true,
    canManageReservations: true,
    canEditInventory: true,
    canManageStock: true,
    canViewStaff: true,
    canViewAttendance: true,
  },
  bartender: {
    canViewDashboard: true,
    canViewSales: true,
    canViewInventory: true,
    canViewAnalytics: false,
    canCreateOrders: true,
    canEditOrders: true,
    canApplyDiscounts: false,
    canManageReservations: false,
    canViewInventory: true,
    canEditInventory: false,
    canManageStock: false,
    canViewStaff: false,
    canViewAttendance: false,
  },
  waiter: {
    canViewDashboard: true,
    canViewSales: false,
    canViewInventory: false,
    canViewStaff: false,
    canViewAnalytics: false,
    canCreateOrders: true,
    canEditOrders: true,
    canApplyDiscounts: false,
    canManageReservations: true,
    canViewInventory: false,
    canEditInventory: false,
    canManageStock: false,
    canViewStaff: false,
    canViewAttendance: false,
  },
  cashier: {
    canViewDashboard: true,
    canViewSales: true,
    canViewInventory: false,
    canViewStaff: false,
    canViewAnalytics: true,
    canCreateOrders: false,
    canEditOrders: false,
    canApplyDiscounts: true,
    canManageReservations: false,
    canViewInventory: false,
    canEditInventory: false,
    canManageStock: false,
    canViewStaff: false,
    canViewAttendance: false,
  },
  kitchen: {
    canViewDashboard: true,
    canViewSales: false,
    canViewInventory: true,
    canViewStaff: false,
    canViewAnalytics: false,
    canCreateOrders: false,
    canEditOrders: true,
    canApplyDiscounts: false,
    canManageReservations: false,
    canViewInventory: true,
    canEditInventory: false,
    canManageStock: false,
    canViewStaff: false,
    canViewAttendance: false,
  },
};

/**
 * Get user permissions from localStorage or use role defaults
 */
export function getUserPermissions(): UserPermissions {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return ROLE_PERMISSIONS.bartender; // Default fallback
    
    const user = JSON.parse(userStr);
    const role = user.role as UserRole;
    
    // Merge role permissions with custom permissions if available
    const rolePerms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.bartender;
    const customPerms = user.permissions || {};
    
    return { ...rolePerms, ...customPerms };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return ROLE_PERMISSIONS.bartender;
  }
}

/**
 * Get dashboard-specific permissions
 */
export function getDashboardPermissions(): DashboardPermissions {
  const perms = getUserPermissions();
  
  return {
    canViewSalesData: perms.canViewSales || false,
    canViewInventoryData: perms.canViewInventory || false,
    canViewStaffData: perms.canViewStaff || false,
    canViewDetailedAnalytics: perms.canViewAnalytics || false,
    canViewFinancialData: perms.canViewSales || false, // Sales implies financial access
    canViewCostData: perms.role === 'admin' || perms.role === 'manager', // Cost data restricted
    canPerformActions: perms.canCreateOrders || perms.canEditOrders || perms.canApplyDiscounts || false,
  };
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission: keyof UserPermissions): boolean {
  const perms = getUserPermissions();
  return perms[permission] === true;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(...permissions: (keyof UserPermissions)[]): boolean {
  const perms = getUserPermissions();
  return permissions.some(perm => perms[perm] === true);
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(...permissions: (keyof UserPermissions)[]): boolean {
  const perms = getUserPermissions();
  return permissions.every(perm => perms[perm] === true);
}

/**
 * Filter dashboard data based on permissions
 */
export function filterDashboardData<T extends Record<string, any>>(
  data: T,
  permissions: DashboardPermissions
): Partial<T> {
  const filtered: Partial<T> = { ...data };
  
  // Remove sales data if not permitted
  if (!permissions.canViewSalesData) {
    delete filtered.totalSales;
    delete filtered.salesData;
    delete filtered.hourlyData;
    delete filtered.discountsGiven;
    delete filtered.avgTicket;
    delete filtered.trends;
  }
  
  // Remove inventory data if not permitted
  if (!permissions.canViewInventoryData) {
    delete filtered.inventory;
    delete filtered.topProducts;
    delete filtered.topDrinks;
    delete filtered.topFoods;
  }
  
  // Remove staff data if not permitted
  if (!permissions.canViewStaffData) {
    // Staff data is typically loaded separately, but we filter any staff-related fields
    delete filtered.staff;
  }
  
  // Remove cost/financial data if not permitted
  if (!permissions.canViewFinancialData) {
    delete filtered.revenueByCategory;
    delete filtered.payments;
  }
  
  // Remove cost data specifically
  if (!permissions.canViewCostData) {
    // Remove any cost-related fields from products
    if (filtered.topProducts) {
      filtered.topProducts = filtered.topProducts.map((p: any) => ({
        ...p,
        cost: undefined,
        profit: undefined,
        margin: undefined,
      }));
    }
    if (filtered.topDrinks) {
      filtered.topDrinks = filtered.topDrinks.map((p: any) => ({
        ...p,
        cost: undefined,
        profit: undefined,
        margin: undefined,
      }));
    }
    if (filtered.topFoods) {
      filtered.topFoods = filtered.topFoods.map((p: any) => ({
        ...p,
        cost: undefined,
        profit: undefined,
        margin: undefined,
      }));
    }
  }
  
  return filtered;
}

/**
 * Get allowed dashboard tabs based on permissions
 */
export function getAllowedDashboardTabs(): ('operation' | 'analytics' | 'inventory')[] {
  const perms = getDashboardPermissions();
  const tabs: ('operation' | 'analytics' | 'inventory')[] = [];
  
  // Operation tab is always available for authenticated users
  tabs.push('operation');
  
  // Analytics tab requires sales or analytics permission
  if (perms.canViewSalesData || perms.canViewDetailedAnalytics) {
    tabs.push('analytics');
  }
  
  // Inventory tab requires inventory permission
  if (perms.canViewInventoryData) {
    tabs.push('inventory');
  }
  
  return tabs;
}

/**
 * Get allowed view modes based on permissions
 */
export function getAllowedViewModes(): ('simple' | 'medium' | 'advanced')[] {
  const perms = getDashboardPermissions();
  const modes: ('simple' | 'medium' | 'advanced')[] = ['simple'];
  
  // Medium mode requires basic permissions
  if (perms.canViewSalesData || perms.canViewInventoryData) {
    modes.push('medium');
  }
  
  // Advanced mode requires detailed analytics
  if (perms.canViewDetailedAnalytics && perms.canViewFinancialData) {
    modes.push('advanced');
  }
  
  return modes;
}
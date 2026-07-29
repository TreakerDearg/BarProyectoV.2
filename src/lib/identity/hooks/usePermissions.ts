/* =========================================================
   USE PERMISSIONS HOOK
   Hook personalizado para gestión de permisos
   Preparado para futura implementación
========================================================= */

import { useMemo } from 'react';
import type { IdentityUser } from '../types';

interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

/**
 * Hook personalizado para gestión de permisos
 */
export const usePermissions = (user: IdentityUser | null): UsePermissionsReturn => {
  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      if (!user || !user.permissions) return false;
      return user.permissions[permission] === true;
    };
  }, [user]);

  const hasAllPermissions = useMemo(() => {
    return (permissions: string[]): boolean => {
      return permissions.every(perm => hasPermission(perm));
    };
  }, [hasPermission]);

  const hasAnyPermission = useMemo(() => {
    return (permissions: string[]): boolean => {
      return permissions.some(perm => hasPermission(perm));
    };
  }, [hasPermission]);

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  };
};

/* =========================================================
   IDENTITY USER STRUCTURE
   Representación unificada de usuario desacoplada del modelo
   Compartido entre frontend y backend
========================================================= */

import { IdentityStatus } from './IdentityStatus';
import { IdentityRole } from './IdentityRole';

/**
 * Horario de usuario (para empleados)
 */
export interface UserSchedule {
  [day: string]: {
    available: boolean;
    startTime: string;
    endTime: string;
    breaks: Array<{
      startTime: string;
      endTime: string;
    }>;
  };
}

/**
 * Asistencia de usuario (para empleados)
 */
export interface UserAttendance {
  currentStatus: 'checked-in' | 'checked-out' | 'break' | 'absent';
  lastCheckIn: Date | null;
  totalMinutesWorked: number;
  leaveBalance: number;
}

/**
 * Metadatos de usuario
 */
export interface UserMetadata {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Usuario de identidad completo
 */
export interface IdentityUser {
  // Identificación básica
  id: string;
  name: string;
  email: string;

  // Rol y estado
  role: string;
  roleLabel: string;
  status: IdentityStatus;
  isEmployee: boolean;

  // Turno (para empleados)
  shift: string | null;

  // Estado de cuenta
  isActive: boolean;
  isLocked: boolean;
  lockedUntil: Date | null;

  // Permisos
  permissions: Record<string, boolean>;

  // Seguridad
  lastLogin: Date | null;
  loginAttempts: number;

  // Horario (para empleados)
  schedule: UserSchedule | null;

  // Asistencia (para empleados)
  attendance: UserAttendance | null;

  // Metadatos
  metadata: UserMetadata;
}

/**
 * Verifica si un usuario puede hacer login
 */
export const canUserLogin = (user: IdentityUser): boolean => {
  if (!user) return false;
  if (!user.isActive) return false;
  if (user.isLocked) return false;
  return true;
};

/**
 * Obtiene el mensaje de bloqueo de un usuario
 */
export const getLockMessage = (user: IdentityUser): string | null => {
  if (!user || !user.isLocked) return null;

  if (user.lockedUntil) {
    const minutesLeft = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
    return `Cuenta bloqueada. Intenta en ${minutesLeft} minuto(s)`;
  }

  return 'Cuenta bloqueada';
};

/**
 * Verifica si un usuario está en turno
 */
export const isUserOnShift = (user: IdentityUser): boolean => {
  if (!user || !user.isEmployee) return false;
  return user.status === IdentityStatus.EMPLOYEE_WORKING;
};

/**
 * Verifica si un usuario está fuera de turno
 */
export const isUserOffShift = (user: IdentityUser): boolean => {
  if (!user || !user.isEmployee) return false;
  return user.status === IdentityStatus.EMPLOYEE_OFF_SHIFT;
};

/**
 * Verifica si un usuario está en descanso
 */
export const isUserOnBreak = (user: IdentityUser): boolean => {
  if (!user || !user.isEmployee) return false;
  return user.status === IdentityStatus.EMPLOYEE_BREAK;
};

/**
 * SHIFT RESOLVER
 * Analiza y determina el estado laboral del empleado basado en:
 * - Horario programado (schedule)
 * - Asistencia actual (attendance)
 * - Turno asignado (shift assignment)
 * - Fecha y hora actual
 */

/**
 * Obtiene el día de la semana actual en formato lowercase
 * @returns {string} Día de la semana (monday, tuesday, etc.)
 */
const getCurrentDayName = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
};

/**
 * Convierte una hora en formato "HH:MM" a minutos desde medianoche
 * @param {string} timeStr - Hora en formato "HH:MM"
 * @returns {number} Minutos desde medianoche
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Obtiene la hora actual en minutos desde medianoche
 * @returns {number} Minutos desde medianoche
 */
const getCurrentTimeMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

/**
 * Verifica si el empleado está programado para trabajar hoy
 * @param {Object} user - Usuario del modelo User
 * @returns {boolean}
 */
const isScheduledToday = (user) => {
  const dayName = getCurrentDayName();
  const schedule = user.schedule?.[dayName];
  return schedule?.isAvailable || false;
};

/**
 * Obtiene el horario programado para hoy
 * @param {Object} user - Usuario del modelo User
 * @returns {Object|null} Horario del día o null
 */
const getTodaySchedule = (user) => {
  const dayName = getCurrentDayName();
  return user.schedule?.[dayName] || null;
};

/**
 * Verifica si la hora actual está dentro del horario programado
 * @param {Object} schedule - Horario del día
 * @returns {boolean}
 */
const isWithinSchedule = (schedule) => {
  if (!schedule) return false;
  
  const currentMinutes = getCurrentTimeMinutes();
  const startMinutes = timeToMinutes(schedule.startTime);
  const endMinutes = timeToMinutes(schedule.endTime);
  
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

/**
 * Verifica si el empleado está en descanso (break)
 * @param {Object} schedule - Horario del día
 * @returns {boolean}
 */
const isWithinBreak = (schedule) => {
  if (!schedule || !schedule.breakStart || !schedule.breakEnd) return false;
  
  const currentMinutes = getCurrentTimeMinutes();
  const breakStartMinutes = timeToMinutes(schedule.breakStart);
  const breakEndMinutes = timeToMinutes(schedule.breakEnd);
  
  return currentMinutes >= breakStartMinutes && currentMinutes <= breakEndMinutes;
};

/**
 * Verifica si el empleado está tarde para su turno
 * @param {Object} schedule - Horario del día
 * @returns {boolean}
 */
const isLate = (schedule) => {
  if (!schedule) return false;
  
  const currentMinutes = getCurrentTimeMinutes();
  const startMinutes = timeToMinutes(schedule.startTime);
  
  // Considerar tarde si está más de 15 minutos después del inicio
  return currentMinutes > startMinutes + 15;
};

/**
 * Calcula el tiempo restante hasta el inicio del turno
 * @param {Object} schedule - Horario del día
 * @returns {number|null} Minutos restantes o null si no está programado
 */
const getMinutesUntilShift = (schedule) => {
  if (!schedule) return null;
  
  const currentMinutes = getCurrentTimeMinutes();
  const startMinutes = timeToMinutes(schedule.startTime);
  
  const diff = startMinutes - currentMinutes;
  return diff > 0 ? diff : null;
};

/**
 * Calcula el tiempo restante hasta el fin del turno
 * @param {Object} schedule - Horario del día
 * @returns {number|null} Minutos restantes o null si no está programado
 */
const getMinutesUntilShiftEnd = (schedule) => {
  if (!schedule) return null;
  
  const currentMinutes = getCurrentTimeMinutes();
  const endMinutes = timeToMinutes(schedule.endTime);
  
  const diff = endMinutes - currentMinutes;
  return diff > 0 ? diff : null;
};

/**
 * Resuelve la información del turno del empleado
 * @param {Object} user - Usuario del modelo User
 * @returns {Object} Información del turno
 */
export const resolveShift = (user) => {
  // Si no es empleado, no tiene turno
  if (!user.isEmployee || user.role === 'client') {
    return {
      active: false,
      scheduled: false,
      withinSchedule: false,
      onBreak: false,
      isLate: false,
      startsAt: null,
      endsAt: null,
      minutesUntilStart: null,
      minutesUntilEnd: null,
      message: 'No es empleado'
    };
  }

  const schedule = getTodaySchedule(user);
  const scheduled = isScheduledToday(user);
  const withinSchedule = isWithinSchedule(schedule);
  const onBreak = isWithinBreak(schedule);
  const late = isLate(schedule);
  const minutesUntilStart = getMinutesUntilShift(schedule);
  const minutesUntilEnd = getMinutesUntilShiftEnd(schedule);

  // Determinar si el turno está activo basado en asistencia y horario
  const attendanceStatus = user.attendance?.currentStatus;
  const hasActiveShift = attendanceStatus === 'checked-in' && withinSchedule;

  return {
    active: hasActiveShift,
    scheduled,
    withinSchedule,
    onBreak,
    isLate: late,
    startsAt: schedule?.startTime || null,
    endsAt: schedule?.endTime || null,
    breakStart: schedule?.breakStart || null,
    breakEnd: schedule?.breakEnd || null,
    minutesUntilStart,
    minutesUntilEnd,
    attendanceStatus: attendanceStatus || 'checked-out',
    message: getShiftMessage(scheduled, withinSchedule, onBreak, late, minutesUntilStart, schedule)
  };
};

/**
 * Genera un mensaje descriptivo del estado del turno
 * @param {boolean} scheduled - Está programado
 * @param {boolean} withinSchedule - Está dentro del horario
 * @param {boolean} onBreak - Está en descanso
 * @param {boolean} isLate - Está tarde
 * @param {number|null} minutesUntilStart - Minutos hasta inicio
 * @param {Object} schedule - Horario del día
 * @returns {string} Mensaje descriptivo
 */
const getShiftMessage = (scheduled, withinSchedule, onBreak, isLate, minutesUntilStart, schedule) => {
  if (!scheduled) {
    return 'No tienes turno programado para hoy';
  }

  if (onBreak) {
    return 'Estás en descanso';
  }

  if (isLate) {
    return 'Llegaste tarde a tu turno';
  }

  if (withinSchedule) {
    return 'Tu turno está activo';
  }

  if (minutesUntilStart !== null) {
    const hours = Math.floor(minutesUntilStart / 60);
    const minutes = minutesUntilStart % 60;
    if (hours > 0) {
      return `Tu turno comienza en ${hours}h ${minutes}min`;
    }
    return `Tu turno comienza en ${minutes} minutos`;
  }

  return 'Tu turno ha finalizado';
};

/**
 * Verifica si el empleado puede acceder al sistema Desktop
 * @param {Object} user - Usuario del modelo User
 * @returns {boolean}
 */
export const canAccessDesktop = (user) => {
  if (!user.isEmployee || user.role === 'client') {
    return false;
  }

  const shiftInfo = resolveShift(user);
  return shiftInfo.active;
};

/**
 * Obtiene el mensaje para mostrar al empleado cuando no puede acceder
 * @param {Object} user - Usuario del modelo User
 * @returns {Object} Mensaje y datos adicionales
 */
export const getDesktopAccessMessage = (user) => {
  const shiftInfo = resolveShift(user);
  
  if (!user.isEmployee || user.role === 'client') {
    return {
      title: 'Acceso no autorizado',
      message: 'Solo los empleados pueden acceder al sistema Desktop',
      canAccess: false
    };
  }

  if (!shiftInfo.scheduled) {
    return {
      title: 'Sin turno programado',
      message: 'No tienes un turno programado para hoy. Contacta a tu supervisor.',
      canAccess: false
    };
  }

  if (shiftInfo.minutesUntilStart !== null) {
    const hours = Math.floor(shiftInfo.minutesUntilStart / 60);
    const minutes = shiftInfo.minutesUntilStart % 60;
    const timeStr = hours > 0 ? `${hours}h ${minutes}min` : `${minutes} minutos`;
    
    return {
      title: 'Turno aún no iniciado',
      message: `Hola ${user.name}. Tu jornada comienza hoy a las ${shiftInfo.startsAt}. Actualmente no tienes un turno activo. Tu turno inicia en ${timeStr}.`,
      shiftStart: shiftInfo.startsAt,
      minutesUntilStart: shiftInfo.minutesUntilStart,
      canAccess: false
    };
  }

  if (shiftInfo.onBreak) {
    return {
      title: 'En descanso',
      message: `Hola ${user.name}. Estás en descanso. Tu turno continúa a las ${shiftInfo.breakEnd}.`,
      breakEnd: shiftInfo.breakEnd,
      canAccess: false
    };
  }

  return {
    title: 'Turno finalizado',
    message: `Hola ${user.name}. Tu jornada ha finalizado. Tu turno terminó a las ${shiftInfo.endsAt}.`,
    shiftEnd: shiftInfo.endsAt,
    canAccess: false
  };
};


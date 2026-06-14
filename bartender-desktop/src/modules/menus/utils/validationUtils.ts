/* =========================================================
   VALIDATION UTILITIES
   Common validation functions for menu system
========================================================= */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate image file for upload
 */
export const validateImageFile = (file: File): ValidationResult => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Solo se permiten archivos de imagen' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'El archivo no debe exceder 5MB' };
  }

  // Check file size (min 1KB)
  if (file.size < 1024) {
    return { isValid: false, error: 'El archivo es demasiado pequeño' };
  }

  return { isValid: true };
};

/**
 * Validate menu name
 */
export const validateMenuName = (name: string): ValidationResult => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'El nombre es obligatorio' };
  }

  if (name.trim().length < 3) {
    return { isValid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }

  if (name.trim().length > 100) {
    return { isValid: false, error: 'El nombre no debe exceder 100 caracteres' };
  }

  return { isValid: true };
};

/**
 * Validate menu slug
 */
export const validateMenuSlug = (slug: string): ValidationResult => {
  if (!slug || !slug.trim()) {
    return { isValid: false, error: 'El slug es obligatorio' };
  }

  // Check for valid slug format (lowercase, alphanumeric, hyphens)
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return { isValid: false, error: 'El slug solo puede contener letras minúsculas, números y guiones' };
  }

  if (slug.length < 3) {
    return { isValid: false, error: 'El slug debe tener al menos 3 caracteres' };
  }

  if (slug.length > 100) {
    return { isValid: false, error: 'El slug no debe exceder 100 caracteres' };
  }

  return { isValid: true };
};

/**
 * Validate menu categories
 */
export const validateMenuCategories = (categories: any[]): ValidationResult => {
  if (!categories || !Array.isArray(categories)) {
    return { isValid: false, error: 'Las categorías deben ser un array' };
  }

  if (categories.length === 0) {
    return { isValid: false, error: 'Debe haber al menos una categoría' };
  }

  for (const category of categories) {
    if (!category.name || !category.name.trim()) {
      return { isValid: false, error: 'Cada categoría debe tener un nombre' };
    }

    if (!category.products || !Array.isArray(category.products)) {
      return { isValid: false, error: 'Cada categoría debe tener productos' };
    }

    if (category.products.length === 0) {
      return { isValid: false, error: 'Cada categoría debe tener al menos un producto' };
    }
  }

  return { isValid: true };
};

/**
 * Validate menu availability hours
 */
export const validateAvailabilityHours = (hours: { start: string; end: string } | null): ValidationResult => {
  if (!hours) {
    return { isValid: true }; // Optional field
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

  if (!timeRegex.test(hours.start)) {
    return { isValid: false, error: 'Hora de inicio inválida (formato HH:MM)' };
  }

  if (!timeRegex.test(hours.end)) {
    return { isValid: false, error: 'Hora de fin inválida (formato HH:MM)' };
  }

  const startMinutes = parseInt(hours.start.split(':')[0]) * 60 + parseInt(hours.start.split(':')[1]);
  const endMinutes = parseInt(hours.end.split(':')[0]) * 60 + parseInt(hours.end.split(':')[1]);

  if (startMinutes >= endMinutes) {
    return { isValid: false, error: 'La hora de inicio debe ser anterior a la hora de fin' };
  }

  return { isValid: true };
};

/**
 * Generate slug from name
 */
export const generateSlug = (name: string): string => {
  return name
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '') || '';
};

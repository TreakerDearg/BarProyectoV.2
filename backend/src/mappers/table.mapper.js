/**
 * Table Mapper - Transforma MongoDB models a Public DTOs
 * Sigue el patrón establecido en recipe.dto.js
 */

import Table from "../models/Table.js";

/**
 * TablePublicDTO - Contrato público para mesas
 * Transforma _id → id y expone solo campos necesarios para el cliente
 */
export function toTablePublicDTO(table) {
  if (!table) return null;

  return {
    id: table._id?.toString() || "",
    number: table.number || 0,
    capacity: table.capacity || 0,
    location: table.location || "indoor",
    status: table.status || "available",
    currentSessionId: table.currentSessionId || null,
    x: table.x || 0,
    y: table.y || 0,
    width: table.width || 120,
    height: table.height || 120,
    shape: table.shape || "square",
  };
}

/**
 * TableListPublicDTO - Para listas de mesas (optimizado)
 */
export function toTableListPublicDTO(tables) {
  if (!Array.isArray(tables)) return [];
  
  return tables.map(table => toTablePublicDTO(table)).filter(Boolean);
}

import { useState, useEffect } from 'react';
import { getInventory } from '../../inventory/services/inventoryService';
import type { InventoryItem } from '../../inventory/types/inventory';

/**
 * Hook para integración con Inventario
 * Centraliza la carga de datos del inventario para recetas
 * Preparado para sincronización real-time en fases posteriores
 */
export function useInventoryIntegration() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventory();
      setInventoryItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar inventario');
      console.error('[useInventoryIntegration] Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return {
    inventoryItems,
    loading,
    error,
    loadInventory,
  };
}

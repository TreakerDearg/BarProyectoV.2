import { useState, useEffect } from 'react';
import { getProducts } from '../../products/services/productService';
import type { Product } from '../../../types/product';

/**
 * Hook para integración con Productos
 * Centraliza la carga de datos de productos para recetas
 * Preparado para sincronización automática en fases posteriores
 */
export function useProductIntegration() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar productos');
      console.error('[useProductIntegration] Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    error,
    loadProducts,
  };
}

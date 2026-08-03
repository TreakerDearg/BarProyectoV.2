import { useMemo } from 'react';
import type { IngredientAnalysis } from '../../types';

interface SmartIngredientAnalyzerProps {
  ingredientId: string;
  ingredientName: string;
  inventoryItems: any[];
  allRecipes: any[];
}

/**
 * SmartIngredientAnalyzer - Panel tipo Lightroom para ingredientes
 * Muestra imagen, proveedor, stock, costo, recetas que lo usan, popularidad
 * Reutiliza únicamente datos del inventario y estadísticas existentes
 */
export function SmartIngredientAnalyzer({ ingredientId, ingredientName, inventoryItems, allRecipes }: SmartIngredientAnalyzerProps) {
  const analysis = useMemo<IngredientAnalysis>(() => {
    const inventoryItem = inventoryItems.find(item => item._id === ingredientId);
    
    if (!inventoryItem) {
      return {
        ingredientId,
        name: ingredientName,
        usedByRecipes: 0,
        averageCost: 0,
        stock: 0,
        stockStatus: 'critical',
        supplier: 'N/A',
        popularity: 'low',
        category: 'Desconocido',
      };
    }

    // Calcular recetas que usan este ingrediente
    const usedByRecipes = allRecipes.filter(recipe => 
      recipe.ingredients?.some((ing: any) => ing.inventoryItem._id === ingredientId)
    ).length;

    // Calcular costo promedio
    const averageCost = inventoryItem.cost || 0;

    // Determinar estado de stock
    const stock = inventoryItem.stock || 0;
    let stockStatus: 'normal' | 'low' | 'critical' = 'normal';
    if (stock < 5) stockStatus = 'critical';
    else if (stock < 10) stockStatus = 'low';

    // Determinar popularidad
    let popularity: 'low' | 'medium' | 'high' = 'low';
    if (usedByRecipes > 10) popularity = 'high';
    else if (usedByRecipes > 5) popularity = 'medium';

    return {
      ingredientId,
      name: ingredientName,
      usedByRecipes,
      averageCost,
      stock,
      stockStatus,
      supplier: inventoryItem.supplier || 'N/A',
      popularity,
      category: inventoryItem.category || 'Desconocido',
    };
  }, [ingredientId, ingredientName, inventoryItems, allRecipes]);

  const getStockStatusColor = (status: string): string => {
    switch (status) {
      case 'normal': return 'success';
      case 'low': return 'warning';
      case 'critical': return 'danger';
      default: return 'info';
    }
  };

  const getPopularityIcon = (popularity: string): string => {
    switch (popularity) {
      case 'high': return '⭐⭐⭐';
      case 'medium': return '⭐⭐';
      case 'low': return '⭐';
      default: return '⭐';
    }
  };

  return (
    <div className="smart-ingredient-analyzer">
      <div className="analyzer-header">
        <h3 className="analyzer-title">{analysis.name}</h3>
        <span className={`analyzer-stock-status ${getStockStatusColor(analysis.stockStatus)}`}>
          {analysis.stockStatus === 'normal' && '✓ Stock Normal'}
          {analysis.stockStatus === 'low' && '⚠ Stock Bajo'}
          {analysis.stockStatus === 'critical' && '✗ Stock Crítico'}
        </span>
      </div>

      <div className="analyzer-grid">
        <AnalyzerItem label="Proveedor" value={analysis.supplier} icon="🏢" />
        <AnalyzerItem label="Stock" value={analysis.stock} icon="📦" />
        <AnalyzerItem label="Costo" value={`$${analysis.averageCost.toFixed(2)}`} icon="💰" />
        <AnalyzerItem label="Categoría" value={analysis.category} icon="🏷️" />
        <AnalyzerItem label="Usado por" value={`${analysis.usedByRecipes} recetas`} icon="📋" />
        <AnalyzerItem label="Popularidad" value={getPopularityIcon(analysis.popularity)} icon="⭐" />
      </div>

      <div className="analyzer-usage">
        <h4 className="usage-title">Gráfico de Utilización</h4>
        <div className="usage-bar">
          <div
            className="usage-fill"
            style={{ width: `${Math.min(analysis.usedByRecipes * 5, 100)}%` }}
          />
        </div>
        <span className="usage-label">{analysis.usedByRecipes} recetas</span>
      </div>

      {analysis.stockStatus !== 'normal' && (
        <div className="analyzer-alert">
          <span className="alert-icon">⚠️</span>
          <span className="alert-message">
            {analysis.stockStatus === 'critical' 
              ? 'Stock crítico: Considera reponer urgentemente' 
              : 'Stock bajo: Considera reponer pronto'}
          </span>
        </div>
      )}
    </div>
  );
}

function AnalyzerItem({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="analyzer-item">
      <span className="analyzer-item-icon">{icon}</span>
      <div className="analyzer-item-info">
        <span className="analyzer-item-label">{label}</span>
        <span className="analyzer-item-value">{value}</span>
      </div>
    </div>
  );
}

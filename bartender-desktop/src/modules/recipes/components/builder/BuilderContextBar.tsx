import { memo } from 'react';
import { Save, Link, CheckCircle, AlertTriangle, DollarSign, Clock, Package, FileText, Calendar, Plus, Minus, RotateCcw } from 'lucide-react';
import type { Recipe } from '../../types';
import styles from './BuilderContextBar.module.css';

interface BuilderContextBarProps {
  recipe: Recipe;
  totalCost?: number;
  isAvailable?: boolean;
  lastModified?: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  zoom?: number;
}

/**
 * BuilderContextBar - Barra inferior de contexto
 * Autosave, estado conexión, costo, tiempo, zoom
 */
export const BuilderContextBar = memo(function BuilderContextBar({
  recipe,
  totalCost = 0,
  isAvailable = true,
  lastModified,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoom = 100,
}: BuilderContextBarProps) {
  const preparationTime = recipe.preparationTime || 0;
  const ingredientCount = recipe.ingredients.length;
  const stepCount = recipe.steps?.length || 0;

  return (
    <div className={styles.contextBar}>
      {/* Left Section - Status */}
      <div className={styles.contextLeft}>
        <div className={styles.statusItem}>
          <Save size={16} className={`${styles.statusIcon} ${styles.autosave}`} />
          <span className={styles.statusLabel}>Autosave</span>
          <span className={styles.statusValue}>Activo</span>
        </div>
        <div className={styles.statusItem}>
          <Link size={16} className={`${styles.statusIcon} ${styles.connection}`} />
          <span className={styles.statusLabel}>Conexión</span>
          <span className={`${styles.statusValue} ${styles.online}`}>Online</span>
        </div>
        <div className={styles.statusItem}>
          {isAvailable ? <CheckCircle size={16} className={`${styles.statusIcon} ${styles.availability}`} /> : <AlertTriangle size={16} className={`${styles.statusIcon} ${styles.availability}`} />}
          <span className={styles.statusLabel}>Disponibilidad</span>
          <span className={`${styles.statusValue} ${isAvailable ? styles.available : styles.unavailable}`}>
            {isAvailable ? 'OK' : 'Faltan ingredientes'}
          </span>
        </div>
      </div>

      {/* Center Section - Metrics */}
      <div className={styles.contextCenter}>
        <div className={styles.metricItem}>
          <DollarSign size={14} className={styles.metricIcon} />
          <span className={styles.metricLabel}>Costo</span>
          <span className={styles.metricValue}>${(totalCost || 0).toFixed(2)}</span>
        </div>
        <div className={styles.metricItem}>
          <Clock size={14} className={styles.metricIcon} />
          <span className={styles.metricLabel}>Tiempo</span>
          <span className={styles.metricValue}>{preparationTime} min</span>
        </div>
        <div className={styles.metricItem}>
          <Package size={14} className={styles.metricIcon} />
          <span className={styles.metricLabel}>Ingredientes</span>
          <span className={styles.metricValue}>{ingredientCount}</span>
        </div>
        <div className={styles.metricItem}>
          <FileText size={14} className={styles.metricIcon} />
          <span className={styles.metricLabel}>Pasos</span>
          <span className={styles.metricValue}>{stepCount}</span>
        </div>
        <div className={styles.metricItem}>
          <Calendar size={14} className={styles.metricIcon} />
          <span className={styles.metricLabel}>Última modificación</span>
          <span className={styles.metricValue}>{lastModified || 'Ahora'}</span>
        </div>
      </div>

      {/* Right Section - Zoom */}
      <div className={styles.contextRight}>
        <div className={styles.zoomControl}>
          <button className={styles.zoomBtn} onClick={onZoomOut}>
            <Minus size={16} />
          </button>
          <span className={styles.zoomValue}>{zoom}%</span>
          <button className={styles.zoomBtn} onClick={onZoomIn}>
            <Plus size={16} />
          </button>
          <button className={styles.zoomBtn} onClick={onZoomReset}>
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

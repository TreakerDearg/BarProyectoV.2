import { Check, X, Plus, Minus, Edit2, ArrowRight } from 'lucide-react';
import styles from './DiffViewer.module.css';

export type DiffType = 'inherited' | 'modified' | 'added' | 'removed';

export interface DiffItem {
  type: DiffType;
  field: string;
  valueA?: any;
  valueB?: any;
  label: string;
}

interface DiffViewerProps {
  diffs: DiffItem[];
  showLabels?: boolean;
}

/**
 * DiffViewer - Visualización de diferencias con colores Nebula
 * Heredado (Azul), Modificado (Cyan), Nuevo (Verde), Eliminado (Rojo)
 */
export function DiffViewer({ diffs, showLabels = true }: DiffViewerProps) {
  if (diffs.length === 0) {
    return (
      <div className={styles.emptyDiff}>
        <Check className={styles.emptyIcon} />
        <span>No differences - All inherited</span>
      </div>
    );
  }

  return (
    <div className={styles.diffViewer}>
      {showLabels && (
        <div className={styles.diffLegend}>
          <DiffLegendItem type="inherited" label="Inherited" />
          <DiffLegendItem type="modified" label="Modified" />
          <DiffLegendItem type="added" label="Added" />
          <DiffLegendItem type="removed" label="Removed" />
        </div>
      )}
      <div className={styles.diffList}>
        {diffs.map((diff, idx) => (
          <DiffRow key={idx} diff={diff} />
        ))}
      </div>
    </div>
  );
}

function DiffRow({ diff }: { diff: DiffItem }) {
  return (
    <div className={`${styles.diffRow} ${styles[diff.type]}`}>
      <div className={styles.diffIcon}>
        {diff.type === 'inherited' && <Check />}
        {diff.type === 'modified' && <Edit2 />}
        {diff.type === 'added' && <Plus />}
        {diff.type === 'removed' && <Minus />}
      </div>
      <div className={styles.diffContent}>
        <span className={styles.diffLabel}>{diff.label}</span>
        <div className={styles.diffValues}>
          {diff.type === 'modified' && (
            <>
              <span className={styles.diffValueA}>{formatValue(diff.valueA)}</span>
              <ArrowRight className={styles.diffArrow} />
              <span className={styles.diffValueB}>{formatValue(diff.valueB)}</span>
            </>
          )}
          {diff.type === 'added' && (
            <span className={styles.diffValueB}>{formatValue(diff.valueB)}</span>
          )}
          {diff.type === 'removed' && (
            <span className={styles.diffValueA}>{formatValue(diff.valueA)}</span>
          )}
          {diff.type === 'inherited' && (
            <span className={styles.diffValueInherited}>{formatValue(diff.valueA)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function DiffLegendItem({ type, label }: { type: DiffType; label: string }) {
  return (
    <div className={`${styles.legendItem} ${styles[type]}`}>
      <div className={styles.legendDot} />
      <span>{label}</span>
    </div>
  );
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * DiffBadge - Badge pequeño para mostrar estado de un campo
 */
export function DiffBadge({ type, count }: { type: DiffType; count?: number }) {
  return (
    <div className={`${styles.diffBadge} ${styles[type]}`}>
      {type === 'inherited' && <Check className={styles.badgeIcon} />}
      {type === 'modified' && <Edit2 className={styles.badgeIcon} />}
      {type === 'added' && <Plus className={styles.badgeIcon} />}
      {type === 'removed' && <Minus className={styles.badgeIcon} />}
      {count !== undefined && <span className={styles.badgeCount}>{count}</span>}
    </div>
  );
}

/**
 * DiffInline - Para mostrar diferencias inline en texto
 */
export function DiffInline({ type, children }: { type: DiffType; children: React.ReactNode }) {
  return (
    <span className={`${styles.diffInline} ${styles[type]}`}>
      {children}
    </span>
  );
}

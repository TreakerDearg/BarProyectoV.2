import { memo } from 'react';
import { Wine, Sparkles, Snowflake, Target } from 'lucide-react';
import type { Recipe } from '../../types';
import styles from './PresentationSection.module.css';

interface PresentationSectionProps {
  recipe: Recipe;
  onUpdate?: (field: string, value: any) => void;
}

/**
 * PresentationSection - 4 cards para presentación
 * Cristalería, Decoración, Hielo, Técnica Final
 */
export const PresentationSection = memo(function PresentationSection({
  recipe,
  onUpdate,
}: PresentationSectionProps) {
  const glassware = recipe.glassware || 'Vaso estándar';
  const decoration = recipe.decoration || 'Sin decoración';
  const ice = recipe.ice || 'Sin hielo';
  const finalTechnique = recipe.finalTechnique || 'N/A';

  return (
    <div className={styles.presentationSection}>
      <h3 className={styles.sectionTitle}>Presentación</h3>
      <div className={styles.presentationGrid}>
        {/* Glassware Card */}
        <div className={styles.presentationCard}>
          <div className={styles.cardIcon}>
            <Wine size={24} />
          </div>
          <div className={styles.cardContent}>
            <h4 className={styles.cardTitle}>Cristalería</h4>
            <p className={styles.cardDescription}>{glassware}</p>
            <div className={styles.cardPreview}>
              <span className={styles.previewLabel}>Preview</span>
              <div className={styles.previewPlaceholder}><Wine size={32} /></div>
            </div>
          </div>
        </div>

        {/* Decoration Card */}
        <div className={styles.presentationCard}>
          <div className={styles.cardIcon}>
            <Sparkles size={24} />
          </div>
          <div className={styles.cardContent}>
            <h4 className={styles.cardTitle}>Decoración</h4>
            <p className={styles.cardDescription}>{decoration}</p>
            <div className={styles.cardPreview}>
              <span className={styles.previewLabel}>Preview</span>
              <div className={styles.previewPlaceholder}><Sparkles size={32} /></div>
            </div>
          </div>
        </div>

        {/* Ice Card */}
        <div className={styles.presentationCard}>
          <div className={styles.cardIcon}>
            <Snowflake size={24} />
          </div>
          <div className={styles.cardContent}>
            <h4 className={styles.cardTitle}>Hielo</h4>
            <p className={styles.cardDescription}>{ice}</p>
            <div className={styles.cardPreview}>
              <span className={styles.previewLabel}>Preview</span>
              <div className={styles.previewPlaceholder}><Snowflake size={32} /></div>
            </div>
          </div>
        </div>

        {/* Final Technique Card */}
        <div className={styles.presentationCard}>
          <div className={styles.cardIcon}>
            <Target size={24} />
          </div>
          <div className={styles.cardContent}>
            <h4 className={styles.cardTitle}>Técnica Final</h4>
            <p className={styles.cardDescription}>{finalTechnique}</p>
            <div className={styles.cardPreview}>
              <span className={styles.previewLabel}>Preview</span>
              <div className={styles.previewPlaceholder}><Target size={32} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

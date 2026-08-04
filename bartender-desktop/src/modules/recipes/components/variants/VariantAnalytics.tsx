import { DollarSign, TrendingUp, Clock, BarChart3, Activity, Users, ShoppingCart, Target } from 'lucide-react';
import styles from './VariantAnalytics.module.css';

interface AnalyticsMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  icon: any;
  sparkline?: number[];
}

interface VariantAnalyticsProps {
  variant?: any;
}

/**
 * VariantAnalytics - Small charts for variant analytics
 * Cost, Margin, Time, Popularity, Sales, Production
 */
export function VariantAnalytics({ variant }: VariantAnalyticsProps) {
  const metrics: AnalyticsMetric[] = [
    {
      label: 'Cost',
      value: variant?.totalCost ? `$${variant.totalCost.toFixed(2)}` : '$0.00',
      trend: 'neutral',
      icon: DollarSign,
      sparkline: [4.5, 4.2, 4.8, 5.1, 4.9, 5.2, 5.0],
    },
    {
      label: 'Margin',
      value: `${variant?.margin || 0}%`,
      trend: 'up',
      icon: TrendingUp,
      sparkline: [65, 68, 72, 70, 75, 78, 80],
    },
    {
      label: 'Prep Time',
      value: `${variant?.prepTime || 5}m`,
      trend: 'neutral',
      icon: Clock,
    },
    {
      label: 'Popularity',
      value: variant?.popularity || 0,
      trend: 'up',
      icon: Activity,
      sparkline: [45, 52, 48, 60, 58, 72, 85],
    },
    {
      label: 'Sales',
      value: variant?.sales || 0,
      trend: 'up',
      icon: ShoppingCart,
      sparkline: [120, 145, 132, 168, 190, 210, 245],
    },
    {
      label: 'Production',
      value: variant?.production || 0,
      trend: 'up',
      icon: BarChart3,
      sparkline: [80, 95, 88, 110, 125, 140, 155],
    },
  ];

  if (!variant) {
    return (
      <div className={styles.emptyAnalytics}>
        <BarChart3 className={styles.emptyIcon} />
        <span>Select a variant to view analytics</span>
      </div>
    );
  }

  return (
    <div className={styles.analytics}>
      <div className={styles.metricsGrid}>
        {metrics.map((metric, idx) => (
          <MetricCard key={idx} metric={metric} />
        ))}
      </div>

      <div className={styles.analyticsCharts}>
        <div className={styles.chartCard}>
          <h4>Cost Trend</h4>
          <MiniSparkline data={metrics[0].sparkline || []} color="#6366f1" />
        </div>
        <div className={styles.chartCard}>
          <h4>Popularity</h4>
          <MiniSparkline data={metrics[3].sparkline || []} color="#10b981" />
        </div>
        <div className={styles.chartCard}>
          <h4>Sales</h4>
          <MiniSparkline data={metrics[4].sparkline || []} color="#8b5cf6" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: AnalyticsMetric }) {
  const Icon = metric.icon;

  return (
    <div className={styles.metricCard}>
      <div className={styles.metricHeader}>
        <div className={styles.metricIcon}>
          <Icon />
        </div>
        {metric.trend && (
          <div className={`${styles.metricTrend} ${styles[metric.trend]}`}>
            {metric.trend === 'up' && '↑'}
            {metric.trend === 'down' && '↓'}
            {metric.trend === 'neutral' && '→'}
          </div>
        )}
      </div>
      <div className={styles.metricValue}>{metric.value}</div>
      <div className={styles.metricLabel}>{metric.label}</div>
      {metric.sparkline && (
        <MiniSparkline data={metric.sparkline} color="#6366f1" />
      )}
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={styles.sparkline}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={styles.sparklineSvg}
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import styles from "./BentoGrid.module.css";

interface BentoGridProps {
  children: React.ReactNode;
  variant?: "default" | "condensed" | "spacious";
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function BentoGrid({
  children,
  variant = "default",
  columns = { default: 1, sm: 2, lg: 3 },
}: BentoGridProps) {
  return (
    <div
      className={clsx(
        styles.grid,
        variant === "condensed" && styles.gridCondensed,
        variant === "spacious" && styles.gridSpacious,
      )}
      style={
        {
          "--grid-cols-sm": columns.sm ?? columns.default ?? 1,
          "--grid-cols-md": columns.md ?? columns.sm ?? columns.default ?? 2,
          "--grid-cols-lg": columns.lg ?? columns.md ?? columns.sm ?? columns.default ?? 3,
          "--grid-cols-xl": columns.xl ?? columns.lg ?? columns.md ?? columns.sm ?? columns.default ?? 4,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: React.ReactNode;
  span?: {
    col?: number;
    row?: number;
  };
  className?: string;
  delay?: number;
}

export function BentoItem({
  children,
  span,
  className,
  delay = 0,
}: BentoItemProps) {
  return (
    <motion.div
      className={clsx(styles.item, className)}
      style={
        {
          "--span-col": span?.col ?? 1,
          "--span-row": span?.row ?? 1,
        } as React.CSSProperties
      }
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.05 }}
    >
      {children}
    </motion.div>
  );
}

interface BentoSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function BentoSection({
  title,
  subtitle,
  icon,
  children,
  className,
}: BentoSectionProps) {
  return (
    <section className={clsx(styles.section, className)}>
      <div className={styles.sectionHeader}>
        {icon && <div className={styles.sectionIcon}>{icon}</div>}
        <div className={styles.sectionInfo}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
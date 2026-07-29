"use client";

import { ReactNode, memo } from "react";
import clsx from "clsx";
import styles from "./MasonryLayout.module.css";

interface MasonryLayoutProps {
  children: ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "tight" | "normal" | "loose";
  className?: string;
}

export const MasonryLayout = memo(function MasonryLayout({
  children,
  columns = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = "normal",
  className,
}: MasonryLayoutProps) {
  return (
    <div
      className={clsx(
        styles.masonry,
        styles[`gap-${gap}`],
        className
      )}
      style={
        {
          "--masonry-cols-sm": columns.sm ?? columns.default ?? 1,
          "--masonry-cols-md": columns.md ?? columns.sm ?? columns.default ?? 2,
          "--masonry-cols-lg": columns.lg ?? columns.md ?? columns.sm ?? columns.default ?? 3,
          "--masonry-cols-xl": columns.xl ?? columns.lg ?? columns.md ?? columns.sm ?? columns.default ?? 4,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
});

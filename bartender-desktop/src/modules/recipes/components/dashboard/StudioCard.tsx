import React from 'react';
import styles from './StudioCard.module.css';

interface StudioCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  clickable?: boolean;
  glow?: boolean;
  variant?: 'default' | 'stat' | 'recipe' | 'collection' | 'warning' | 'suggestion';
  onClick?: () => void;
}

export const StudioCard: React.FC<StudioCardProps> = ({
  children,
  className = '',
  hoverable = true,
  clickable = false,
  glow = false,
  variant = 'default',
  onClick,
}) => {
  const classes = [
    styles.studioCard,
    styles[variant],
    hoverable && styles.hoverable,
    clickable && styles.clickable,
    glow && styles.glow,
    onClick && styles.interactive,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} role={clickable ? 'button' : undefined} tabIndex={clickable ? 0 : undefined}>
      {children}
    </div>
  );
};

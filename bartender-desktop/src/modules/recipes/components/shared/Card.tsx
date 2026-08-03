import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  glow = false,
  onClick,
}) => {
  const classes = [
    styles.nebulaCard,
    hoverable && styles.hoverable,
    glow && styles.glow,
    onClick && styles.clickable,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

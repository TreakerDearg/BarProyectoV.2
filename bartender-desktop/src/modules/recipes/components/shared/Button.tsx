import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const classes = [
    styles.nebulaButton,
    styles[variant],
    styles[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};

import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  className?: string;
  // Legacy support: map old color prop to variant
  color?: 'blue' | 'green' | 'red' | 'purple';
}

const variantClasses = {
  primary: 'border-t-shiny-primary',
  success: 'border-t-shiny-success',
  warning: 'border-t-shiny-warning',
  info: 'border-t-shiny-info',
};

export function Card({ children, variant, color, className }: CardProps) {
  // Map legacy color prop to variant if provided
  let finalVariant: 'primary' | 'success' | 'warning' | 'info' = variant || 'primary';
  if (color && !variant) {
    const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
      blue: 'info',
      green: 'success',
      red: 'warning',
      purple: 'primary',
    };
    finalVariant = colorMap[color] || 'primary';
  }

  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200 bg-white shadow-shiny-card',
        'border-t-4',
        variantClasses[finalVariant],
        className
      )}
    >
      {children}
    </div>
  );
}


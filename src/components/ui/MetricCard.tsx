import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface MetricCardProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

const variantGradients = {
  primary: 'bg-shiny-primary',
  success: 'bg-shiny-success',
  warning: 'bg-shiny-warning',
  info: 'bg-shiny-info',
};

export function MetricCard({ children, variant = 'primary', className }: MetricCardProps) {
  return (
    <div
      className={clsx(
        'relative rounded-xl bg-white/80 backdrop-blur-sm',
        'border-t-4',
        variantGradients[variant],
        'shadow-shiny-glass',
        'hover:scale-105 transition-transform duration-200',
        'overflow-hidden',
        className
      )}
    >
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}


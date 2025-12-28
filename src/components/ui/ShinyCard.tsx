import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface ShinyCardProps {
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

export function ShinyCard({ children, variant = 'primary', className }: ShinyCardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl shadow-shiny-card bg-white overflow-hidden',
        className
      )}
    >
      {/* Top gradient border */}
      <div className={clsx('h-1', variantGradients[variant])} />
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}


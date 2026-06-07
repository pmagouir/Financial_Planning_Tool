import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface FintechCardProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

// Variant paints a colored top-border accent (canonical §6 accents).
// "info" shares accent.primary — §6 has no separate info color.
const variantBorder = {
  primary: 'border-t-2 border-t-accent-primary',
  success: 'border-t-2 border-t-accent-success',
  warning: 'border-t-2 border-t-accent-warning',
  info: 'border-t-2 border-t-accent-primary',
};

export function FintechCard({ children, variant, className }: FintechCardProps) {
  return (
    <div
      className={clsx(
        'fintech-card',
        variant && variantBorder[variant],
        className
      )}
    >
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}



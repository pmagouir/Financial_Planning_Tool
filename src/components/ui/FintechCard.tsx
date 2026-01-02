import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface FintechCardProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

export function FintechCard({ children, variant, className }: FintechCardProps) {
  return (
    <div
      className={clsx(
        'fintech-card',
        className
      )}
    >
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}



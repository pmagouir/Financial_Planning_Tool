import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  gradient?: 'primary' | 'success' | 'warning' | 'info';
}

const gradientClasses = {
  primary: 'bg-accent-primary',
  success: 'bg-accent-success',
  warning: 'bg-accent-warning',
  info: 'bg-accent-primary',
};

export function GradientText({ children, className, gradient = 'primary' }: GradientTextProps) {
  return (
    <span
      className={clsx(
        'font-bold bg-clip-text text-transparent',
        gradientClasses[gradient],
        className
      )}
    >
      {children}
    </span>
  );
}



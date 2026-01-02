import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  gradient?: 'primary' | 'success' | 'warning' | 'info';
}

const gradientClasses = {
  primary: 'bg-shiny-primary',
  success: 'bg-shiny-success',
  warning: 'bg-shiny-warning',
  info: 'bg-shiny-info',
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



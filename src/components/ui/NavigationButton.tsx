import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface NavigationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  active?: boolean;
}

const variantClasses = {
  primary: 'bg-shiny-primary',
  success: 'bg-shiny-success',
  warning: 'bg-shiny-warning',
  info: 'bg-shiny-info',
};

export function NavigationButton({
  children,
  variant = 'primary',
  active = false,
  className,
  ...props
}: NavigationButtonProps) {
  return (
    <button
      className={clsx(
        'px-6 py-4 text-lg font-bold rounded-xl',
        'shadow-shiny-lg',
        active
          ? clsx('text-white', variantClasses[variant])
          : 'bg-white text-text-primary hover:bg-surface-light',
        'transition-all duration-200',
        'hover:shadow-shiny-xl hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}


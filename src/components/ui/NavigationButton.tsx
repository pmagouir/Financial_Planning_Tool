import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface NavigationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  active?: boolean;
}

const variantClasses = {
  primary: 'bg-accent-primary',
  success: 'bg-accent-success',
  warning: 'bg-accent-warning',
  info: 'bg-accent-primary',
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
        'shadow-lg',
        active
          ? clsx('text-white', variantClasses[variant])
          : 'bg-white text-text-primary hover:bg-background-subtle',
        'transition-all duration-200',
        'hover:shadow-xl hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}



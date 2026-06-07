import { clsx } from 'clsx';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface GradientBtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'neutral';
  className?: string;
  fullWidth?: boolean;
}

const variantGradients = {
  primary: 'bg-accent-primary',
  success: 'bg-accent-success',
  warning: 'bg-accent-warning',
  info: 'bg-accent-primary',
  neutral: 'bg-background-subtle',
};

export function GradientBtn({ 
  children, 
  variant = 'primary', 
  className,
  fullWidth = false,
  ...props 
}: GradientBtnProps) {
  return (
    <button
      {...props}
      className={clsx(
        'px-6 py-4 text-lg font-bold rounded-xl',
        'text-white',
        variantGradients[variant],
        'shadow-card',
        'hover:-translate-y-1 hover:shadow-card',
        'transition-all duration-200',
        'active:scale-95',
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  );
}



import { clsx } from 'clsx';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface GradientBtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'neutral';
  className?: string;
  fullWidth?: boolean;
}

const variantGradients = {
  primary: 'bg-shiny-primary',
  success: 'bg-shiny-success',
  warning: 'bg-shiny-warning',
  info: 'bg-shiny-info',
  neutral: 'bg-shiny-neutral',
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
        'shadow-shiny-card',
        'hover:-translate-y-1 hover:shadow-shiny-hover',
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


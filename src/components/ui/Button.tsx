import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
}

// The one button treatment ("designed by one hand"): consistent radius, hover, and press.
// The keyboard focus ring is the unified :focus-visible outline in global.css — deliberately
// NOT baked here — so every button, link, and tab share one indicator (WCAG 2.4.11), with no
// double-ring. Variants: primary = solid accent CTA; ghost = quiet bordered secondary action.
const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium ' +
  'transition duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<'primary' | 'ghost', string> = {
  primary: 'bg-accent-primary text-white px-5 py-2.5 shadow-card hover:bg-blue-600',
  ghost:
    'border border-white/10 bg-white/5 text-text-secondary px-4 py-2.5 ' +
    'hover:bg-white/10 hover:text-text-primary',
};

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Stagger offset in seconds when several Reveals sit together. */
  delay?: number;
  className?: string;
}

// A gentle fade + slide-up as the element scrolls into view. Subtle by charter (a planning
// tool, not a marketing page): 12px of travel, 0.45s, once.
//
// Reduced-motion → a plain div, fully visible, no transform (errors.md row 10: content and
// layout never depend on an animation finishing). `once: true` so it never re-triggers, and
// the small viewport margin reveals slightly before the element is fully on screen.
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

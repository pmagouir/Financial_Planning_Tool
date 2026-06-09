import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Stagger offset in seconds when several Reveals sit together. */
  delay?: number;
  className?: string;
}

// A gentle slide-up as the element scrolls into view. Subtle by charter (a planning tool,
// not a marketing page): 14px of travel, 0.5s, once.
//
// errors.md row 10 — content must NEVER depend on an animation frame. So this animates the
// TRANSFORM only and holds opacity at 1 throughout. If requestAnimationFrame is throttled
// (background tab / headless) and the slide never runs, the content simply rests 14px lower —
// fully visible, full contrast — rather than stuck invisible. prefers-reduced-motion → a plain
// div, no motion at all.
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 1, y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

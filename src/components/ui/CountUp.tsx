import { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

// Animated number that counts from its previous value to the target (and from 0 on first
// mount) with an ease-out, then settles. Purposeful motion — it draws the eye to the figure
// the tool is built around, not decoration.
//
// Safety (errors.md row 10 — content must never depend on an animation frame):
// - prefers-reduced-motion → render the target immediately, no animation.
// - A setTimeout safety guarantees the target value lands even if requestAnimationFrame is
//   throttled (background tab / headless), so the number is never stuck mid-roll or at 0.
function useCountUp(target: number, durationMs = 850): number {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState<number>(() => (reduce ? target : 0));
  const fromRef = useRef<number>(reduce ? target : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    if (from === target) return;

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(from + (target - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    // Convergence guarantee even if rAF never fires.
    const safety = setTimeout(() => {
      setDisplay(target);
      fromRef.current = target;
    }, durationMs + 120);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, [target, reduce, durationMs]);

  return display;
}

interface CountUpProps {
  value: number;
  format: (n: number) => string;
  durationMs?: number;
}

// Renders `value` counting up, formatted each frame by `format` (so currency / percent /
// compact formatting all work — the component is format-agnostic).
export function CountUp({ value, format, durationMs }: CountUpProps) {
  const n = useCountUp(value, durationMs);
  return <>{format(n)}</>;
}

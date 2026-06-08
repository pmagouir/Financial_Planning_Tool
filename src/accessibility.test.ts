import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// ── Guard tests for errors.md rows 5, 6, 10 (Pattern 4 — accessibility is measured) ──
// Static guards that lock the accessibility floor: banned-contrast colors never return as
// text, inputs keep their associated labels, the tab nav stays an APG tablist, and motion
// stays reduced-motion-safe. The behavioral pass (keyboard, computed contrast) is the
// jsx-a11y gate + the Claude_Preview observation recorded in the audit.

const SRC = join(process.cwd(), 'src');
const read = (rel: string) => readFileSync(join(SRC, rel), 'utf8');

// Wave 2 deleted all orphan/dead-code, so every .tsx under components/ is now a live
// component and the contrast scan covers the whole tree (no exclusions).
const ORPHAN: string[] = [];

function liveComponentFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...liveComponentFiles(full));
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out.filter((f) => !ORPHAN.some((o) => f.includes(o)));
}

describe('row 5 — contrast (canonical §7)', () => {
  it('no live component carries text in the banned colors #475569 or #64748b', () => {
    const offenders = liveComponentFiles(join(SRC, 'components')).filter((f) =>
      /#475569|#64748b/i.test(readFileSync(f, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });

  it('the input placeholder uses the AA-safe secondary, not #64748b', () => {
    const css = read('styles/global.css');
    expect(css).toMatch(/::placeholder\s*\{\s*color:\s*#94a3b8/);
  });

  it('MoneyInput and RangeSlider helper text uses text-secondary, not text-muted', () => {
    for (const comp of ['components/ui/MoneyInput.tsx', 'components/ui/RangeSlider.tsx']) {
      expect(read(comp)).not.toContain('text-text-muted');
    }
  });
});

describe('row 6 — labels, ARIA, keyboard, focus', () => {
  it('MoneyInput and RangeSlider programmatically associate their label', () => {
    for (const comp of ['components/ui/MoneyInput.tsx', 'components/ui/RangeSlider.tsx']) {
      const src = read(comp);
      expect(src).toContain('useId');
      expect(src).toMatch(/htmlFor=\{[A-Za-z]+Id\}/);
      expect(src).toMatch(/id=\{[A-Za-z]+Id\}/);
      expect(src).toContain('aria-describedby');
    }
  });

  it('NavigationTabs implements the APG Tabs pattern', () => {
    const nav = read('components/NavigationTabs.tsx');
    expect(nav).toContain('role="tablist"');
    expect(nav).toContain('role="tab"');
    expect(nav).toContain('role="tabpanel"');
    expect(nav).toContain('aria-selected');
    expect(nav).toContain('aria-controls="tabpanel-main"');
    expect(nav).toMatch(/tabIndex=\{isActive \? 0 : -1\}/);
  });

  it('every Step 2 slider carries an accessible name (label or aria-label)', () => {
    // Step 2 renders the category name in a separate span, so each RangeSlider must
    // supply its own accessible name via aria-label (caught by live audit, not the linter).
    const step2 = read('components/Step2_RetirementDesign.tsx');
    const sliderCalls = (step2.match(/<RangeSlider/g) || []).length;
    const ariaLabels = (step2.match(/aria-label=/g) || []).length;
    expect(sliderCalls).toBeGreaterThan(0);
    expect(ariaLabels).toBeGreaterThanOrEqual(sliderCalls);
  });

  it('NavigationTabs handles arrow/Home/End keyboard navigation', () => {
    const nav = read('components/NavigationTabs.tsx');
    expect(nav).toContain('handleTablistKeyDown');
    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End']) {
      expect(nav).toContain(key);
    }
  });
});

describe('row 10 — reduced motion', () => {
  it('global.css honors prefers-reduced-motion', () => {
    expect(read('styles/global.css')).toContain('prefers-reduced-motion: reduce');
  });

  it('NavigationTabs gates Framer Motion on useReducedMotion', () => {
    const nav = read('components/NavigationTabs.tsx');
    expect(nav).toContain('useReducedMotion');
    expect(nav).toMatch(/initial=\{reduceMotion \? false/);
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// ── Guard tests for errors.md row 4 (dead-token layer, Pattern 3 — canonical drift) ──
// These lock the token migration: dead `*-shiny-*` classes never return, the @theme
// block stays the single source, and the previously-ignored variant props stay wired.

const SRC = join(process.cwd(), 'src');

function allSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...allSourceFiles(full));
    else if (/\.(tsx?|astro|css)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('row 4 — dead-token layer', () => {
  it('no *-shiny-* class survives anywhere in src/', () => {
    const offenders = allSourceFiles(SRC)
      .filter((f) => !f.endsWith('design-system.test.ts')) // this file names the pattern
      .filter((f) => /shiny/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('global.css declares the canonical §6 palette in an @theme block', () => {
    const css = readFileSync(join(SRC, 'styles/global.css'), 'utf8');
    expect(css).toMatch(/@theme\s*\{/);
    // A representative spread of canonical §6 tokens must be present.
    for (const token of [
      '--color-background:',
      '--color-background-paper:',
      '--color-text-primary:',
      '--color-text-secondary:',
      '--color-accent-primary:',
      '--color-accent-success:',
      '--color-accent-danger:',
    ]) {
      expect(css).toContain(token);
    }
  });

  it('the AA-safe secondary (#94a3b8) is the declared text.secondary token', () => {
    const css = readFileSync(join(SRC, 'styles/global.css'), 'utf8');
    expect(css).toMatch(/--color-text-secondary:\s*#94a3b8/i);
  });

  it('tailwind.config.mjs is gone — @theme is the single token source', () => {
    expect(existsSync(join(process.cwd(), 'tailwind.config.mjs'))).toBe(false);
  });

  it('FintechCard reads its variant prop (the single card implementation)', () => {
    const src = readFileSync(join(SRC, 'components/ui/FintechCard.tsx'), 'utf8');
    expect(src).toMatch(/variant\s*&&\s*variantBorder\[variant\]/);
    expect(src).toContain('border-t-accent-');
  });

  it('one card, not three: MetricCard aliases FintechCard, and the white Card is gone', () => {
    // Consolidated to a single implementation so the variant treatment can never drift.
    const metric = readFileSync(join(SRC, 'components/ui/MetricCard.tsx'), 'utf8');
    expect(metric).toMatch(/export\s*\{\s*FintechCard as MetricCard\s*\}/);
    expect(existsSync(join(SRC, 'components/ui/Card.tsx'))).toBe(false);
  });
});

// ── Wave 3 token hygiene (errors.md row 20 — Pattern 3, canonical drift) ──
// The per-screen pass found off-canonical status hexes that pass contrast but break §6.
// #22c55e → accent.success #10b981; #f97316 → accent.warning #f59e0b. The violet #8b5cf6 is
// now CANONICAL (§6, ratified Wave 3) as the retirement/data-viz accent, so it is not banned —
// but it is large/chart-only; body-size violet uses #a78bfa.
describe('row 20 — off-canonical status hexes', () => {
  it('#22c55e and #f97316 never return anywhere in src/ (use #10b981 / #f59e0b — canonical §6)', () => {
    const offenders = allSourceFiles(SRC)
      .filter((f) => !f.endsWith('design-system.test.ts')) // this file names the pattern
      .filter((f) => /#22c55e|#f97316/i.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

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

  it('FintechCard and MetricCard actually read their variant prop', () => {
    for (const comp of ['components/ui/FintechCard.tsx', 'components/ui/MetricCard.tsx']) {
      const src = readFileSync(join(SRC, comp), 'utf8');
      expect(src).toMatch(/variant\s*&&\s*variantBorder\[variant\]/);
      expect(src).toContain('border-t-accent-');
    }
  });
});
